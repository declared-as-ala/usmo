import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MatchPrediction extends Document {
  @Prop({ type: String, required: true, index: true })
  matchId: string; // external (SportsDB) event id — the live "next match" has no internal Match document

  @Prop({ type: String, required: true })
  matchLabel: string; // snapshot, e.g. "Hammam-Sousse vs US Monastir — 22/08/2026"

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  homeScore: number;

  @Prop({ type: Number, required: true, min: 0 })
  awayScore: number;
}

export const MatchPredictionSchema = SchemaFactory.createForClass(MatchPrediction);
MatchPredictionSchema.index({ matchId: 1, userId: 1 }, { unique: true });
