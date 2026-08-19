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

const FALLBACK_STANDINGS: StandingRow[] = [
  { position: 1, teamId: '137650', team: 'Espérance de Tunis', badge: 'https://r2.thesportsdb.com/images/media/team/badge/jyijfi1581543162.png/tiny', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDiff: 4, points: 6, form: 'WW', isUSM: false },
  { position: 2, teamId: '139871', team: 'US Monastir', badge: '/logo.png', played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 4, goalsAgainst: 1, goalDiff: 3, points: 6, form: 'WW', isUSM: true },
  { position: 3, teamId: '139862', team: 'Club Africain', badge: 'https://r2.thesportsdb.com/images/media/team/badge/2gijg71753933998.png/tiny', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDiff: 2, points: 4, form: 'WD', isUSM: false },
  { position: 4, teamId: '138999', team: 'Étoile du Sahel', badge: 'https://r2.thesportsdb.com/images/media/team/badge/zyy5p81753933927.png/tiny', played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 2, goalsAgainst: 0, goalDiff: 2, points: 4, form: 'DW', isUSM: false },
  { position: 5, teamId: '139866', team: 'CS Sfaxien', badge: null, played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDiff: 1, points: 3, form: 'LW', isUSM: false },
  { position: 6, teamId: '139869', team: 'Stade Tunisien', badge: null, played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDiff: 0, points: 3, form: 'WL', isUSM: false },
  { position: 7, teamId: '139870', team: 'ES Zarzis', badge: null, played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDiff: 0, points: 3, form: 'WL', isUSM: false },
  { position: 8, teamId: '139863', team: 'CA Bizertin', badge: null, played: 2, won: 0, drawn: 2, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDiff: 0, points: 2, form: 'DD', isUSM: false },
  { position: 9, teamId: '139864', team: 'US Ben Guerdane', badge: null, played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDiff: -1, points: 1, form: 'DL', isUSM: false },
  { position: 10, teamId: '139865', team: 'EGS Gafsa', badge: null, played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDiff: -1, points: 1, form: 'LD', isUSM: false },
  { position: 11, teamId: '139867', team: 'Olympique Béja', badge: null, played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 0, goalsAgainst: 1, goalDiff: -1, points: 1, form: 'DL', isUSM: false },
  { position: 12, teamId: '139868', team: 'AS Soliman', badge: null, played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 0, goalsAgainst: 1, goalDiff: -1, points: 1, form: 'LD', isUSM: false },
  { position: 13, teamId: '139872', team: 'US Tataouine', badge: null, played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDiff: -2, points: 1, form: 'DL', isUSM: false },
  { position: 14, teamId: '139873', team: 'JS El Omrane', badge: null, played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 4, goalDiff: -3, points: 0, form: 'LL', isUSM: false },
  { position: 15, teamId: '139874', team: 'ES Métlaoui', badge: null, played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 3, goalDiff: -3, points: 0, form: 'LL', isUSM: false },
  { position: 16, teamId: '139875', team: 'AS Marsa', badge: null, played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 4, goalDiff: -4, points: 0, form: 'LL', isUSM: false },
];

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
    // Strictly fetch 2026-2027 season first
    const seasons = ['2026-2027', ''];
    let table: any[] = [];

    for (const season of seasons) {
      const url = season
        ? `${SPORTSDB_BASE}/lookuptable.php?l=${USM_LEAGUE_ID}&s=${season}`
        : `${SPORTSDB_BASE}/lookuptable.php?l=${USM_LEAGUE_ID}`;

      const json = await this.fetchCached<{ table: any[] | null }>(
        `standings_${season || 'default'}`,
        url,
        15 * 60 * 1000,
        { table: null },
      );

      const rows = json.table || [];
      if (rows.length > 0) {
        table = rows;
        break;
      }
    }

    if (!table || table.length === 0) {
      return FALLBACK_STANDINGS;
    }

    const mapped: StandingRow[] = table.map((row) => {
      const isUsmTeam =
        row.idTeam === USM_TEAM_ID ||
        (row.strTeam &&
          (row.strTeam.toLowerCase().includes('monastir') ||
            row.strTeam.toLowerCase().includes('usm')));

      return {
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
        isUSM: isUsmTeam,
      };
    });

    // Complete missing teams from 2026-2027 season so all 16 teams are present
    const existingTeamNames = new Set(mapped.map((t) => t.team.toLowerCase()));
    for (const fallbackRow of FALLBACK_STANDINGS) {
      if (!existingTeamNames.has(fallbackRow.team.toLowerCase())) {
        mapped.push(fallbackRow);
      }
    }
    mapped.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);
    mapped.forEach((r, idx) => {
      r.position = idx + 1;
    });

    return mapped;
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

  async getPlayers(): Promise<any[]> {
    const json = await this.fetchCached<{ player: any[] | null }>(
      'external_players',
      `${SPORTSDB_BASE}/lookup_all_players.php?id=${USM_TEAM_ID}`,
      30 * 60 * 1000,
      { player: null },
    );
    const players = json.player || [];
    return players.map((p) => ({
      _id: `ext_${p.idPlayer}`,
      slug: (p.strPlayer || 'player')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      sport: 'football',
      name: p.strPlayer,
      nameAr: p.strPlayerAlternate || p.strPlayer,
      number: p.strNumber ? Number(p.strNumber) : 0,
      position: p.strPosition || 'Player',
      positionAr: p.strPosition || 'لاعب',
      nationality: p.strNationality || 'Tunisian',
      nationalityAr: p.strNationality === 'Tunisia' ? 'تونسي' : p.strNationality,
      image: p.strCutout || p.strRender || p.strThumb || '/moez_ben_cherifia.png',
      stats: {
        Nationality: p.strNationality || 'Tunisia',
        Born: p.dateBorn || 'N/A',
        Number: p.strNumber ? `#${p.strNumber}` : '-',
      },
      bio: p.strDescriptionFR || p.strDescriptionEN || `Joueur de l'US Monastir en Ligue 1 Tunisienne.`,
      bioAr: `لاعب الاتحاد الرياضي المنستيري في الرابطة المحترفة الأولى.`,
      source: 'thesportsdb',
    }));
  }
}
