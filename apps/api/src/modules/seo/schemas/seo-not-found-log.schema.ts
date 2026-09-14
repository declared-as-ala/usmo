import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'seo_not_found_logs' })
export class SeoNotFoundLog extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  path: string;

  @Prop({ type: Number, default: 1 })
  hits: number;

  @Prop({ type: Date, default: Date.now, index: true })
  lastSeenAt: Date;

  @Prop({ type: [String], default: [] })
  referrers: string[];

  @Prop({ type: Boolean, default: false, index: true })
  resolved: boolean;

  @Prop({ type: String })
  redirectId?: string;
}

export const SeoNotFoundLogSchema = SchemaFactory.createForClass(SeoNotFoundLog);
SeoNotFoundLogSchema.index({ resolved: 1, hits: -1 });
