import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reward extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  titleAr: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  descriptionAr: string;

  @Prop({ type: Number, required: true })
  pointsCost: number;

  @Prop({ type: Number, default: null })
  stock?: number | null; // null = unlimited

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

@Schema({ timestamps: true })
export class RewardRedemption extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
  rewardId: Types.ObjectId;

  @Prop({ type: String, required: true })
  rewardTitle: string; // snapshot at redemption time

  @Prop({ type: Number, required: true })
  pointsSpent: number;

  @Prop({ type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' })
  status: 'pending' | 'fulfilled' | 'cancelled';

  @Prop({ type: String })
  adminNote?: string;
}

export const RewardRedemptionSchema = SchemaFactory.createForClass(RewardRedemption);
