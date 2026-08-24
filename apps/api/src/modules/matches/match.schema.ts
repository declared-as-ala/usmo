import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class MatchEvent {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Number, required: true })
  time: number;

  @Prop({ type: String, required: true, enum: ['goal', 'basket', 'card-yellow', 'card-red', 'foul', 'substitution', 'timeout'] })
  type: string;

  @Prop({ type: String, required: true, enum: ['home', 'away'] })
  team: 'home' | 'away';

  @Prop({ type: String, required: true })
  player: string;

  @Prop({ type: String, default: '' })
  playerAr: string;

  @Prop({ type: String })
  detail?: string;

  @Prop({ type: String })
  detailAr?: string;
}
const MatchEventSchema = SchemaFactory.createForClass(MatchEvent);

@Schema({ _id: false })
class SideCount {
  @Prop({ type: Number, default: 0 })
  home: number;

  @Prop({ type: Number, default: 0 })
  away: number;
}
const SideCountSchema = SchemaFactory.createForClass(SideCount);

@Schema({ timestamps: true })
export class Match extends Document {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: 'football' | 'basketball';

  @Prop({ type: String, default: null })
  competitionId: string | null;

  @Prop({ type: String, required: true })
  competition: string;

  @Prop({ type: String, default: '' })
  competitionAr: string;

  @Prop({ type: String, required: true })
  season: string;

  @Prop({ type: String, required: true })
  homeTeam: string;

  @Prop({ type: String, default: '' })
  homeTeamAr: string;

  @Prop({ type: String, default: '' })
  homeLogo: string;

  @Prop({ type: String, required: true })
  awayTeam: string;

  @Prop({ type: String, default: '' })
  awayTeamAr: string;

  @Prop({ type: String, default: '' })
  awayLogo: string;

  @Prop({ type: String, required: true, index: true })
  date: string;

  @Prop({ type: String, default: '' })
  time: string;

  @Prop({ type: String, default: '' })
  venue: string;

  @Prop({ type: String, default: '' })
  venueAr: string;

  @Prop({ type: String, required: true, enum: ['upcoming', 'live', 'finished'], default: 'upcoming', index: true })
  status: 'upcoming' | 'live' | 'finished';

  @Prop({ type: { home: Number, away: Number }, default: () => ({ home: 0, away: 0 }) })
  score: { home: number; away: number };

  @Prop({ type: { home: [Number], away: [Number] }, default: null })
  quarters?: { home: number[]; away: number[] } | null;

  @Prop({ type: [MatchEventSchema], default: [] })
  timeline: MatchEvent[];

  @Prop({
    type: {
      possession: { type: SideCountSchema, required: false },
      shots: { type: SideCountSchema, required: false },
      shotsOnTarget: { type: SideCountSchema, required: false },
      corners: { type: SideCountSchema, required: false },
      fouls: { type: SideCountSchema, required: false },
      offsides: { type: SideCountSchema, required: false },
      rebounds: { type: SideCountSchema, required: false },
      assists: { type: SideCountSchema, required: false },
      threePointers: { type: SideCountSchema, required: false },
    },
    default: {},
  })
  stats: Record<string, { home: number; away: number }>;

  @Prop({ type: { home: [String], away: [String] }, default: null })
  lineups?: { home: string[]; away: string[] } | null;

  @Prop({ type: String, default: '' })
  referee: string;

  @Prop({ type: String, default: '' })
  sponsorLogo: string;

  @Prop({ type: String, default: '' })
  sponsorName: string;

  @Prop({ type: String, default: null, index: true })
  externalId?: string | null;

  @Prop({ type: String, enum: ['EXTERNAL_API', 'MANUAL', 'HYBRID', 'manual', 'sportsdb'], default: 'MANUAL' })
  dataSource?: string;

  @Prop({ type: Boolean, default: false })
  manualOverride?: boolean;

  @Prop({ type: Date, default: null })
  manualOverrideUntil?: Date | null;

  @Prop({ type: Date, default: null })
  providerUpdatedAt?: Date | null;

  @Prop({ type: Date, default: Date.now })
  syncedAt?: Date;

  @Prop({ type: String, enum: ['manual', 'sportsdb'], default: 'manual' })
  source: 'manual' | 'sportsdb';
}

export const MatchSchema = SchemaFactory.createForClass(Match);
MatchSchema.index({ sport: 1, date: 1 });
MatchSchema.index({ sport: 1, status: 1 });
MatchSchema.index({ externalId: 1 });

