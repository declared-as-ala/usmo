import { Injectable, Logger } from '@nestjs/common';

// TheSportsDB free-tier integration. Free key "123" — 30 req/min limit, so every
// call is read-through cached in memory. See docs/sportsdb.md for endpoint notes.
const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const USM_LEAGUE_ID = '4828'; // Tunisian Ligue 1
const USM_TEAM_ID = '139871'; // US Monastir

export interface StandingRow {
  position: number;
  teamId: string;
  team: string;
  badge: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string;
  isUSM: boolean;
}

export interface ResultRow {
  id: string;
  date: string;
  time: string;
  competition: string;
  round: string | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  homeBadge: string | null;
  awayBadge: string | null;
  venue: string | null;
}

export interface TeamInfo {
  id: string;
  name: string;
  shortName: string | null;
  badge: string | null;
  stadium: string | null;
  stadiumCapacity: number | null;
  formedYear: number | null;
  league: string | null;
  description: string | null;
  website: string | null;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class SportsDbService {
  private readonly logger = new Logger(SportsDbService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  private async fetchCached<T>(cacheKey: string, url: string, ttlMs: number, fallback: T): Promise<T> {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`TheSportsDB request failed (${res.status}): ${url}`);
        return cached ? (cached.data as T) : fallback;
      }
      const json = await res.json();
      this.cache.set(cacheKey, { data: json, expiresAt: Date.now() + ttlMs });
      return json as T;
    } catch (err) {
      this.logger.error(`TheSportsDB request error: ${(err as Error).message}`);
      return cached ? (cached.data as T) : fallback;
    }
  }

  async getStandings(): Promise<StandingRow[]> {
    const json = await this.fetchCached<{ table: any[] | null }>(
      'standings',
      `${SPORTSDB_BASE}/lookuptable.php?l=${USM_LEAGUE_ID}`,
      15 * 60 * 1000,
      { table: null },
    );
    const table = json.table || [];
    return table.map((row) => ({
      position: Number(row.intRank),
      teamId: row.idTeam,
      team: row.strTeam,
      badge: row.strBadge || null,
      played: Number(row.intPlayed),
      won: Number(row.intWin),
      drawn: Number(row.intDraw),
      lost: Number(row.intLoss),
      goalsFor: Number(row.intGoalsFor),
      goalsAgainst: Number(row.intGoalsAgainst),
      goalDiff: Number(row.intGoalDifference),
      points: Number(row.intPoints),
      form: row.strForm || '',
      isUSM: row.idTeam === USM_TEAM_ID,
    }));
  }

  async getRecentResults(limit = 5): Promise<ResultRow[]> {
    const json = await this.fetchCached<{ results: any[] | null }>(
      'results',
      `${SPORTSDB_BASE}/eventslast.php?id=${USM_TEAM_ID}`,
      15 * 60 * 1000,
      { results: null },
    );
    const results = json.results || [];
    return results.slice(0, limit).map((ev) => ({
      id: ev.idEvent,
      date: ev.dateEvent,
      time: ev.strTime,
      competition: ev.strLeague,
      round: ev.intRound || null,
      homeTeam: ev.strHomeTeam,
      awayTeam: ev.strAwayTeam,
      homeTeamId: ev.idHomeTeam,
      awayTeamId: ev.idAwayTeam,
      homeScore: ev.intHomeScore !== null ? Number(ev.intHomeScore) : null,
      awayScore: ev.intAwayScore !== null ? Number(ev.intAwayScore) : null,
      homeBadge: ev.strHomeTeamBadge || null,
      awayBadge: ev.strAwayTeamBadge || null,
      venue: ev.strVenue || null,
    }));
  }

  async getNextMatch(): Promise<ResultRow | null> {
    const json = await this.fetchCached<{ events: any[] | null }>(
      'next',
      `${SPORTSDB_BASE}/eventsnext.php?id=${USM_TEAM_ID}`,
      15 * 60 * 1000,
      { events: null },
    );
    const events = json.events || [];
    if (events.length === 0) return null;
    const ev = events[0];
    return {
      id: ev.idEvent,
      date: ev.dateEvent,
      time: ev.strTime,
      competition: ev.strLeague,
      round: ev.intRound || null,
      homeTeam: ev.strHomeTeam,
      awayTeam: ev.strAwayTeam,
      homeTeamId: ev.idHomeTeam,
      awayTeamId: ev.idAwayTeam,
      homeScore: null,
      awayScore: null,
      homeBadge: ev.strHomeTeamBadge || null,
      awayBadge: ev.strAwayTeamBadge || null,
      venue: ev.strVenue || null,
    };
  }

  async getTeamInfo(): Promise<TeamInfo | null> {
    const json = await this.fetchCached<{ teams: any[] | null }>(
      'team',
      `${SPORTSDB_BASE}/lookupteam.php?id=${USM_TEAM_ID}`,
      60 * 60 * 1000,
      { teams: null },
    );
    const team = json.teams?.[0];
    if (!team) return null;
    return {
      id: team.idTeam,
      name: team.strTeam,
      shortName: team.strTeamShort || null,
      badge: team.strBadge || null,
      stadium: team.strStadium || null,
      stadiumCapacity: team.intStadiumCapacity ? Number(team.intStadiumCapacity) : null,
      formedYear: team.intFormedYear ? Number(team.intFormedYear) : null,
      league: team.strLeague || null,
      description: team.strDescriptionEN || null,
      website: 'usmonastir.tn',
    };
  }
}
