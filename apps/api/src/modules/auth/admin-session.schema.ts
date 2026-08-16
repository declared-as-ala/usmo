import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AdminSession extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  adminId: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  tokenHash: string;

  @Prop({ type: String, default: 'Unknown Device' })
  device: string;

  @Prop({ type: String, default: 'Unknown Browser' })
  browser: string;

  @Prop({ type: String, default: 'Unknown IP' })
  ip: string;

  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;

  @Prop({ type: Boolean, default: false })
  isRevoked: boolean;
}

export const AdminSessionSchema = SchemaFactory.createForClass(AdminSession);
