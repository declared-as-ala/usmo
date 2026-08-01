import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SeasonPerformance extends Document {
  @Prop({ type: String, required: true, enum: ['football', 'basketball'] })
  sport: 'football' | 'basketball';

  /** 'league' = domestic league table row; 'continental' = African competition row */
  @Prop({ type: String, required: true, enum: ['league', 'continental'], default: 'league' })
  type: 'league' | 'continental';

  @Prop({ type: String, required: true })
  season: string;

  @Prop({ type: String, default: '' })
  competition: string;

  @Prop({ type: String, default: '' })
  leaguePosition: string;

  @Prop({ type: String, default: '' })
  nationalCompetitions: string;

  @Prop({ type: String, default: '' })
  internationalCompetitions: string;

  @Prop({ type: String, default: '' })
  stageReached: string;

  @Prop({ type: String, default: '' })
  notableOpponents: string;

  @Prop({ type: String, default: '' })
  achievementSummary: string;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  verified: boolean;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const SeasonPerformanceSchema = SchemaFactory.createForClass(SeasonPerformance);

SeasonPerformanceSchema.index({ sport: 1, type: 1 });
SeasonPerformanceSchema.index({ status: 1 });
