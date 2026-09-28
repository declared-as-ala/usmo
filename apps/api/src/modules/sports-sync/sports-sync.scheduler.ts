import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from '../matches/match.schema';
import { SportsSyncService } from './sports-sync.service';
import { SportsProviderService } from './sports-provider.service';

@Injectable()
export class SportsSyncScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(SportsSyncScheduler.name);
  private lastHourlySyncTime = 0;

  constructor(
    private readonly syncService: SportsSyncService,
    private readonly providerService: SportsProviderService,
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
  ) {}

  /**
   * Run initial bootstrap synchronization if standings are empty in database.
   */
  async onApplicationBootstrap() {
    this.logger.log('SportsSyncScheduler initialized for timezone Africa/Tunis.');
    // Clean up any corrupt old-season rows and ensure official 2026-2027 standings
    this.syncService.purgeCorruptStandings().catch((e) => this.logger.warn(`Standings purge notice: ${e.message}`));

    setTimeout(async () => {
      try {
        const health = await this.syncService.getHealthStatus();
        if (!health.football.lastSuccessfulSyncAt) {
          this.logger.log('No prior football sync found in MongoDB cache. Running initial synchronization...');
          await this.syncService.syncAll('football', 'SYSTEM');
        }
        const bbMatchCount = await this.matchModel.countDocuments({ sport: 'basketball' });
        if (!health.basketball.lastSuccessfulSyncAt || bbMatchCount === 0) {
          this.logger.log('No prior basketball sync or zero basketball matches found in MongoDB. Running basketball sync...');
          await this.syncService.syncAll('basketball', 'SYSTEM');
        }

        // Clean up any stale J1 basketball fixtures with old opponent (Club Africain)
        await this.matchModel.deleteMany({
          sport: 'basketball',
          $or: [
            { slug: 'us-monastir-vs-club-africain-2026-10-18' },
            { slug: 'basketball-us-monastir-vs-club-africain-2026-10-18' },
          ],
        }).catch((e) => this.logger.warn(`Stale match cleanup notice: ${e.message}`));

        // Always sync basketball upcoming fixtures on boot so J1 (CSS Sfax) and J2 (ESS) are guaranteed fresh
        await this.syncService.syncUpcomingMatches('basketball', 'SYSTEM');
      } catch (err: any) {
        this.logger.warn(`Initial bootstrap sync failed: ${err.message}`);
      }
    }, 5000);
  }

  /**
   * Helper: Get current date in Africa/Tunis timezone as YYYY-MM-DD
   */
  private getTunisTodayString(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' });
  }

  /**
   * Helper: Check if today is a matchday for football or basketball in Africa/Tunis.
   */
  private async isTodayMatchday(): Promise<{ matchday: boolean; hasLiveMatch: boolean }> {
    const todayStr = this.getTunisTodayString();

    const [todayMatches, liveMatches] = await Promise.all([
      this.matchModel.find({ date: todayStr }).lean(),
      this.matchModel.find({ status: 'live' }).lean(),
    ]);

    return {
      matchday: todayMatches.length > 0,
      hasLiveMatch: liveMatches.length > 0,
    };
  }

  /**
   * Fast Heartbeat / Live Poller (Runs every 2 minutes):
   * 1. If any match is LIVE -> polls live score & timeline every 2 minutes.
   * 2. If today is a matchday and 60 minutes passed -> triggers hourly matchday standings/results sync.
   */
  @Cron('*/2 * * * *', { timeZone: 'Africa/Tunis' })
  async handleFastHeartbeat() {
    try {
      const { matchday, hasLiveMatch } = await this.isTodayMatchday();

      // 1. Live Match Polling
      if (hasLiveMatch) {
        this.logger.log('Active LIVE match detected. Polling live status...');
        await this.syncService.syncLiveMatches('football', 'CRON');
        await this.syncService.syncLiveMatches('basketball', 'CRON');
      }

      // 2. Hourly Matchday Refresh
      const now = Date.now();
      if (matchday && now - this.lastHourlySyncTime >= 55 * 60 * 1000) {
        this.logger.log('Matchday detected in Africa/Tunis. Running hourly matchday standings & results refresh...');
        this.lastHourlySyncTime = now;
        await this.syncService.syncStandings('football', 'CRON');
        await this.syncService.syncRecentResults('football', 'CRON');
      }
    } catch (err: any) {
      this.logger.warn(`Fast heartbeat check warning: ${err.message}`);
    }
  }

  /**
   * Normal Regular Standings Sync:
   * Every 6 hours (00:00, 06:00, 12:00, 18:00 Africa/Tunis).
   */
  @Cron('0 */6 * * *', { timeZone: 'Africa/Tunis' })
  async handleScheduledStandingsSync() {
    this.logger.log('Running scheduled 6-hour standings synchronization...');
    await this.syncService.syncStandings('football', 'CRON');
    await this.syncService.syncStandings('basketball', 'CRON');
  }

  /**
   * Normal Regular Results Sync:
   * Every 3 hours in Africa/Tunis.
   */
  @Cron('0 */3 * * *', { timeZone: 'Africa/Tunis' })
  async handleScheduledResultsSync() {
    this.logger.log('Running scheduled 3-hour results synchronization...');
    await this.syncService.syncRecentResults('football', 'CRON');
    await this.syncService.syncRecentResults('basketball', 'CRON');
  }

  /**
   * Normal Regular Fixtures Sync:
   * Every 6 hours in Africa/Tunis.
   */
  @Cron('30 */6 * * *', { timeZone: 'Africa/Tunis' })
  async handleScheduledFixturesSync() {
    this.logger.log('Running scheduled 6-hour fixtures synchronization...');
    await this.syncService.syncUpcomingMatches('football', 'CRON');
    await this.syncService.syncUpcomingMatches('basketball', 'CRON');
  }

  /**
   * Nightly Full Sync:
   * Runs at 03:00 Africa/Tunis every night.
   * Completely refreshes standings, fixtures, results, and competitions for all sports.
   */
  @Cron('0 3 * * *', { timeZone: 'Africa/Tunis' })
  async handleNightlyFullSync() {
    this.logger.log('Running Nightly Full Synchronization (03:00 Africa/Tunis)...');
    await this.syncService.syncAll(undefined, 'CRON');
  }
}
