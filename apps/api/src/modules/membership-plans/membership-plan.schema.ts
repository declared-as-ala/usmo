import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MembershipPlan extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, default: 0 })
  price: number; // in millimes

  @Prop({ type: Number, required: true })
  durationDays: number;

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop({ type: String })
  badge?: string;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  memberDiscountPercent: number; // auto-applied at checkout for fans with an active membership on this plan
}

export const MembershipPlanSchema = SchemaFactory.createForClass(MembershipPlan);
