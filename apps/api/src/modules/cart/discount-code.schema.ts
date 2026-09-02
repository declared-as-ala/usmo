import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DiscountCode extends Document {
  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  discountPercent: number;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Date, default: null })
  expiresAt?: Date | null;

  @Prop({ type: Number, default: null })
  maxUses?: number | null;

  @Prop({ type: Number, default: 0 })
  usedCount: number;
}

export const DiscountCodeSchema = SchemaFactory.createForClass(DiscountCode);
