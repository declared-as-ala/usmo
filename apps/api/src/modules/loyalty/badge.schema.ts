import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Badge extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  key: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  nameAr: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  descriptionAr: string;

  @Prop({ type: String, default: 'Award' })
  icon: string;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);

@Schema({ timestamps: true })
export class FanBadge extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  badgeKey: string;
}

export const FanBadgeSchema = SchemaFactory.createForClass(FanBadge);
FanBadgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });
