import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  adminId: Types.ObjectId;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: String, required: true })
  entityType: string;

  @Prop({ type: String, required: true })
  entityId: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ createdAt: -1 });
