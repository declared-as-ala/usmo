import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserNotification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string; // membership_status | donation_status | reward_status | badge_unlocked | order_status | support_reply

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String })
  link?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isRead: boolean;
}

export const UserNotificationSchema = SchemaFactory.createForClass(UserNotification);
UserNotificationSchema.index({ userId: 1, createdAt: -1 });
