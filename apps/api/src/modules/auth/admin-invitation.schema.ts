import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AdminInvitation extends Document {
  @Prop({ type: String, required: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: String, required: true, unique: true, index: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const AdminInvitationSchema = SchemaFactory.createForClass(AdminInvitation);
