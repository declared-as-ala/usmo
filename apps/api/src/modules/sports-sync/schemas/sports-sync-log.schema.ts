import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class SportsSyncLog extends Document {
  @Prop({ type: String, required: true })
  provider: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: 'football' | 'basketball';

  @Prop({ type: String, required: true, index: true })
  resourceType: string;

  @Prop({ type: String, default: '' })
  competition: string;

  @Prop({ type: String, default: '' })
  season: string;

  @Prop({ type: String, enum: ['SUCCESS', 'FAILED', 'SKIPPED', 'RATE_LIMITED'], default: 'SUCCESS', index: true })
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED';

  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: Number, default: 0 })
  fetchedCount: number;

  @Prop({ type: Number, default: 0 })
  updatedCount: number;

  @Prop({ type: Number, default: 0 })
  skippedCount: number;

  @Prop({ type: Number, default: 0 })
  durationMs: number;

  @Prop({ type: String, enum: ['CRON', 'MANUAL', 'POST_MATCH_TRIGGER', 'SYSTEM'], default: 'CRON', index: true })
  triggeredBy: 'CRON' | 'MANUAL' | 'POST_MATCH_TRIGGER' | 'SYSTEM';

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  details: Record<string, unknown>;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;
}

export const SportsSyncLogSchema = SchemaFactory.createForClass(SportsSyncLog);
SportsSyncLogSchema.index({ createdAt: -1 });
SportsSyncLogSchema.index({ sport: 1, createdAt: -1 });
