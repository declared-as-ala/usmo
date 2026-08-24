import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiFootballProvider } from './providers/api-football.provider';
import { TheSportsDbProvider } from './providers/thesportsdb.provider';
import { BasketballProvider } from './providers/basketball.provider';
import { SportsConfig } from './schemas/sports-config.schema';
import { SportsDataProvider, SportType } from './interfaces/sports-provider.interface';

@Injectable()
export class SportsProviderService {
  private readonly logger = new Logger(SportsProviderService.name);

  constructor(
    @InjectModel(SportsConfig.name) private readonly sportsConfigModel: Model<SportsConfig>,
    private readonly apiFootballProvider: ApiFootballProvider,
    private readonly theSportsDbProvider: TheSportsDbProvider,
    private readonly basketballProvider: BasketballProvider,
  ) {}

  /**
   * Get active SportsDataProvider for a sport based on configured settings.
   */
  async getProviderForSport(sport: SportType): Promise<{
    provider: SportsDataProvider;
    leagueExternalId: string;
    teamExternalId: string;
    season: string;
    seasonLabel: string;
    enabled: boolean;
  }> {
    const config = await this.getConfig();

    if (sport === 'basketball') {
      const bSettings = config.basketball;
      let provider: SportsDataProvider = this.basketballProvider;
      if (bSettings.provider === 'thesportsdb') {
        provider = this.theSportsDbProvider;
      }
      return {
        provider,
        leagueExternalId: bSettings.leagueExternalId || 'pro-a-basketball',
        teamExternalId: bSettings.teamExternalId || 'bb_usm',
        season: bSettings.currentSeason || '2025-2026',
        seasonLabel: bSettings.currentSeasonLabel || '2025-2026',
        enabled: bSettings.syncEnabled !== false,
      };
    }

    // Default: Football
    const fSettings = config.football;
    let provider: SportsDataProvider = this.apiFootballProvider;
    if (fSettings.provider === 'thesportsdb') {
      provider = this.theSportsDbProvider;
    }

    return {
      provider,
      leagueExternalId: fSettings.leagueExternalId || '202',
      teamExternalId: fSettings.teamExternalId || '992',
      season: fSettings.currentSeason || '2024',
      seasonLabel: fSettings.currentSeasonLabel || '2024-2025',
      enabled: fSettings.syncEnabled !== false,
    };
  }

  /**
   * Retrieve global sports configuration or create defaults if missing.
   */
  async getConfig(): Promise<SportsConfig> {
    let config = await this.sportsConfigModel.findOne({ key: 'global_sports_config' });
    if (!config) {
      config = await this.sportsConfigModel.create({
        key: 'global_sports_config',
        football: {
          provider: 'api-football',
          leagueExternalId: '202',
          teamExternalId: '992',
          currentSeason: '2024',
          currentSeasonLabel: '2024-2025',
          autoDetectSeason: true,
          syncEnabled: true,
          apiKey: '',
        },
        basketball: {
          provider: 'basketball-provider',
          leagueExternalId: 'pro-a-basketball',
          teamExternalId: 'bb_usm',
          currentSeason: '2025-2026',
          currentSeasonLabel: '2025-2026',
          autoDetectSeason: false,
          syncEnabled: true,
          apiKey: '',
        },
        intervals: {
          normalStandingsMinutes: 360,
          matchdayStandingsMinutes: 60,
          liveMatchMinutes: 2,
          normalFixturesMinutes: 360,
          normalResultsMinutes: 180,
          nightlySyncCron: '0 3 * * *',
        },
      });
    }
    return config;
  }
}
