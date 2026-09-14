import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'seo_history_logs' })
export class SeoHistoryLog extends Document {
  @Prop({ type: String, required: true, index: true })
  entityType: string;

  @Prop({ type: String, required: true, index: true })
  entityId: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  adminEmail: string;

  @Prop({ type: Array, default: [] })
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

export const SeoHistoryLogSchema = SchemaFactory.createForClass(SeoHistoryLog);
