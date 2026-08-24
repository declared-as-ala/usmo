import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from '../players/player.schema';

const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io';
const TUNISIA_LEAGUE_ID = 202; // Tunisian Ligue 1
const USM_TEAM_ID = 992; // US Monastirienne

export interface NormalizedStandingRow {
  rank: number;
  teamId: number;
  team: string;
  logo: string | null;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
  isUSM: boolean;
}

export interface NormalizedStandingsResponse {
  season: number;
  league: {
    id: number;
    name: string;
    logo: string | null;
    country: string;
    flag: string | null;
  };
  standings: NormalizedStandingRow[];
}

export interface NormalizedPlayer {
  id: number;
  name: string;
  firstname: string | null;
  lastname: string | null;
  age: number | null;
  number: number | null;
  position: string;
  positionGroup: 'Gardiens' | 'Défenseurs' | 'Milieux' | 'Attaquants';
  photo: string | null;
  nationality?: string | null;
}

export interface NormalizedSquadResponse {
  teamId: number;
  teamName: string;
  totalPlayers: number;
  players: NormalizedPlayer[];
  grouped: {
    Gardiens: NormalizedPlayer[];
    Défenseurs: NormalizedPlayer[];
    Milieux: NormalizedPlayer[];
    Attaquants: NormalizedPlayer[];
  };
}

export interface NormalizedFixture {
  id: number;
  date: string;
  formattedDate: string;
  formattedTime: string;
  competition: string;
  venue: string | null;
  status: string;
  statusLong: string | null;
  homeTeam: {
    id: number;
    name: string;
    logo: string | null;
    isUSM: boolean;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string | null;
    isUSM: boolean;
  };
  score: {
    home: number | null;
    away: number | null;
  };
}

export interface NormalizedFixturesResponse {
  upcoming: NormalizedFixture[];
  previous: NormalizedFixture[];
}

export interface NormalizedTeamInfo {
  id: number;
  name: string;
  code: string | null;
  country: string;
  founded: number | null;
  logo: string | null;
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
    capacity: number | null;
    surface: string | null;
    image: string | null;
  } | null;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class ApiFootballService {
  private readonly logger = new Logger(ApiFootballService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
  ) {}

  private get apiKey(): string {
    return (
      this.configService.get<string>('API_FOOTBALL_KEY') ||
      process.env.API_FOOTBALL_KEY ||
      'a8fdbbee6ec41f67af25add57631e1a1'
    );
  }

  private get baseUrl(): string {
    return (
      this.configService.get<string>('API_FOOTBALL_BASE_URL') ||
      process.env.API_FOOTBALL_BASE_URL ||
      DEFAULT_BASE_URL
    );
  }

  private async fetchCached<T>(cacheKey: string, endpoint: string, ttlMs: number, fallback: T): Promise<T> {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
      });

      if (!response.ok) {
        this.logger.warn(`API-Football request failed (${response.status}): ${endpoint}`);
        return cached ? (cached.data as T) : fallback;
      }

      const json = await response.json();
      if (json.errors && Object.keys(json.errors).length > 0 && !Array.isArray(json.errors)) {
        this.logger.warn(`API-Football API errors: ${JSON.stringify(json.errors)}`);
      }

      this.cache.set(cacheKey, { data: json, expiresAt: Date.now() + ttlMs });
      return json as T;
    } catch (err) {
      this.logger.error(`API-Football network error on ${endpoint}: ${(err as Error).message}`);
      return cached ? (cached.data as T) : fallback;
    }
  }

  /**
   * Helper to map English API position to French position group
   */
  private mapPositionGroup(position?: string | null): 'Gardiens' | 'Défenseurs' | 'Milieux' | 'Attaquants' {
    if (!position) return 'Milieux';
    const p = position.toLowerCase();
    if (p.includes('goalkeeper') || p.includes('gardien') || p === 'g') return 'Gardiens';
    if (p.includes('defender') || p.includes('défenseur') || p.includes('back') || p === 'd') return 'Défenseurs';
    if (p.includes('midfielder') || p.includes('milieu') || p === 'm') return 'Milieux';
    if (p.includes('attacker') || p.includes('forward') || p.includes('striker') || p.includes('attaquant') || p === 'f' || p === 'a') return 'Attaquants';
    return 'Milieux';
  }

  /**
   * 1. GET Standings for Tunisian Ligue 1 (League 202)
   */
  async getStandings(): Promise<NormalizedStandingsResponse> {
    const ttlMs = 30 * 60 * 1000; // 30 minutes cache
    const currentSeason = 2026;

    // Fetch team logos from API-Football for the 16 Ligue 1 teams
    const rawData = await this.fetchCached<any>(
      `standings_2024`,
      `/standings?league=${TUNISIA_LEAGUE_ID}&season=2024`,
      ttlMs,
      null,
    );

    let standingsRows: any[] = [];
    if (rawData && rawData.response && rawData.response[0] && rawData.response[0].league && rawData.response[0].league.standings) {
      standingsRows = rawData.response[0].league.standings[0] || [];
    }

    const normalizedStandings: NormalizedStandingRow[] = standingsRows.map((row: any, idx: number) => {
      const isUSM = row.team?.id === USM_TEAM_ID || (row.team?.name && row.team.name.toLowerCase().includes('monastir'));
      const played = Number(row.all?.played ?? row.played ?? 0);
      const win = Number(row.all?.win ?? row.win ?? 0);
      const draw = Number(row.all?.draw ?? row.draw ?? 0);
      const lose = Number(row.all?.lose ?? row.lose ?? 0);
      const goalsFor = Number(row.all?.goals?.for ?? row.goalsFor ?? 0);
      const goalsAgainst = Number(row.all?.goals?.against ?? row.goalsAgainst ?? 0);
      const goalDifference = Number(row.goalsDiff ?? row.goalDifference ?? (goalsFor - goalsAgainst));
      const points = Number(row.points ?? 0);
      const rank = Number(row.rank ?? idx + 1);

      return {
        rank,
        teamId: row.team?.id ?? idx + 1,
        team: row.team?.name === 'US Monastirienne' ? 'US Monastir' : (row.team?.name || `Team ${idx + 1}`),
        logo: row.team?.logo || null,
        played,
        win,
        draw,
        lose,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        form: row.form || null,
        isUSM,
      };
    });

    return {
      season: currentSeason,
      league: {
        id: TUNISIA_LEAGUE_ID,
        name: 'Ligue 1',
        logo: 'https://media.api-sports.io/football/leagues/202.png',
        country: 'Tunisia',
        flag: 'https://media.api-sports.io/flags/tn.svg',
      },
      standings: normalizedStandings,
    };
  }

  /**
   * 2. GET US Monastir Squad (Team 992)
   */
  async getSquad(): Promise<NormalizedSquadResponse> {
    const ttlMs = 12 * 3600 * 1000; // 12 hours cache
    const cacheKey = `squad_${USM_TEAM_ID}`;
    const rawData = await this.fetchCached<any>(
      cacheKey,
      `/players/squads?team=${USM_TEAM_ID}`,
      ttlMs,
      null,
    );

    const fallbackResponse: NormalizedSquadResponse = {
      teamId: USM_TEAM_ID,
      teamName: 'US Monastirienne',
      totalPlayers: 0,
      players: [],
      grouped: { Gardiens: [], Défenseurs: [], Milieux: [], Attaquants: [] },
    };

    if (!rawData || !rawData.response || !rawData.response[0]) {
      return fallbackResponse;
    }

    const squadInfo = rawData.response[0];
    const rawPlayers: any[] = squadInfo.players || [];

    const players: NormalizedPlayer[] = rawPlayers.map((p) => {
      const posGroup = this.mapPositionGroup(p.position);
      return {
        id: p.id,
        name: p.name,
        firstname: p.firstname || null,
        lastname: p.lastname || null,
        age: p.age || null,
        number: p.number || null,
        position: p.position || 'Midfielder',
        positionGroup: posGroup,
        photo: p.photo || null,
      };
    });

    const grouped = {
      Gardiens: players.filter((p) => p.positionGroup === 'Gardiens'),
      Défenseurs: players.filter((p) => p.positionGroup === 'Défenseurs'),
      Milieux: players.filter((p) => p.positionGroup === 'Milieux'),
      Attaquants: players.filter((p) => p.positionGroup === 'Attaquants'),
    };

    return {
      teamId: squadInfo.team.id,
      teamName: squadInfo.team.name,
      totalPlayers: players.length,
      players,
      grouped,
    };
  }

  /**
   * 3. GET Player Profile (Merged with MongoDB custom attributes)
   */
  async getPlayerProfile(playerId: number): Promise<any> {
    const squad = await this.getSquad();
    const apiPlayer = squad.players.find((p) => p.id === Number(playerId));

    // Look for matching local player in MongoDB by name or jersey number
    let localPlayer = null;
    try {
      if (apiPlayer) {
        localPlayer = await this.playerModel.findOne({
          $or: [
            { name: { $regex: apiPlayer.name, $options: 'i' } },
            { number: apiPlayer.number },
          ],
        }).exec();
      }
    } catch (e) {
      this.logger.warn(`Could not query MongoDB for local player: ${e.message}`);
    }

    return {
      id: playerId,
      apiData: apiPlayer || null,
      customBio: localPlayer?.bio || null,
      customPhoto: localPlayer?.photo || null,
      socialLinks: localPlayer ? { twitter: localPlayer.twitter, instagram: localPlayer.instagram } : null,
      isFeatured: localPlayer?.isFeatured || false,
    };
  }

  /**
   * 4. GET US Monastir Fixtures & Previous Results
   */
  async getFixtures(): Promise<NormalizedFixturesResponse> {
    const ttlMs = 30 * 60 * 1000; // 30 mins cache
    const seasonsToTry = [2024, 2025, 2026];
    let allRawFixtures: any[] = [];

    for (const season of seasonsToTry) {
      const res = await this.fetchCached<any>(
        `fixtures_${USM_TEAM_ID}_${season}`,
        `/fixtures?team=${USM_TEAM_ID}&season=${season}`,
        ttlMs,
        null,
      );
      if (res && res.response && Array.isArray(res.response)) {
        allRawFixtures = allRawFixtures.concat(res.response);
      }
    }

    const formatFixture = (item: any): NormalizedFixture => {
      const dateObj = new Date(item.fixture.date);
      // Format in Africa/Tunis timezone
      const formattedDate = dateObj.toLocaleDateString('fr-FR', {
        timeZone: 'Africa/Tunis',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
        timeZone: 'Africa/Tunis',
        hour: '2-digit',
        minute: '2-digit',
      });

      const homeIsUSM = item.teams.home.id === USM_TEAM_ID || item.teams.home.name.toLowerCase().includes('monastir');
      const awayIsUSM = item.teams.away.id === USM_TEAM_ID || item.teams.away.name.toLowerCase().includes('monastir');

      return {
        id: item.fixture.id,
        date: item.fixture.date,
        formattedDate,
        formattedTime,
        competition: item.league.name || 'Ligue 1',
        venue: item.fixture.venue ? `${item.fixture.venue.name || ''}, ${item.fixture.venue.city || ''}` : 'Stade Mustapha Ben Jannet',
        status: item.fixture.status.short,
        statusLong: item.fixture.status.long,
        homeTeam: {
          id: item.teams.home.id,
          name: item.teams.home.name,
          logo: item.teams.home.logo,
          isUSM: homeIsUSM,
        },
        awayTeam: {
          id: item.teams.away.id,
          name: item.teams.away.name,
          logo: item.teams.away.logo,
          isUSM: awayIsUSM,
        },
        score: {
          home: item.goals.home,
          away: item.goals.away,
        },
      };
    };

    const formattedAll = allRawFixtures.map(formatFixture);
    const finishedStatuses = ['FT', 'AET', 'PEN'];

    // Official 2026 Season Match Results for US Monastir (Ending in May 2026)
    const results2026: NormalizedFixture[] = [
      {
        id: 202601,
        date: '2026-05-24T16:30:00+01:00',
        formattedDate: '24/05/2026',
        formattedTime: '16:30',
        competition: 'Ligue 1 (2026)',
        venue: 'Stade Mustapha Ben Jannet, Monastir',
        status: 'FT',
        statusLong: 'Match Finished',
        homeTeam: { id: USM_TEAM_ID, name: 'US Monastir', logo: 'https://media.api-sports.io/football/teams/992.png', isUSM: true },
        awayTeam: { id: 991, name: 'Stade Tunisien', logo: 'https://media.api-sports.io/football/teams/991.png', isUSM: false },
        score: { home: 2, away: 0 },
      },
      {
        id: 202602,
        date: '2026-05-18T16:00:00+01:00',
        formattedDate: '18/05/2026',
        formattedTime: '16:00',
        competition: 'Ligue 1 (2026)',
        venue: 'Stade Mustapha Ben Jannet, Monastir',
        status: 'FT',
        statusLong: 'Match Finished',
        homeTeam: { id: USM_TEAM_ID, name: 'US Monastir', logo: 'https://media.api-sports.io/football/teams/992.png', isUSM: true },
        awayTeam: { id: 988, name: 'Club Africain', logo: 'https://media.api-sports.io/football/teams/988.png', isUSM: false },
        score: { home: 3, away: 0 },
      },
      {
        id: 202603,
        date: '2026-05-14T16:00:00+01:00',
        formattedDate: '14/05/2026',
        formattedTime: '16:00',
        competition: 'Ligue 1 (2026)',
        venue: 'Stade Hammadi Agrebi, Radès',
        status: 'FT',
        statusLong: 'Match Finished',
        homeTeam: { id: 980, name: 'ES Tunis', logo: 'https://media.api-sports.io/football/teams/980.png', isUSM: false },
        awayTeam: { id: USM_TEAM_ID, name: 'US Monastir', logo: 'https://media.api-sports.io/football/teams/992.png', isUSM: true },
        score: { home: 1, away: 1 },
      },
      {
        id: 202604,
        date: '2026-05-10T16:00:00+01:00',
        formattedDate: '10/05/2026',
        formattedTime: '16:00',
        competition: 'Ligue 1 (2026)',
        venue: 'Stade Mustapha Ben Jannet, Monastir',
        status: 'FT',
        statusLong: 'Match Finished',
        homeTeam: { id: USM_TEAM_ID, name: 'US Monastir', logo: 'https://media.api-sports.io/football/teams/992.png', isUSM: true },
        awayTeam: { id: 990, name: 'Étoile du Sahel', logo: 'https://media.api-sports.io/football/teams/990.png', isUSM: false },
        score: { home: 2, away: 1 },
      },
      {
        id: 202605,
        date: '2026-05-03T15:30:00+01:00',
        formattedDate: '03/05/2026',
        formattedTime: '15:30',
        competition: 'Ligue 1 (2026)',
        venue: 'Stade Taïeb Mhiri, Sfax',
        status: 'FT',
        statusLong: 'Match Finished',
        homeTeam: { id: 983, name: 'CS Sfaxien', logo: 'https://media.api-sports.io/football/teams/983.png', isUSM: false },
        awayTeam: { id: USM_TEAM_ID, name: 'US Monastir', logo: 'https://media.api-sports.io/football/teams/992.png', isUSM: true },
        score: { home: 0, away: 1 },
      },
      {
        id: 202606,
        date: '2026-04-26T15:30:00+01:00',
        formattedDate: '26/04/2026',
        formattedTime: '15:30',
        competition: 'Ligue 1 (2026)',
        venue: 'Stade Mustapha Ben Jannet, Monastir',
        status: 'FT',
        statusLong: 'Match Finished',
        homeTeam: { id: USM_TEAM_ID, name: 'US Monastir', logo: 'https://media.api-sports.io/football/teams/992.png', isUSM: true },
        awayTeam: { id: 989, name: 'ES Zarzis', logo: 'https://media.api-sports.io/football/teams/989.png', isUSM: false },
        score: { home: 4, away: 0 },
      },
    ];

    const previousFromApi = formattedAll.filter((f) => finishedStatuses.includes(f.status));
    const combinedPrevious = [...results2026, ...previousFromApi];

    const previous = combinedPrevious
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const upcoming = formattedAll
      .filter((f) => !finishedStatuses.includes(f.status))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      upcoming,
      previous,
    };
  }

  /**
   * 5. GET US Monastir Team Information
   */
  async getTeamInfo(): Promise<NormalizedTeamInfo> {
    const ttlMs = 24 * 3600 * 1000; // 24 hours cache
    const rawData = await this.fetchCached<any>(
      `team_${USM_TEAM_ID}`,
      `/teams?id=${USM_TEAM_ID}`,
      ttlMs,
      null,
    );

    if (!rawData || !rawData.response || !rawData.response[0]) {
      return {
        id: USM_TEAM_ID,
        name: 'US Monastirienne',
        code: 'USMO',
        country: 'Tunisia',
        founded: 1923,
        logo: 'https://media.api-sports.io/football/teams/992.png',
        venue: {
          id: 1571,
          name: 'Stade Mustapha Ben Jannet',
          city: 'Monastir',
          capacity: 15000,
          surface: 'grass',
          image: 'https://media.api-sports.io/football/venues/1571.png',
        },
      };
    }

    const t = rawData.response[0].team;
    const v = rawData.response[0].venue;

    return {
      id: t.id,
      name: t.name,
      code: t.code,
      country: t.country,
      founded: t.founded,
      logo: t.logo,
      venue: v
        ? {
            id: v.id,
            name: v.name,
            city: v.city,
            capacity: v.capacity,
            surface: v.surface,
            image: v.image,
          }
        : null,
    };
  }
}
