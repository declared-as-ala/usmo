import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CompetitionSummaryDto,
  FixtureDto,
  MatchEventDto,
  SportsDataProvider,
  StandingDto,
  TeamProfileDto,
} from '../interfaces/sports-provider.interface';

const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io';
const DEFAULT_API_KEY = 'a8fdbbee6ec41f67af25add57631e1a1';
const USM_TEAM_ID = '992';

@Injectable()
export class ApiFootballProvider implements SportsDataProvider {
  readonly providerName = 'api-football';
  private readonly logger = new Logger(ApiFootballProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private get apiKey(): string {
    return (
      this.configService.get<string>('API_FOOTBALL_KEY') ||
      process.env.API_FOOTBALL_KEY ||
      DEFAULT_API_KEY
    );
  }

  private get baseUrl(): string {
    return (
      this.configService.get<string>('API_FOOTBALL_BASE_URL') ||
      process.env.API_FOOTBALL_BASE_URL ||
      DEFAULT_BASE_URL
    );
  }

  /**
   * Safe fetch with retry, timeout, exponential backoff, and error handling.
   */
  private async request<T>(endpoint: string, retries = 2, delayMs = 500): Promise<T | null> {
    const url = `${this.baseUrl}${endpoint}`;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          headers: {
            'x-apisports-key': this.apiKey,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          this.logger.warn(`API-Football rate-limited on ${endpoint}. Attempt ${attempt + 1}/${retries + 1}`);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
            continue;
          }
          throw new Error('API-Football rate limit exceeded');
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from API-Football on ${endpoint}`);
        }

        const data = await response.json();
        if (data.errors && Object.keys(data.errors).length > 0 && !Array.isArray(data.errors)) {
          this.logger.warn(`API-Football response errors on ${endpoint}: ${JSON.stringify(data.errors)}`);
        }
        return data as T;
      } catch (err: any) {
        if (attempt === retries) {
          this.logger.error(`API-Football failed after ${retries + 1} attempts on ${endpoint}: ${err.message}`);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
    return null;
  }

  /**
   * Normalize season string (e.g. '2026-2027' -> '2026', or '2024/2025' -> '2024')
   * API-Football requires a strict 4-digit integer year for the season query parameter.
   */
  private normalizeSeason(season?: string): string {
    if (!season) return '2024';
    const match = season.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return match[1];
    const digits = season.replace(/[^\d]/g, '');
    return digits.length >= 4 ? digits.slice(0, 4) : '2024';
  }

  /**
   * Fetch standings for a league and season.
   */
  async getStandings(leagueExternalId: string, season: string): Promise<StandingDto[]> {
    const targetSeason = this.normalizeSeason(season);
    let data = await this.request<any>(`/standings?league=${leagueExternalId}&season=${targetSeason}`);

    let standingsRows = data?.response?.[0]?.league?.standings?.[0];

    // Fallback if target season has no standings on API-Football yet (e.g. 2026 before season starts)
    if (!Array.isArray(standingsRows) || standingsRows.length === 0) {
      const yearNum = parseInt(targetSeason, 10);
      const fallbackYears = [String(yearNum - 1), '2025', '2024'].filter(
        (y) => y !== targetSeason && parseInt(y, 10) >= 2023,
      );

      for (const fallbackYear of fallbackYears) {
        this.logger.log(
          `Standings empty for league ${leagueExternalId} season ${targetSeason}. Trying fallback season ${fallbackYear}...`,
        );
        const fallbackData = await this.request<any>(`/standings?league=${leagueExternalId}&season=${fallbackYear}`);
        const rows = fallbackData?.response?.[0]?.league?.standings?.[0];
        if (Array.isArray(rows) && rows.length > 0) {
          standingsRows = rows;
          this.logger.log(`Found ${rows.length} standings rows on fallback season ${fallbackYear}`);
          break;
        }
      }
    }

    if (!Array.isArray(standingsRows) || standingsRows.length === 0) {
      return [];
    }

    return standingsRows.map((row: any, idx: number) => {
      const isUSM =
        String(row.team?.id) === USM_TEAM_ID ||
        (row.team?.name && row.team.name.toLowerCase().includes('monastir'));

      const played = Number(row.all?.played ?? row.played ?? 0);
      const won = Number(row.all?.win ?? row.win ?? 0);
      const drawn = Number(row.all?.draw ?? row.draw ?? 0);
      const lost = Number(row.all?.lose ?? row.lose ?? 0);
      const goalsFor = Number(row.all?.goals?.for ?? row.goalsFor ?? 0);
      const goalsAgainst = Number(row.all?.goals?.against ?? row.goalsAgainst ?? 0);
      const goalDiff = Number(row.goalsDiff ?? row.goalDifference ?? (goalsFor - goalsAgainst));
      const points = Number(row.points ?? 0);
      const position = Number(row.rank ?? idx + 1);

      return {
        position,
        teamId: String(row.team?.id ?? idx + 1),
        teamName: row.team?.name === 'US Monastirienne' ? 'US Monastir' : (row.team?.name || `Team ${idx + 1}`),
        teamLogo: row.team?.logo || null,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference: goalDiff,
        points,
        form: row.form || null,
        isUSM,
        rawStats: row.all || {},
      };
    });
  }

  /**
   * Helper to normalize a raw fixture item.
   */
  private normalizeFixture(item: any): FixtureDto {
    const fixture = item.fixture || {};
    const league = item.league || {};
    const teams = item.teams || {};
    const goals = item.goals || {};
    const score = item.score || {};

    const homeIsUSM =
      String(teams.home?.id) === USM_TEAM_ID ||
      (teams.home?.name && teams.home.name.toLowerCase().includes('monastir'));
    const awayIsUSM =
      String(teams.away?.id) === USM_TEAM_ID ||
      (teams.away?.name && teams.away.name.toLowerCase().includes('monastir'));

    const rawStatus = fixture.status?.short || 'NS';
    let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
    const finishedStatuses = ['FT', 'AET', 'PEN', 'FINISHED'];
    const liveStatuses = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'];

    if (finishedStatuses.includes(rawStatus)) {
      status = 'finished';
    } else if (liveStatuses.includes(rawStatus)) {
      status = 'live';
    }

    const dateStr = fixture.date || new Date().toISOString();
    const dateObj = new Date(dateStr);
    const time = dateObj.toLocaleTimeString('fr-FR', {
      timeZone: 'Africa/Tunis',
      hour: '2-digit',
      minute: '2-digit',
    });

    const homeGoals = goals.home !== null && goals.home !== undefined ? Number(goals.home) : null;
    const awayGoals = goals.away !== null && goals.away !== undefined ? Number(goals.away) : null;

    return {
      externalId: String(fixture.id),
      sport: 'football',
      competitionId: String(league.id || '202'),
      competition: league.name || 'Ligue 1',
      competitionAr: 'الرابطة المحترفة الأولى',
      season: String(league.season || '2024'),
      round: league.round || null,
      date: dateStr,
      time: time || '16:00',
      venue: fixture.venue ? `${fixture.venue.name || ''}, ${fixture.venue.city || ''}`.replace(/^, |, $/g, '') : 'Stade Mustapha Ben Jannet',
      venueAr: 'ملعب مصطفى بن جنات',
      status,
      rawStatus,
      homeTeam: {
        id: String(teams.home?.id || 'home'),
        name: teams.home?.name === 'US Monastirienne' ? 'US Monastir' : (teams.home?.name || 'Home Team'),
        nameAr: homeIsUSM ? 'الاتحاد المنستيري' : teams.home?.name,
        logo: teams.home?.logo || null,
        isUSM: homeIsUSM,
      },
      awayTeam: {
        id: String(teams.away?.id || 'away'),
        name: teams.away?.name === 'US Monastirienne' ? 'US Monastir' : (teams.away?.name || 'Away Team'),
        nameAr: awayIsUSM ? 'الاتحاد المنستيري' : teams.away?.name,
        logo: teams.away?.logo || null,
        isUSM: awayIsUSM,
      },
      score: {
        home: homeGoals,
        away: awayGoals,
      },
      stats: {},
      timeline: [],
    };
  }

  /**
   * Fetch upcoming fixtures.
   */
  async getFixtures(teamExternalId: string, leagueExternalId?: string, season?: string): Promise<FixtureDto[]> {
    const targetSeason = this.normalizeSeason(season);
    const targetTeam = teamExternalId || USM_TEAM_ID;
    let data = await this.request<any>(`/fixtures?team=${targetTeam}&season=${targetSeason}`);

    let responseList = data?.response;
    if (!Array.isArray(responseList) || responseList.length === 0) {
      const yearNum = parseInt(targetSeason, 10);
      for (const fallbackYear of [String(yearNum - 1), '2025', '2024']) {
        if (fallbackYear === targetSeason) continue;
        const fallbackData = await this.request<any>(`/fixtures?team=${targetTeam}&season=${fallbackYear}`);
        if (Array.isArray(fallbackData?.response) && fallbackData.response.length > 0) {
          responseList = fallbackData.response;
          break;
        }
      }
    }

    if (!Array.isArray(responseList)) {
      return [];
    }

    const fixtures = responseList.map((item: any) => this.normalizeFixture(item));
    return fixtures
      .filter((f) => f.status === 'upcoming' || f.status === 'live')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Fetch past results.
   */
  async getResults(teamExternalId: string, leagueExternalId?: string, season?: string, limit = 10): Promise<FixtureDto[]> {
    const targetSeason = this.normalizeSeason(season);
    const targetTeam = teamExternalId || USM_TEAM_ID;
    let data = await this.request<any>(`/fixtures?team=${targetTeam}&season=${targetSeason}`);

    let responseList = data?.response;
    if (!Array.isArray(responseList) || responseList.length === 0) {
      const yearNum = parseInt(targetSeason, 10);
      for (const fallbackYear of [String(yearNum - 1), '2025', '2024']) {
        if (fallbackYear === targetSeason) continue;
        const fallbackData = await this.request<any>(`/fixtures?team=${targetTeam}&season=${fallbackYear}`);
        if (Array.isArray(fallbackData?.response) && fallbackData.response.length > 0) {
          responseList = fallbackData.response;
          break;
        }
      }
    }

    if (!Array.isArray(responseList)) {
      return [];
    }

    const fixtures = responseList.map((item: any) => this.normalizeFixture(item));
    return fixtures
      .filter((f) => f.status === 'finished')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Fetch single match detail with events & statistics.
   */
  async getMatch(matchExternalId: string): Promise<FixtureDto | null> {
    const data = await this.request<any>(`/fixtures?id=${matchExternalId}`);
    if (!data || !Array.isArray(data.response) || !data.response[0]) {
      return null;
    }

    const raw = data.response[0];
    const fixture = this.normalizeFixture(raw);

    // Map timeline events
    if (Array.isArray(raw.events)) {
      fixture.timeline = raw.events.map((ev: any, idx: number): MatchEventDto => {
        const time = Number(ev.time?.elapsed || 0);
        let eventType: MatchEventDto['type'] = 'foul';
        const typeStr = (ev.type || '').toLowerCase();
        const detailStr = (ev.detail || '').toLowerCase();

        if (typeStr.includes('goal')) {
          eventType = 'goal';
        } else if (typeStr.includes('card')) {
          eventType = detailStr.includes('red') ? 'card-red' : 'card-yellow';
        } else if (typeStr.includes('subst')) {
          eventType = 'substitution';
        }

        const teamSide: 'home' | 'away' =
          String(ev.team?.id) === fixture.homeTeam.id ? 'home' : 'away';

        return {
          id: `ev-${matchExternalId}-${idx}`,
          time,
          type: eventType,
          team: teamSide,
          player: ev.player?.name || 'Player',
          playerAr: ev.player?.name || 'لاعب',
          detail: ev.detail || undefined,
        };
      });
    }

    // Map statistics if available
    if (Array.isArray(raw.statistics)) {
      const statsMap: Record<string, { home: number; away: number }> = {};
      const homeStats = raw.statistics[0]?.statistics || [];
      const awayStats = raw.statistics[1]?.statistics || [];

      for (const stat of homeStats) {
        const type = stat.type;
        const matchingAway = awayStats.find((s: any) => s.type === type);
        const homeVal = Number(String(stat.value || 0).replace('%', '')) || 0;
        const awayVal = Number(String(matchingAway?.value || 0).replace('%', '')) || 0;

        let mappedKey = '';
        if (type.toLowerCase().includes('possession')) mappedKey = 'possession';
        else if (type.toLowerCase().includes('total shots')) mappedKey = 'shots';
        else if (type.toLowerCase().includes('shots on goal')) mappedKey = 'shotsOnTarget';
        else if (type.toLowerCase().includes('corner')) mappedKey = 'corners';
        else if (type.toLowerCase().includes('fouls')) mappedKey = 'fouls';
        else if (type.toLowerCase().includes('offsides')) mappedKey = 'offsides';

        if (mappedKey) {
          statsMap[mappedKey] = { home: homeVal, away: awayVal };
        }
      }
      fixture.stats = statsMap;
    }

    return fixture;
  }

  /**
   * Fetch currently live matches.
   */
  async getLiveMatches(teamExternalId?: string, leagueExternalId?: string): Promise<FixtureDto[]> {
    const targetTeam = teamExternalId || USM_TEAM_ID;
    const data = await this.request<any>(`/fixtures?live=all`);
    if (!data || !Array.isArray(data.response)) {
      return [];
    }

    const liveFixtures = data.response.map((item: any) => this.normalizeFixture(item));
    return liveFixtures.filter((f) => {
      const teamMatch = !targetTeam || f.homeTeam.id === targetTeam || f.awayTeam.id === targetTeam;
      const leagueMatch = !leagueExternalId || f.competitionId === leagueExternalId;
      return teamMatch && leagueMatch;
    });
  }

  /**
   * Fetch team profile.
   */
  async getTeamInfo(teamExternalId: string): Promise<TeamProfileDto | null> {
    const targetTeam = teamExternalId || USM_TEAM_ID;
    const data = await this.request<any>(`/teams?id=${targetTeam}`);
    if (!data || !Array.isArray(data.response) || !data.response[0]) {
      return null;
    }

    const t = data.response[0].team || {};
    const v = data.response[0].venue || {};

    return {
      id: String(t.id),
      name: t.name === 'US Monastirienne' ? 'US Monastir' : t.name,
      shortName: t.code || 'USMO',
      badge: t.logo || null,
      stadium: v.name || 'Stade Mustapha Ben Jannet',
      stadiumCapacity: v.capacity ? Number(v.capacity) : 15000,
      formedYear: t.founded ? Number(t.founded) : 1923,
      league: 'Ligue 1',
      description: 'Union Sportive Monastirienne - Fondé en 1923 à Monastir, Tunisie.',
      website: 'https://usmonastir.tn',
    };
  }

  /**
   * Fetch competition info.
   */
  async getCompetitionInfo(leagueExternalId: string): Promise<CompetitionSummaryDto | null> {
    const data = await this.request<any>(`/leagues?id=${leagueExternalId}`);
    if (!data || !Array.isArray(data.response) || !data.response[0]) {
      return null;
    }

    const l = data.response[0].league || {};
    const c = data.response[0].country || {};
    const seasons = data.response[0].seasons || [];
    const currentSeasonObj = seasons.find((s: any) => s.current) || seasons[seasons.length - 1] || {};

    return {
      id: String(l.id),
      name: l.name || 'Ligue 1',
      nameAr: 'الرابطة المحترفة الأولى',
      logo: l.logo || null,
      country: c.name || 'Tunisia',
      currentSeason: String(currentSeasonObj.year || '2024'),
    };
  }
}
