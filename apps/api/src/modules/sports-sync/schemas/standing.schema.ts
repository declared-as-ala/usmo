import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Standing extends Document {
  @Prop({ type: String, required: true, index: true })
  competitionId: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: 'football' | 'basketball';

  @Prop({ type: String, required: true, index: true })
  season: string;

  @Prop({ type: Number, required: true })
  position: number;

  @Prop({ type: String, required: true })
  teamId: string;

  @Prop({ type: String, required: true })
  teamName: string;

  @Prop({ type: String, default: null })
  teamLogo: string | null;

  @Prop({ type: Number, default: 0 })
  played: number;

  @Prop({ type: Number, default: 0 })
  won: number;

  @Prop({ type: Number, default: 0 })
  drawn: number;

  @Prop({ type: Number, default: 0 })
  lost: number;

  @Prop({ type: Number, default: 0 })
  goalsFor: number;

  @Prop({ type: Number, default: 0 })
  goalsAgainst: number;

  @Prop({ type: Number, default: 0 })
  goalDifference: number;

  @Prop({ type: Number, default: 0 })
  points: number;

  @Prop({ type: String, default: '' })
  form: string;

  @Prop({ type: Boolean, default: false, index: true })
  isUSM: boolean;

  @Prop({ type: String, enum: ['EXTERNAL_API', 'MANUAL', 'HYBRID'], default: 'EXTERNAL_API' })
  dataSource: 'EXTERNAL_API' | 'MANUAL' | 'HYBRID';

  @Prop({ type: Boolean, default: false })
  manualOverride: boolean;

  @Prop({ type: Date, default: null })
  manualOverrideUntil?: Date | null;

  @Prop({ type: Date, default: null })
  providerUpdatedAt?: Date | null;

  @Prop({ type: Date, default: Date.now })
  syncedAt: Date;
}

export const StandingSchema = SchemaFactory.createForClass(Standing);
StandingSchema.index({ competitionId: 1, season: 1, teamName: 1 }, { unique: true });
StandingSchema.index({ sport: 1, season: 1, position: 1 });
StandingSchema.index({ competitionId: 1, season: 1, position: 1 });
