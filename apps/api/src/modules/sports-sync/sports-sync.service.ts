import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Standing } from './schemas/standing.schema';
import { SportsSyncStatus } from './schemas/sports-sync-status.schema';
import { SportsSyncLog } from './schemas/sports-sync-log.schema';
import { SportsConfig } from './schemas/sports-config.schema';
import { SportsSyncLock } from './schemas/sports-sync-lock.schema';
import { Match } from '../matches/match.schema';
import { SportsProviderService } from './sports-provider.service';
import {
  FixtureDto,
  SportType,
  StandingDto,
  SyncResourceType,
  SyncTriggerSource,
} from './interfaces/sports-provider.interface';
import { UpdateSportsConfigDto } from './dto/sports-config.dto';
import { MatchManualOverrideDto, StandingManualOverrideDto } from './dto/manual-override.dto';

@Injectable()
export class SportsSyncService {
  private readonly logger = new Logger(SportsSyncService.name);

  constructor(
    @InjectModel(Standing.name) private readonly standingModel: Model<Standing>,
    @InjectModel(SportsSyncStatus.name) private readonly statusModel: Model<SportsSyncStatus>,
    @InjectModel(SportsSyncLog.name) private readonly logModel: Model<SportsSyncLog>,
    @InjectModel(SportsConfig.name) private readonly configModel: Model<SportsConfig>,
    @InjectModel(SportsSyncLock.name) private readonly lockModel: Model<SportsSyncLock>,
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
    private readonly providerService: SportsProviderService,
  ) {}

  /**
   * Acquire a distributed MongoDB lock with TTL to prevent concurrent sync executions.
   */
  private async acquireLock(lockKey: string, ttlMs = 60000): Promise<boolean> {
    const expiresAt = new Date(Date.now() + ttlMs);
    const owner = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      // Clean expired lock if any
      await this.lockModel.deleteOne({ lockKey, expiresAt: { $lt: new Date() } });

      await this.lockModel.create({
        lockKey,
        owner,
        expiresAt,
      });
      return true;
    } catch (e: any) {
      if (e.code === 11000) {
        // Lock already held
        this.logger.debug(`Lock "${lockKey}" is currently held by another worker.`);
        return false;
      }
      this.logger.warn(`Error acquiring lock "${lockKey}": ${e.message}`);
      return false;
    }
  }

  /**
   * Release a distributed lock.
   */
  private async releaseLock(lockKey: string): Promise<void> {
    try {
      await this.lockModel.deleteOne({ lockKey });
    } catch (e: any) {
      this.logger.warn(`Error releasing lock "${lockKey}": ${e.message}`);
    }
  }

  /**
   * Helper to write structured sync logs and update health status.
   */
  private async recordSyncResult(params: {
    provider: string;
    sport: SportType;
    resourceType: SyncResourceType;
    competition: string;
    season: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED';
    message: string;
    fetchedCount: number;
    updatedCount: number;
    skippedCount: number;
    durationMs: number;
    triggeredBy: SyncTriggerSource;
    errorMessage?: string | null;
    details?: Record<string, unknown>;
  }) {
    // 1. Create audit log
    await this.logModel.create({
      provider: params.provider,
      sport: params.sport,
      resourceType: params.resourceType,
      competition: params.competition,
      season: params.season,
      status: params.status,
      message: params.message,
      fetchedCount: params.fetchedCount,
      updatedCount: params.updatedCount,
      skippedCount: params.skippedCount,
      durationMs: params.durationMs,
      triggeredBy: params.triggeredBy,
      details: params.details || {},
      createdAt: new Date(),
    });

    // 2. Update status tracker
    const statusUpdate: Record<string, unknown> = {
      provider: params.provider,
      sport: params.sport,
      resourceType: params.resourceType,
      competitionId: params.competition,
      season: params.season,
      lastAttemptAt: new Date(),
      status: params.status,
      recordsUpdated: params.updatedCount,
      recordsFetched: params.fetchedCount,
      durationMs: params.durationMs,
      errorMessage: params.errorMessage || null,
    };

    if (params.status === 'SUCCESS') {
      statusUpdate.lastSuccessfulSyncAt = new Date();
    }

    await this.statusModel.findOneAndUpdate(
      { sport: params.sport, resourceType: params.resourceType },
      { $set: statusUpdate },
      { upsert: true, new: true },
    );
  }

  /**
   * Validate standings before persisting to protect against destructive/empty overwrites.
   */
  private async validateStandingsResponse(
    sport: SportType,
    season: string,
    rows: StandingDto[],
  ): Promise<{ valid: boolean; reason?: string }> {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return { valid: false, reason: 'Empty standings array received from provider' };
    }

    // Minimum sanity check: must contain at least 4 teams
    if (rows.length < 4) {
      return { valid: false, reason: `Provider returned too few rows (${rows.length} rows, minimum 4 required)` };
    }

    // Check if provider returned all zeros for every team
    const totalPoints = rows.reduce((sum, r) => sum + (r.points || 0), 0);
    const totalPlayed = rows.reduce((sum, r) => sum + (r.played || 0), 0);

    // If existing database already has non-zero records, reject all-zero payload
    const existingCount = await this.standingModel.countDocuments({
      sport,
      season,
      played: { $gt: 0 },
    });

    if (existingCount > 0 && totalPoints === 0 && totalPlayed === 0) {
      return {
        valid: false,
        reason: `Provider returned all-zero stats (0 played, 0 pts) while database already has ${existingCount} valid active records`,
      };
    }

    return { valid: true };
  }

  /**
   * Synchronize Standings for football or basketball.
   */
  async syncStandings(sport: SportType = 'football', triggeredBy: SyncTriggerSource = 'CRON'): Promise<{
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED';
    updated: number;
    fetched: number;
    message: string;
  }> {
    const lockKey = `sync:${sport}:standings`;
    const lockAcquired = await this.acquireLock(lockKey, 30000);
    if (!lockAcquired) {
      return { status: 'SKIPPED', updated: 0, fetched: 0, message: 'Sync already in progress (locked)' };
    }

    const startTime = Date.now();
    let providerName = 'unknown';
    let season = 'unknown';
    let competitionId = 'unknown';

    try {
      const { provider, leagueExternalId, season: activeSeason, enabled } =
        await this.providerService.getProviderForSport(sport);

      providerName = provider.providerName;
      season = activeSeason;
      competitionId = leagueExternalId;

      if (!enabled) {
        this.logger.log(`Sync disabled for ${sport}. Skipping.`);
        return { status: 'SKIPPED', updated: 0, fetched: 0, message: `Sync disabled for ${sport}` };
      }

      this.logger.log(`Sports sync started - Provider: ${providerName}, Sport: ${sport}, League: ${leagueExternalId}, Season: ${season}`);

      const rows = await provider.getStandings(leagueExternalId, season);
      const fetchedCount = rows ? rows.length : 0;

      // Validation
      const validation = await this.validateStandingsResponse(sport, season, rows);
      if (!validation.valid) {
        const errorMsg = `Aucune donnée valide reçue (${validation.reason}) — données existantes conservées.`;
        this.logger.warn(`Standings validation failed for ${sport}: ${validation.reason}`);

        await this.recordSyncResult({
          provider: providerName,
          sport,
          resourceType: 'standings',
          competition: competitionId,
          season,
          status: 'SKIPPED',
          message: errorMsg,
          fetchedCount,
          updatedCount: 0,
          skippedCount: fetchedCount,
          durationMs: Date.now() - startTime,
          triggeredBy,
          errorMessage: validation.reason,
        });

        return { status: 'SKIPPED', updated: 0, fetched: fetchedCount, message: errorMsg };
      }

      let updatedCount = 0;
      let skippedCount = 0;

      // Safe Upsert each standing row
      for (const row of rows) {
        // Check if there is an active manual override for this team
        const existing = await this.standingModel.findOne({
          competitionId,
          season,
          teamName: row.teamName,
        });

        const isManualOverrideActive =
          existing?.manualOverride &&
          (!existing.manualOverrideUntil || existing.manualOverrideUntil > new Date());

        if (isManualOverrideActive) {
          skippedCount++;
          continue;
        }

        await this.standingModel.findOneAndUpdate(
          {
            competitionId,
            season,
            teamName: row.teamName,
          },
          {
            $set: {
              competitionId,
              sport,
              season,
              position: row.position,
              teamId: row.teamId,
              teamName: row.teamName,
              teamLogo: row.teamLogo || existing?.teamLogo || null,
              played: row.played,
              won: row.won,
              drawn: row.drawn,
              lost: row.lost,
              goalsFor: row.goalsFor,
              goalsAgainst: row.goalsAgainst,
              goalDifference: row.goalDifference,
              points: row.points,
              form: row.form || '',
              isUSM: row.isUSM,
              dataSource: existing?.dataSource === 'MANUAL' ? 'HYBRID' : 'EXTERNAL_API',
              providerUpdatedAt: new Date(),
              syncedAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
        updatedCount++;
      }

      const durationMs = Date.now() - startTime;
      const successMsg = `${updatedCount} équipes mises à jour (${skippedCount} ignorées/manuelles)`;
      this.logger.log(`Sports sync finished - Fetched: ${fetchedCount}, Updated: ${updatedCount}, Duration: ${durationMs}ms`);

      await this.recordSyncResult({
        provider: providerName,
        sport,
        resourceType: 'standings',
        competition: competitionId,
        season,
        status: 'SUCCESS',
        message: successMsg,
        fetchedCount,
        updatedCount,
        skippedCount,
        durationMs,
        triggeredBy,
      });

      return { status: 'SUCCESS', updated: updatedCount, fetched: fetchedCount, message: successMsg };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = `Sync error: ${err.message}`;
      this.logger.error(`Error in syncStandings (${sport}): ${err.message}`, err.stack);

      await this.recordSyncResult({
        provider: providerName,
        sport,
        resourceType: 'standings',
        competition: competitionId,
        season,
        status: 'FAILED',
        message: errorMsg,
        fetchedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        durationMs,
        triggeredBy,
        errorMessage: err.message,
      });

      return { status: 'FAILED', updated: 0, fetched: 0, message: errorMsg };
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Helper to format slugs for matches
   */
  private generateMatchSlug(f: FixtureDto): string {
    const base = `${f.homeTeam.name}-vs-${f.awayTeam.name}-${f.date.slice(0, 10)}`;
    return base
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Synchronize Upcoming Matches / Fixtures.
   */
  async syncUpcomingMatches(sport: SportType = 'football', triggeredBy: SyncTriggerSource = 'CRON') {
    const lockKey = `sync:${sport}:fixtures`;
    const lockAcquired = await this.acquireLock(lockKey, 30000);
    if (!lockAcquired) {
      return { status: 'SKIPPED', updated: 0, fetched: 0, message: 'Sync already in progress' };
    }

    const startTime = Date.now();
    let providerName = 'unknown';
    let competitionId = 'unknown';
    let season = 'unknown';

    try {
      const { provider, teamExternalId, leagueExternalId, season: activeSeason, enabled } =
        await this.providerService.getProviderForSport(sport);

      providerName = provider.providerName;
      competitionId = leagueExternalId;
      season = activeSeason;

      if (!enabled) {
        return { status: 'SKIPPED', updated: 0, fetched: 0, message: 'Sync disabled' };
      }

      const fixtures = await provider.getFixtures(teamExternalId, leagueExternalId, season);
      const fetchedCount = fixtures ? fixtures.length : 0;
      let updatedCount = 0;

      for (const f of fixtures) {
        const slug = this.generateMatchSlug(f);
        const existing = await this.matchModel.findOne({
          $or: [{ externalId: f.externalId }, { slug }],
        });

        if (existing?.manualOverride) {
          continue;
        }

        await this.matchModel.findOneAndUpdate(
          { $or: [{ externalId: f.externalId }, { slug }] },
          {
            $set: {
              externalId: f.externalId,
              slug: existing?.slug || slug,
              sport: f.sport,
              competitionId: f.competitionId || competitionId,
              competition: f.competition,
              competitionAr: f.competitionAr || f.competition,
              season: f.season,
              homeTeam: f.homeTeam.name,
              homeTeamAr: f.homeTeam.nameAr || f.homeTeam.name,
              homeLogo: f.homeTeam.logo || existing?.homeLogo || '',
              awayTeam: f.awayTeam.name,
              awayTeamAr: f.awayTeam.nameAr || f.awayTeam.name,
              awayLogo: f.awayTeam.logo || existing?.awayLogo || '',
              date: f.date.slice(0, 10),
              time: f.time,
              venue: f.venue || existing?.venue || 'Stade Mustapha Ben Jannet',
              venueAr: f.venueAr || existing?.venueAr || 'ملعب مصطفى بن جنات',
              status: f.status,
              score: {
                home: f.score.home ?? 0,
                away: f.score.away ?? 0,
              },
              dataSource: 'EXTERNAL_API',
              providerUpdatedAt: new Date(),
              syncedAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
        updatedCount++;
      }

      const durationMs = Date.now() - startTime;
      const successMsg = `${updatedCount} matchs à venir synchronisés`;

      await this.recordSyncResult({
        provider: providerName,
        sport,
        resourceType: 'fixtures',
        competition: competitionId,
        season,
        status: 'SUCCESS',
        message: successMsg,
        fetchedCount,
        updatedCount,
        skippedCount: fetchedCount - updatedCount,
        durationMs,
        triggeredBy,
      });

      return { status: 'SUCCESS', updated: updatedCount, fetched: fetchedCount, message: successMsg };
    } catch (err: any) {
      this.logger.error(`Error in syncUpcomingMatches: ${err.message}`);
      await this.recordSyncResult({
        provider: providerName,
        sport,
        resourceType: 'fixtures',
        competition: competitionId,
        season,
        status: 'FAILED',
        message: err.message,
        fetchedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        durationMs: Date.now() - startTime,
        triggeredBy,
        errorMessage: err.message,
      });
      return { status: 'FAILED', updated: 0, fetched: 0, message: err.message };
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Synchronize Recent Results.
   */
  async syncRecentResults(sport: SportType = 'football', triggeredBy: SyncTriggerSource = 'CRON', limit = 10) {
    const lockKey = `sync:${sport}:results`;
    const lockAcquired = await this.acquireLock(lockKey, 30000);
    if (!lockAcquired) {
      return { status: 'SKIPPED', updated: 0, fetched: 0, message: 'Sync already in progress' };
    }

    const startTime = Date.now();
    let providerName = 'unknown';
    let competitionId = 'unknown';
    let season = 'unknown';

    try {
      const { provider, teamExternalId, leagueExternalId, season: activeSeason, enabled } =
        await this.providerService.getProviderForSport(sport);

      providerName = provider.providerName;
      competitionId = leagueExternalId;
      season = activeSeason;

      if (!enabled) {
        return { status: 'SKIPPED', updated: 0, fetched: 0, message: 'Sync disabled' };
      }

      const results = await provider.getResults(teamExternalId, leagueExternalId, season, limit);
      const fetchedCount = results ? results.length : 0;
      let updatedCount = 0;

      for (const r of results) {
        const slug = this.generateMatchSlug(r);
        const existing = await this.matchModel.findOne({
          $or: [{ externalId: r.externalId }, { slug }],
        });

        if (existing?.manualOverride) {
          continue;
        }

        await this.matchModel.findOneAndUpdate(
          { $or: [{ externalId: r.externalId }, { slug }] },
          {
            $set: {
              externalId: r.externalId,
              slug: existing?.slug || slug,
              sport: r.sport,
              competitionId: r.competitionId || competitionId,
              competition: r.competition,
              competitionAr: r.competitionAr || r.competition,
              season: r.season,
              homeTeam: r.homeTeam.name,
              homeTeamAr: r.homeTeam.nameAr || r.homeTeam.name,
              homeLogo: r.homeTeam.logo || existing?.homeLogo || '',
              awayTeam: r.awayTeam.name,
              awayTeamAr: r.awayTeam.nameAr || r.awayTeam.name,
              awayLogo: r.awayTeam.logo || existing?.awayLogo || '',
              date: r.date.slice(0, 10),
              time: r.time,
              venue: r.venue || existing?.venue || 'Stade Mustapha Ben Jannet',
              venueAr: r.venueAr || existing?.venueAr || 'ملعب مصطفى بن جنات',
              status: 'finished',
              score: {
                home: r.score.home ?? existing?.score?.home ?? 0,
                away: r.score.away ?? existing?.score?.away ?? 0,
              },
              dataSource: 'EXTERNAL_API',
              providerUpdatedAt: new Date(),
              syncedAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
        updatedCount++;
      }

      const durationMs = Date.now() - startTime;
      const successMsg = `${updatedCount} résultats passés synchronisés`;

      await this.recordSyncResult({
        provider: providerName,
        sport,
        resourceType: 'results',
        competition: competitionId,
        season,
        status: 'SUCCESS',
        message: successMsg,
        fetchedCount,
        updatedCount,
        skippedCount: fetchedCount - updatedCount,
        durationMs,
        triggeredBy,
      });

      return { status: 'SUCCESS', updated: updatedCount, fetched: fetchedCount, message: successMsg };
    } catch (err: any) {
      this.logger.error(`Error in syncRecentResults: ${err.message}`);
      await this.recordSyncResult({
        provider: providerName,
        sport,
        resourceType: 'results',
        competition: competitionId,
        season,
        status: 'FAILED',
        message: err.message,
        fetchedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        durationMs: Date.now() - startTime,
        triggeredBy,
        errorMessage: err.message,
      });
      return { status: 'FAILED', updated: 0, fetched: 0, message: err.message };
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Synchronize currently live matches. Detects if a match changed from LIVE -> FINISHED.
   */
  async syncLiveMatches(sport: SportType = 'football', triggeredBy: SyncTriggerSource = 'CRON') {
    try {
      const { provider, teamExternalId, leagueExternalId, enabled } =
        await this.providerService.getProviderForSport(sport);

      if (!enabled) return;

      const liveFixtures = await provider.getLiveMatches(teamExternalId, leagueExternalId);
      if (!liveFixtures || liveFixtures.length === 0) {
        return;
      }

      for (const live of liveFixtures) {
        const existing = await this.matchModel.findOne({ externalId: live.externalId });
        const previousStatus = existing?.status;

        // Update live stats & timeline
        await this.matchModel.findOneAndUpdate(
          { externalId: live.externalId },
          {
            $set: {
              status: live.status,
              score: {
                home: live.score.home ?? existing?.score?.home ?? 0,
                away: live.score.away ?? existing?.score?.away ?? 0,
              },
              timeline: live.timeline || existing?.timeline || [],
              stats: live.stats || existing?.stats || {},
              providerUpdatedAt: new Date(),
              syncedAt: new Date(),
            },
          },
        );

        // Immediate post-match trigger when status transitions from LIVE to FINISHED
        if (previousStatus === 'live' && live.status === 'finished') {
          this.logger.log(`Match ${live.externalId} transitioned from LIVE to FINISHED. Triggering post-match sync.`);
          await this.handleMatchFinished(live.externalId, sport);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Live match sync check warning: ${err.message}`);
    }
  }

  /**
   * Immediate Post-Match Execution:
   * When a match ends, fetch final details, update result, and immediately refresh standings!
   */
  async handleMatchFinished(matchExternalId?: string, sport: SportType = 'football') {
    this.logger.log(`Executing immediate post-match sync routine for ${sport}...`);
    try {
      // 1. If external ID provided, fetch full match timeline & stats
      if (matchExternalId) {
        const { provider } = await this.providerService.getProviderForSport(sport);
        const detailedMatch = await provider.getMatch(matchExternalId);
        if (detailedMatch) {
          await this.matchModel.findOneAndUpdate(
            { externalId: matchExternalId },
            {
              $set: {
                status: 'finished',
                score: {
                  home: detailedMatch.score.home ?? 0,
                  away: detailedMatch.score.away ?? 0,
                },
                timeline: detailedMatch.timeline || [],
                stats: detailedMatch.stats || {},
                syncedAt: new Date(),
              },
            },
          );
        }
      }

      // 2. Immediately refresh standings
      await this.syncStandings(sport, 'POST_MATCH_TRIGGER');

      // 3. Immediately refresh recent results list
      await this.syncRecentResults(sport, 'POST_MATCH_TRIGGER', 10);

      this.logger.log(`Post-match sync routine completed successfully for ${sport}.`);
    } catch (err: any) {
      this.logger.error(`Error in handleMatchFinished: ${err.message}`);
    }
  }

  /**
   * Full Synchronizer (Standings + Fixtures + Results) for a sport or all sports.
   */
  async syncAll(sport?: SportType, triggeredBy: SyncTriggerSource = 'MANUAL') {
    const sportsToSync: SportType[] = sport ? [sport] : ['football', 'basketball'];
    const results: Record<string, unknown> = {};

    for (const s of sportsToSync) {
      const standingsRes = await this.syncStandings(s, triggeredBy);
      const fixturesRes = await this.syncUpcomingMatches(s, triggeredBy);
      const resultsRes = await this.syncRecentResults(s, triggeredBy);

      results[s] = {
        standings: standingsRes,
        fixtures: fixturesRes,
        results: resultsRes,
      };
    }

    return results;
  }

  /**
   * Get sports synchronization health summary.
   */
  async getHealthStatus() {
    const statuses = await this.statusModel.find().lean();
    const config = await this.providerService.getConfig();

    const footballStatuses = statuses.filter((s) => s.sport === 'football');
    const basketballStatuses = statuses.filter((s) => s.sport === 'basketball');

    const footballHealthy = !footballStatuses.some((s) => s.status === 'FAILED');
    const basketballHealthy = !basketballStatuses.some((s) => s.status === 'FAILED');

    // Last successful standing update
    const lastStandingFootball = footballStatuses.find((s) => s.resourceType === 'standings');
    const lastStandingBasketball = basketballStatuses.find((s) => s.resourceType === 'standings');

    return {
      football: {
        provider: config.football.provider,
        healthy: footballHealthy,
        currentLeagueId: config.football.leagueExternalId,
        currentSeason: config.football.currentSeason,
        currentSeasonLabel: config.football.currentSeasonLabel,
        syncEnabled: config.football.syncEnabled,
        apiKeyStatus: (process.env.API_FOOTBALL_KEY || config.football.apiKey) ? 'Configured' : 'Missing',
        lastSuccessfulSyncAt: lastStandingFootball?.lastSuccessfulSyncAt || null,
        lastAttemptAt: lastStandingFootball?.lastAttemptAt || null,
        lastStatus: lastStandingFootball?.status || 'UNKNOWN',
        lastError: lastStandingFootball?.errorMessage || null,
      },
      basketball: {
        provider: config.basketball.provider,
        healthy: basketballHealthy,
        currentLeagueId: config.basketball.leagueExternalId,
        currentSeason: config.basketball.currentSeason,
        currentSeasonLabel: config.basketball.currentSeasonLabel,
        syncEnabled: config.basketball.syncEnabled,
        apiKeyStatus: config.basketball.apiKey ? 'Configured' : 'Internal/Configured',
        lastSuccessfulSyncAt: lastStandingBasketball?.lastSuccessfulSyncAt || null,
        lastAttemptAt: lastStandingBasketball?.lastAttemptAt || null,
        lastStatus: lastStandingBasketball?.status || 'UNKNOWN',
        lastError: lastStandingBasketball?.errorMessage || null,
      },
      statuses,
      serverTime: new Date().toISOString(),
      timezone: 'Africa/Tunis',
    };
  }

  /**
   * Query synchronized standings from MongoDB cache.
   */
  async getPublicStandings(sport: SportType = 'football', season?: string) {
    const config = await this.providerService.getConfig();
    const targetSeason = season || (sport === 'football' ? config.football.currentSeason : config.basketball.currentSeason);

    const standings = await this.standingModel
      .find({ sport, season: targetSeason })
      .sort({ position: 1 })
      .lean();

    // If target season has 0 rows, fallback to any available season with data
    if (standings.length === 0) {
      const fallbackStandings = await this.standingModel
        .find({ sport })
        .sort({ season: -1, position: 1 })
        .lean();
      return fallbackStandings;
    }

    return standings;
  }

  /**
   * Query data freshness information for public frontend.
   */
  async getDataFreshness(sport: SportType = 'football') {
    const status = await this.statusModel.findOne({ sport, resourceType: 'standings' }).lean();
    const lastSyncAt = status?.lastSuccessfulSyncAt || status?.lastAttemptAt || new Date();

    return {
      sport,
      lastSyncAt,
      lastStatus: status?.status || 'SUCCESS',
      serverTime: new Date(),
    };
  }

  /**
   * Query sync audit logs with pagination and filters.
   */
  async getSyncLogs(page = 1, limit = 20, sport?: string, status?: string) {
    const filter: Record<string, unknown> = {};
    if (sport) filter.sport = sport;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.logModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.logModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update sports configuration (Super Admin only).
   */
  async updateConfig(dto: UpdateSportsConfigDto) {
    const config = await this.providerService.getConfig();

    if (dto.football) {
      config.football = {
        ...config.football,
        ...dto.football,
      } as any;
    }
    if (dto.basketball) {
      config.basketball = {
        ...config.basketball,
        ...dto.basketball,
      } as any;
    }
    if (dto.intervals) {
      config.intervals = {
        ...config.intervals,
        ...dto.intervals,
      } as any;
    }

    await config.save();
    return this.providerService.getConfig();
  }

  /**
   * Apply manual override on standing row.
   */
  async overrideStanding(id: string, dto: StandingManualOverrideDto) {
    const standing = await this.standingModel.findById(id);
    if (!standing) throw new NotFoundException('Standing not found');

    if (typeof dto.manualOverride === 'boolean') standing.manualOverride = dto.manualOverride;
    if (dto.manualOverrideUntil !== undefined) {
      standing.manualOverrideUntil = dto.manualOverrideUntil ? new Date(dto.manualOverrideUntil) : null;
    }
    if (typeof dto.position === 'number') standing.position = dto.position;
    if (typeof dto.played === 'number') standing.played = dto.played;
    if (typeof dto.won === 'number') standing.won = dto.won;
    if (typeof dto.drawn === 'number') standing.drawn = dto.drawn;
    if (typeof dto.lost === 'number') standing.lost = dto.lost;
    if (typeof dto.goalsFor === 'number') standing.goalsFor = dto.goalsFor;
    if (typeof dto.goalsAgainst === 'number') standing.goalsAgainst = dto.goalsAgainst;
    if (typeof dto.goalDifference === 'number') standing.goalDifference = dto.goalDifference;
    if (typeof dto.points === 'number') standing.points = dto.points;
    if (typeof dto.form === 'string') standing.form = dto.form;

    standing.dataSource = standing.manualOverride ? 'MANUAL' : 'HYBRID';
    await standing.save();
    return standing;
  }

  /**
   * Apply manual override on match.
   */
  async overrideMatch(id: string, dto: MatchManualOverrideDto) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    if (typeof dto.manualOverride === 'boolean') (match as any).manualOverride = dto.manualOverride;
    if (dto.manualOverrideUntil !== undefined) {
      (match as any).manualOverrideUntil = dto.manualOverrideUntil ? new Date(dto.manualOverrideUntil) : null;
    }
    if (dto.homeTeam) match.homeTeam = dto.homeTeam;
    if (dto.awayTeam) match.awayTeam = dto.awayTeam;
    if (dto.date) match.date = dto.date;
    if (dto.time) match.time = dto.time;
    if (dto.venue) match.venue = dto.venue;
    if (dto.status) match.status = dto.status;
    if (dto.score) match.score = dto.score;

    (match as any).dataSource = (match as any).manualOverride ? 'MANUAL' : 'HYBRID';
    await match.save();

    // If an admin manually marks match as finished, trigger post-match sync
    if (dto.status === 'finished') {
      await this.handleMatchFinished(match.slug, match.sport);
    }

    return match;
  }
}
