import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OrderItem extends Document {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  size: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number; // in millimes

  @Prop({ type: Number, required: true })
  subtotal: number; // in millimes
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class StatusHistoryEntry extends Document {
  @Prop({ type: String, required: true })
  status: 'pending' | 'confirmed' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';

  @Prop({ type: Date, required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String })
  notes?: string;
}

export const StatusHistoryEntrySchema = SchemaFactory.createForClass(StatusHistoryEntry);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  orderNumber: string; // e.g. ORD-8743

  @Prop({ type: String, index: true })
  userId?: string; // set when the order is placed by a logged-in fan; absent for guest checkout

  @Prop({
    type: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String },
    },
    required: true,
  })
  customer: {
    name: string;
    phone: string;
    city: string;
    address?: string;
  };

  @Prop({ type: String, required: true, enum: ['delivery', 'pickup'], default: 'delivery' })
  deliveryMethod: 'delivery' | 'pickup';

  @Prop({ type: String })
  deliveryZoneId?: string;

  @Prop({ type: String })
  pickupPointId?: string;

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items: OrderItem[];

  @Prop({ type: Number, required: true })
  subtotal: number; // in millimes

  @Prop({ type: Number, required: true, default: 0 })
  shippingCost: number; // in millimes

  @Prop({ type: Number, required: true, default: 0 })
  discount: number; // in millimes

  @Prop({ type: Number, required: true })
  total: number; // in millimes

  @Prop({ type: String })
  couponApplied?: string;

  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'prepared', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'confirmed' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';

  @Prop({ type: [StatusHistoryEntrySchema], default: [] })
  statusHistory: StatusHistoryEntry[];

  @Prop({ type: String })
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
