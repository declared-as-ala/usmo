import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class SportIntegrationSettings {
  @Prop({ type: String, default: 'api-football' })
  provider: string;

  @Prop({ type: String, default: '202' })
  leagueExternalId: string;

  @Prop({ type: String, default: '992' })
  teamExternalId: string;

  @Prop({ type: String, default: '2024' })
  currentSeason: string;

  @Prop({ type: String, default: '2024-2025' })
  currentSeasonLabel: string;

  @Prop({ type: Boolean, default: true })
  autoDetectSeason: boolean;

  @Prop({ type: Boolean, default: true })
  syncEnabled: boolean;

  @Prop({ type: String, default: '' })
  apiKey: string;
}

@Schema({ _id: false })
export class SyncIntervalsSettings {
  @Prop({ type: Number, default: 360 }) // 6 hours
  normalStandingsMinutes: number;

  @Prop({ type: Number, default: 60 }) // 1 hour
  matchdayStandingsMinutes: number;

  @Prop({ type: Number, default: 2 }) // 2 minutes
  liveMatchMinutes: number;

  @Prop({ type: Number, default: 360 }) // 6 hours
  normalFixturesMinutes: number;

  @Prop({ type: Number, default: 180 }) // 3 hours
  normalResultsMinutes: number;

  @Prop({ type: String, default: '0 3 * * *' }) // 03:00 Africa/Tunis
  nightlySyncCron: string;
}

@Schema({ timestamps: true })
export class SportsConfig extends Document {
  @Prop({ type: String, default: 'global_sports_config', unique: true })
  key: string;

  @Prop({ type: SportIntegrationSettings, default: () => ({
    provider: 'api-football',
    leagueExternalId: '202',
    teamExternalId: '992',
    currentSeason: '2026-2027',
    currentSeasonLabel: '2026–2027',
    autoDetectSeason: true,
    syncEnabled: true,
    apiKey: '',
  }) })
  football: SportIntegrationSettings;

  @Prop({ type: SportIntegrationSettings, default: () => ({
    provider: 'thesportsdb',
    leagueExternalId: '4828',
    teamExternalId: '139871',
    currentSeason: '2026-2027',
    currentSeasonLabel: '2026-2027',
    autoDetectSeason: false,
    syncEnabled: true,
    apiKey: '',
  }) })
  basketball: SportIntegrationSettings;

  @Prop({ type: SyncIntervalsSettings, default: () => ({
    normalStandingsMinutes: 360,
    matchdayStandingsMinutes: 60,
    liveMatchMinutes: 2,
    normalFixturesMinutes: 360,
    normalResultsMinutes: 180,
    nightlySyncCron: '0 3 * * *',
  }) })
  intervals: SyncIntervalsSettings;
}

export const SportsConfigSchema = SchemaFactory.createForClass(SportsConfig);
