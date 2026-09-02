import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.schema';
import { Product } from '../products/product.schema';
import { CartService } from '../cart/cart.service';
import { BadgesService } from '../loyalty/badges.service';
import { NotificationsService } from '../notifications/notifications.service';

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  prepared: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly cartService: CartService,
    private readonly badgesService: BadgesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: any): Promise<Order> {
    // 1. Calculate pricing and validate stock using CartService
    const calc = await this.cartService.calculateCart({
      items: dto.items,
      deliveryZoneId: dto.deliveryZoneId,
      pickupPointId: dto.pickupPointId,
      couponCode: dto.couponCode,
    }, dto.userId);

    if (calc.errors && calc.errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation de commande échouée',
        errors: calc.errors,
      });
    }

    // 2. Reserve stock in database
    for (const item of calc.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) continue;

      if (product.variants && product.variants.length > 0) {
        const variantIdx = product.variants.findIndex((v) => v.size === item.size);
        if (variantIdx !== -1) {
          product.variants[variantIdx].stock = Math.max(0, product.variants[variantIdx].stock - item.quantity);
          product.markModified('variants');
        }
      } else {
        product.lowStockThreshold = Math.max(0, product.lowStockThreshold - item.quantity);
      }
      await product.save();
    }

    // 3. Generate unique order reference number
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}-${rand}`;

    // 4. Create and save order
    const createdOrder = new this.orderModel({
      orderNumber,
      userId: dto.userId,
      customer: {
        name: dto.customerName,
        phone: dto.customerPhone,
        city: dto.customerCity,
        address: dto.customerAddress,
      },
      deliveryMethod: dto.deliveryMethod,
      deliveryZoneId: dto.deliveryZoneId,
      pickupPointId: dto.pickupPointId,
      items: calc.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      subtotal: calc.subtotal,
      shippingCost: calc.shippingCost,
      discount: calc.discount,
      total: calc.total,
      couponApplied: calc.couponApplied,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          updatedAt: new Date(),
          notes: 'Commande créée par le client.',
        },
      ],
      notes: dto.notes,
    });

    const saved = await createdOrder.save();

    if (calc.couponApplied) {
      await this.cartService.incrementDiscountCodeUsage(calc.couponApplied);
    }

    if (dto.userId) {
      await this.badgesService.unlock(dto.userId, 'first-order');
    }

    return saved;
  }

  async findOneByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderNumber }).exec();
    if (!order) {
      throw new NotFoundException(`Commande introuvable: ${orderNumber}`);
    }
    return order;
  }

  async findMine(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findAll(query: any): Promise<{ orders: Order[]; total: number }> {
    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
        { 'customer.name': { $regex: query.search, $options: 'i' } },
        { 'customer.phone': { $regex: query.search, $options: 'i' } },
      ];
    }

    const total = await this.orderModel.countDocuments(filter).exec();
    const orders = await this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return { orders, total };
  }

  async updateStatus(id: string, newStatus: string, notes?: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Commande introuvable`);
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      return order;
    }

    // Ledger Rule: Restore stock if cancelled
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId).exec();
        if (!product) continue;

        if (product.variants && product.variants.length > 0) {
          const variantIdx = product.variants.findIndex((v) => v.size === item.size);
          if (variantIdx !== -1) {
            product.variants[variantIdx].stock += item.quantity;
            product.markModified('variants');
          }
        } else {
          product.lowStockThreshold += item.quantity;
        }
        await product.save();
      }
    }
    
    // Ledger Rule: Re-deduct stock if un-cancelled
    if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId).exec();
        if (!product) continue;

        if (product.variants && product.variants.length > 0) {
          const variantIdx = product.variants.findIndex((v) => v.size === item.size);
          if (variantIdx !== -1) {
            product.variants[variantIdx].stock = Math.max(0, product.variants[variantIdx].stock - item.quantity);
            product.markModified('variants');
          }
        } else {
          product.lowStockThreshold = Math.max(0, product.lowStockThreshold - item.quantity);
        }
        await product.save();
      }
    }

    order.status = newStatus as any;
    order.statusHistory.push({
      status: newStatus as any,
      updatedAt: new Date(),
      notes: notes || `Changement de statut par l'administrateur.`,
    } as any);

    const saved = await order.save();

    if (order.userId) {
      await this.notificationsService.create(
        order.userId,
        'order_status',
        'Mise à jour de commande',
        `Votre commande ${order.orderNumber} est maintenant : ${ORDER_STATUS_LABEL[newStatus] || newStatus}.`,
        '/compte/commandes',
      );
    }

    return saved;
  }

  async delete(id: string): Promise<void> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Commande introuvable`);
    }

    // Restore stock if pending or confirmed order is deleted without cancellation
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId).exec();
        if (!product) continue;

        if (product.variants && product.variants.length > 0) {
          const variantIdx = product.variants.findIndex((v) => v.size === item.size);
          if (variantIdx !== -1) {
            product.variants[variantIdx].stock += item.quantity;
            product.markModified('variants');
          }
        } else {
          product.lowStockThreshold += item.quantity;
        }
        await product.save();
      }
    }

    await this.orderModel.findByIdAndDelete(id).exec();
  }
}
