import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliveryZone } from './delivery-zone.schema';
import { PickupPoint } from './pickup-point.schema';
import { DiscountCode } from './discount-code.schema';
import { Product } from '../products/product.schema';
import { MembershipsService } from '../memberships/memberships.service';

interface CartCalculationItemDto {
  productId: string;
  size: string;
  quantity: number;
  customName?: string;
  customNumber?: string;
}

interface CartCalculationDto {
  items: CartCalculationItemDto[];
  deliveryZoneId?: string;
  pickupPointId?: string;
  couponCode?: string;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(DeliveryZone.name) private deliveryZoneModel: Model<DeliveryZone>,
    @InjectModel(PickupPoint.name) private pickupPointModel: Model<PickupPoint>,
    @InjectModel(DiscountCode.name) private discountCodeModel: Model<DiscountCode>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async getDeliveryZones(): Promise<DeliveryZone[]> {
    return this.deliveryZoneModel.find({ active: true }).sort({ price: 1 }).exec();
  }

  async getPickupPoints(): Promise<PickupPoint[]> {
    return this.pickupPointModel.find({ active: true }).sort({ name: 1 }).exec();
  }

  async calculateCart(dto: CartCalculationDto, userId?: string) {
    const calculatedItems = [];
    let subtotal = 0;
    const errors: string[] = [];

    // 1. Process items
    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product || product.status !== 'published') {
        errors.push(`Produit introuvable ou archivé: ${item.productId}`);
        continue;
      }

      // Check variant size and stock
      const variant = product.variants?.find((v) => v.size === item.size);
      const stock = variant ? variant.stock : product.lowStockThreshold; // fallback to product stock threshold if no variants
      
      const isAvailable = stock >= item.quantity;
      if (!isAvailable) {
        errors.push(
          `Stock insuffisant pour "${product.name}" (${item.size}): demandé ${item.quantity}, disponible ${stock}`
        );
      }

      const itemPrice = product.price; // in millimes
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      calculatedItems.push({
        productId: product._id.toString(),
        name: product.name,
        nameFr: product.nameFr || product.name,
        nameAr: product.nameAr || product.name,
        coverImage: product.coverImage,
        size: item.size,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
        inStock: isAvailable,
        availableStock: stock,
        customName: item.customName || undefined,
        customNumber: item.customNumber || undefined,
      });
    }

    // 2. Shipping calculation
    let shippingCost = 0;
    let selectedZone = null;
    let selectedPoint = null;

    if (dto.pickupPointId) {
      selectedPoint = await this.pickupPointModel.findById(dto.pickupPointId).exec();
      shippingCost = 0; // free pickup in store
    } else if (dto.deliveryZoneId) {
      selectedZone = await this.deliveryZoneModel.findById(dto.deliveryZoneId).exec();
      if (selectedZone) {
        shippingCost = selectedZone.price;
      }
    }

    // 3. Discount calculation — coupon code vs. active-membership discount, best one wins (no stacking)
    let couponDiscountPercent = 0;
    if (dto.couponCode) {
      const code = dto.couponCode.toUpperCase().trim();
      const discountCode = await this.discountCodeModel.findOne({ code }).exec();
      if (!discountCode) {
        errors.push(`Code promo invalide: ${dto.couponCode}`);
      } else if (!discountCode.active) {
        errors.push(`Code promo désactivé: ${dto.couponCode}`);
      } else if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
        errors.push(`Code promo expiré: ${dto.couponCode}`);
      } else if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
        errors.push(`Code promo épuisé: ${dto.couponCode}`);
      } else {
        couponDiscountPercent = discountCode.discountPercent;
      }
    }

    const memberDiscountPercent = userId ? await this.membershipsService.getActiveDiscountPercent(userId) : 0;

    let discountPercent = 0;
    let discountSource: 'coupon' | 'member' | null = null;
    if (couponDiscountPercent >= memberDiscountPercent && couponDiscountPercent > 0) {
      discountPercent = couponDiscountPercent;
      discountSource = 'coupon';
    } else if (memberDiscountPercent > 0) {
      discountPercent = memberDiscountPercent;
      discountSource = 'member';
    }

    const discount = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0;

    const total = Math.max(0, subtotal + shippingCost - discount);

    return {
      items: calculatedItems,
      subtotal,
      shippingCost,
      discount,
      total,
      couponApplied: discountSource === 'coupon' ? dto.couponCode : null,
      memberDiscountApplied: discountSource === 'member',
      discountPercent,
      deliveryZone: selectedZone,
      pickupPoint: selectedPoint,
      errors,
    };
  }

  // Admin: Delivery Zone CRUD
  async createDeliveryZone(dto: any) {
    return new this.deliveryZoneModel(dto).save();
  }

  async updateDeliveryZone(id: string, dto: any) {
    const zone = await this.deliveryZoneModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!zone) throw new Error(`Zone de livraison introuvable: ${id}`);
    return zone;
  }

  async deleteDeliveryZone(id: string) {
    await this.deliveryZoneModel.findByIdAndDelete(id).exec();
  }

  // Admin: Pickup Point CRUD
  async createPickupPoint(dto: any) {
    return new this.pickupPointModel(dto).save();
  }

  async updatePickupPoint(id: string, dto: any) {
    const point = await this.pickupPointModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!point) throw new Error(`Point de retrait introuvable: ${id}`);
    return point;
  }

  async deletePickupPoint(id: string) {
    await this.pickupPointModel.findByIdAndDelete(id).exec();
  }

  // Admin: Discount Code CRUD
  async findDiscountCodes() {
    return this.discountCodeModel.find().sort({ createdAt: -1 }).exec();
  }

  async createDiscountCode(dto: any) {
    const code = dto.code?.toUpperCase().trim();
    const exists = await this.discountCodeModel.findOne({ code }).exec();
    if (exists) throw new Error(`Ce code promo existe déjà: ${code}`);
    return new this.discountCodeModel({ ...dto, code }).save();
  }

  async updateDiscountCode(id: string, dto: any) {
    const update: any = { ...dto };
    if (dto.code) update.code = dto.code.toUpperCase().trim();
    const code = await this.discountCodeModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!code) throw new Error(`Code promo introuvable: ${id}`);
    return code;
  }

  async deleteDiscountCode(id: string) {
    await this.discountCodeModel.findByIdAndDelete(id).exec();
  }

  async incrementDiscountCodeUsage(code: string) {
    await this.discountCodeModel.updateOne(
      { code: code.toUpperCase().trim() },
      { $inc: { usedCount: 1 } },
    ).exec();
  }
}
