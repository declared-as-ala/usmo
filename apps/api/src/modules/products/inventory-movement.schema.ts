import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class InventoryMovement extends Document {
  @Prop({ type: String, required: true, index: true })
  productId: string;

  @Prop({ type: String, required: true, index: true })
  variantId: string;

  @Prop({ type: String, required: true })
  size: string;

  @Prop({ type: Number, required: true })
  previousStock: number;

  @Prop({ type: Number, required: true })
  quantityChange: number; // negative for decrease, positive for increase

  @Prop({ type: Number, required: true })
  newStock: number;

  @Prop({
    type: String,
    required: true,
    enum: ['ORDER_CREATED', 'ORDER_CANCELLED', 'ADMIN_ADJUSTMENT', 'RETURN', 'MANUAL_CORRECTION'],
    index: true,
  })
  reason: string;

  @Prop({ type: String })
  orderId?: string;

  @Prop({ type: String })
  adminId?: string;

  @Prop({ type: String })
  notes?: string;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);
