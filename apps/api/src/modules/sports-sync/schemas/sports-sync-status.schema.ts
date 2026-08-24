import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SportsSyncStatus extends Document {
  @Prop({ type: String, required: true })
  provider: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: 'football' | 'basketball';

  @Prop({ type: String, required: true, enum: ['standings', 'fixtures', 'results', 'live', 'all'], index: true })
  resourceType: 'standings' | 'fixtures' | 'results' | 'live' | 'all';

  @Prop({ type: String, default: '' })
  competitionId: string;

  @Prop({ type: String, default: '' })
  season: string;

  @Prop({ type: Date, default: Date.now })
  lastAttemptAt: Date;

  @Prop({ type: Date, default: null })
  lastSuccessfulSyncAt: Date | null;

  @Prop({ type: String, enum: ['SUCCESS', 'FAILED', 'SKIPPED', 'RATE_LIMITED', 'IN_PROGRESS'], default: 'SUCCESS' })
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED' | 'IN_PROGRESS';

  @Prop({ type: Number, default: 0 })
  recordsUpdated: number;

  @Prop({ type: Number, default: 0 })
  recordsFetched: number;

  @Prop({ type: Number, default: 0 })
  durationMs: number;

  @Prop({ type: String, default: null })
  errorMessage: string | null;

  @Prop({ type: Date, default: null })
  nextScheduledSync: Date | null;
}

export const SportsSyncStatusSchema = SchemaFactory.createForClass(SportsSyncStatus);
SportsSyncStatusSchema.index({ sport: 1, resourceType: 1 }, { unique: true });
