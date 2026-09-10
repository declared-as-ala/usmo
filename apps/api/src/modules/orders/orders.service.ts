import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.schema';
import { Product } from '../products/product.schema';
import { InventoryMovement } from '../products/inventory-movement.schema';
import { CartService } from '../cart/cart.service';
import { BadgesService } from '../loyalty/badges.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

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
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(InventoryMovement.name) private inventoryModel: Model<InventoryMovement>,
    private readonly cartService: CartService,
    private readonly badgesService: BadgesService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  // ── Atomic variant stock decrement ───────────────────────────────────────
  private async atomicDecrementVariant(
    productId: string,
    variantId: string,
    size: string,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    // Find the product and the variant index
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new ConflictException({ code: 'PRODUCT_NOT_FOUND', message: 'Produit introuvable.' });

    const variantIdx = product.variants?.findIndex((v) => (v as any)._id?.toString() === variantId || v.size === size) ?? -1;
    if (variantIdx === -1) {
      throw new ConflictException({ code: 'VARIANT_NOT_FOUND', message: `Variante introuvable pour la taille ${size}.` });
    }

    const variant = product.variants[variantIdx];
    const previousStock = variant.stock;

    if (previousStock < quantity) {
      throw new ConflictException({
        code: 'INSUFFICIENT_STOCK',
        message: `Stock insuffisant pour la taille ${size}: demandé ${quantity}, disponible ${previousStock}.`,
      });
    }

    // Atomic decrement with concurrency guard
    const filter: any = { _id: productId };
    filter[`variants.${variantIdx}.stock`] = { $gte: quantity };

    const update: any = {
      $inc: { [`variants.${variantIdx}.stock`]: -quantity },
    };

    const result = await this.productModel.updateOne(filter, update).exec();

    if (result.modifiedCount === 0) {
      // Re-check to give a precise error
      const fresh = await this.productModel.findById(productId).exec();
      const freshVariant = fresh?.variants?.[variantIdx];
      throw new ConflictException({
        code: 'INSUFFICIENT_STOCK',
        message: `Stock insuffisant pour la taille ${size}: demandé ${quantity}, disponible ${freshVariant?.stock ?? 0}.`,
      });
    }

    // Recalculate product-level stock and status
    await this.recalculateProductStock(productId);

    // Audit log
    const newStock = previousStock - quantity;
    await new this.inventoryModel({
      productId,
      variantId,
      size,
      previousStock,
      quantityChange: -quantity,
      newStock,
      reason: 'ORDER_CREATED',
      orderId,
    }).save();
  }

  // ── Atomic variant stock restore ─────────────────────────────────────────
  private async atomicRestoreVariant(
    productId: string,
    variantId: string,
    size: string,
    quantity: number,
    orderId: string,
    reason: string,
  ): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const variantIdx = product.variants?.findIndex((v) => (v as any)._id?.toString() === variantId || v.size === size) ?? -1;
    if (variantIdx === -1) return;

    const previousStock = product.variants[variantIdx].stock;

    const filter: any = { _id: productId };
    filter[`variants.${variantIdx}.stock`] = { $gte: 0 };

    const update: any = {
      $inc: { [`variants.${variantIdx}.stock`]: quantity },
    };

    await this.productModel.updateOne(filter, update).exec();
    await this.recalculateProductStock(productId);

    const newStock = previousStock + quantity;
    await new this.inventoryModel({
      productId,
      variantId,
      size,
      previousStock,
      quantityChange: quantity,
      newStock,
      reason,
      orderId,
    }).save();
  }

  // ── Recalculate product-level stockQuantity and stockStatus ──────────────
  private async recalculateProductStock(productId: string): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) return;

    const totalRemaining = (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    const hasActiveVariantWithStock = (product.variants || []).some((v) => v.isActive !== false && v.stock > 0);

    await this.productModel.updateOne(
      { _id: productId },
      {
        $set: {
          stockQuantity: totalRemaining,
          stockStatus: hasActiveVariantWithStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
        },
      },
    ).exec();
  }

  async create(dto: any): Promise<Order> {
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Le panier est vide.');
    }

    // Validate each item
    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product || product.status !== 'published') {
        throw new ConflictException({
          code: 'PRODUCT_UNAVAILABLE',
          message: `Le produit "${product?.name || item.productId}" n'est plus disponible.`,
        });
      }

      if (!item.size || item.size.trim() === '') {
        throw new BadRequestException({
          code: 'SIZE_REQUIRED',
          message: 'Veuillez sélectionner une taille.',
        });
      }

      // Find matching variant
      const variant = product.variants?.find((v) => v.size === item.size && v.isActive !== false);
      if (!variant) {
        throw new ConflictException({
          code: 'VARIANT_UNAVAILABLE',
          message: `La taille "${item.size}" n'est pas disponible pour "${product.name}".`,
        });
      }

      if (variant.stock < (item.quantity || 1)) {
        throw new ConflictException({
          code: 'INSUFFICIENT_STOCK',
          message: variant.stock === 0
            ? `La taille ${item.size} est épuisée pour "${product.name}".`
            : `Il ne reste que ${variant.stock} article(s) en taille ${item.size} pour "${product.name}".`,
        });
      }
    }

    // Calculate pricing
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

    // Generate order number
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}-${rand}`;

    // Create order (stock not yet decremented)
    const createdOrder = new this.orderModel({
      orderNumber,
      userId: dto.userId,
      customer: {
        name: dto.customerName,
        phone: dto.customerPhone,
        city: dto.customerCity,
        address: dto.customerAddress,
        email: dto.customerEmail,
      },
      deliveryMethod: dto.deliveryMethod,
      deliveryZoneId: dto.deliveryZoneId,
      pickupPointId: dto.pickupPointId,
      items: calc.items.map((item: any, idx: number) => {
        const fallback = dto.items?.[idx];
        const product = calc.items[idx];
        // Find the variant to get its _id
        return {
          productId: item.productId,
          variantId: (product as any).variantId || fallback?.variantId || undefined,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          image: item.coverImage,
          customName: item.customName || fallback?.customName || undefined,
          customNumber: item.customNumber || fallback?.customNumber || undefined,
        };
      }),
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

    // Atomically decrement stock for each item
    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) continue;

      const variant = product.variants?.find((v) => v.size === item.size);
      if (variant) {
        await this.atomicDecrementVariant(
          item.productId,
          (variant as any)._id?.toString() || variant.id,
          item.size,
          item.quantity || 1,
          saved._id.toString(),
        );
      }
    }

    // Mark inventory as reserved
    await this.orderModel.updateOne(
      { _id: saved._id },
      { $set: { inventoryReservedAt: new Date() } },
    ).exec();

    if (calc.couponApplied) {
      await this.cartService.incrementDiscountCodeUsage(calc.couponApplied);
    }

    if (dto.userId) {
      await this.badgesService.unlock(dto.userId, 'first-order');
    }

    // Send confirmation email
    if (dto.customerEmail) {
      try {
        await this.mailService.sendOrderConfirmationEmail({
          to: dto.customerEmail,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerCity: dto.customerCity,
          customerAddress: dto.customerAddress,
          orderNumber,
          items: saved.items.map((it: any) => ({
            name: it.name,
            size: it.size,
            quantity: it.quantity,
            price: it.price,
            subtotal: it.subtotal,
            customName: it.customName,
            customNumber: it.customNumber,
          })),
          subtotal: calc.subtotal,
          shippingCost: calc.shippingCost,
          discount: calc.discount,
          total: calc.total,
        });
      } catch (err: any) {
        this.logger.error(`Failed to send order confirmation email: ${err.message}`, err.stack);
      }
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
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to + 'T23:59:59.999Z');
    }
    if (query.deliveryMethod) {
      filter.deliveryMethod = query.deliveryMethod;
    }

    const total = await this.orderModel.countDocuments(filter).exec();
    const orders = await this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return { orders, total };
  }

  // ── Idempotent status update with stock management ──────────────────────
  async updateStatus(id: string, newStatus: string, notes?: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Commande introuvable`);
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      return order;
    }

    // Idempotent: restore stock only if not already released
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      if (!order.inventoryReleasedAt) {
        for (const item of order.items) {
          if (item.variantId) {
            await this.atomicRestoreVariant(
              item.productId,
              item.variantId,
              item.size,
              item.quantity,
              id,
              'ORDER_CANCELLED',
            );
          }
        }
        await this.orderModel.updateOne(
          { _id: id },
          { $set: { inventoryReleasedAt: new Date() } },
        ).exec();
      }
    }

    // Idempotent: re-reserve stock only if not already reserved
    if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
      if (order.inventoryReleasedAt && !order.inventoryReservedAt) {
        for (const item of order.items) {
          if (item.variantId) {
            await this.atomicDecrementVariant(
              item.productId,
              item.variantId,
              item.size,
              item.quantity,
              id,
            );
          }
        }
        await this.orderModel.updateOne(
          { _id: id },
          { $set: { inventoryReservedAt: new Date(), inventoryReleasedAt: null } },
        ).exec();
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

  async update(id: string, dto: any): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    if (dto.status && dto.status !== order.status) {
      await this.updateStatus(id, dto.status, dto.notes || dto.privateNote);
    }

    const updated = await this.orderModel.findById(id).exec();
    if (!updated) {
      throw new NotFoundException('Commande introuvable');
    }

    if (dto.customer) {
      updated.customer = {
        name: dto.customer.name ?? updated.customer.name,
        phone: dto.customer.phone ?? updated.customer.phone,
        phone2: dto.customer.phone2 ?? (updated.customer as any).phone2,
        city: dto.customer.city ?? updated.customer.city,
        address: dto.customer.address ?? updated.customer.address,
        email: dto.customer.email ?? updated.customer.email,
      };
    }

    if (dto.shippingCompany !== undefined) updated.shippingCompany = dto.shippingCompany;
    if (dto.trackingNumber !== undefined) updated.trackingNumber = dto.trackingNumber;
    if (dto.privateNote !== undefined) updated.privateNote = dto.privateNote;
    if (dto.isExchange !== undefined) updated.isExchange = dto.isExchange;
    if (dto.notes !== undefined) updated.notes = dto.notes;
    if (dto.items !== undefined) updated.items = dto.items;
    if (dto.subtotal !== undefined) updated.subtotal = dto.subtotal;
    if (dto.shippingCost !== undefined) updated.shippingCost = dto.shippingCost;
    if (dto.total !== undefined) updated.total = dto.total;

    return updated.save();
  }

  async delete(id: string): Promise<void> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Commande introuvable`);
    }

    // Restore stock if not cancelled and not already released
    if (order.status !== 'cancelled' && !order.inventoryReleasedAt) {
      for (const item of order.items) {
        if (item.variantId) {
          await this.atomicRestoreVariant(
            item.productId,
            item.variantId,
            item.size,
            item.quantity,
            id,
            'ORDER_CANCELLED',
          );
        }
      }
    }

    await this.orderModel.findByIdAndDelete(id).exec();
  }

  // ── Export helpers ───────────────────────────────────────────────────────
  async findAllForExport(query: any): Promise<Order[]> {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
        { 'customer.name': { $regex: query.search, $options: 'i' } },
        { 'customer.phone': { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to + 'T23:59:59.999Z');
    }
    if (query.deliveryMethod) filter.deliveryMethod = query.deliveryMethod;

    return this.orderModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
    const filter: any = {};
    if (productId) filter.productId = productId;
    return this.inventoryModel.find(filter).sort({ createdAt: -1 }).limit(500).lean().exec();
  }
}
