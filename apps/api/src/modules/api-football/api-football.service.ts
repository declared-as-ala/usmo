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
    const seasonsToTry = [2024, 2025, 2026];
    let selectedSeason = 2024;
    let rawData: any = null;

    for (const season of seasonsToTry.reverse()) {
      const res = await this.fetchCached<any>(
        `standings_${season}`,
        `/standings?league=${TUNISIA_LEAGUE_ID}&season=${season}`,
        ttlMs,
        null,
      );
      if (res && res.response && res.response.length > 0) {
        rawData = res;
        selectedSeason = season;
        break;
      }
    }

    if (!rawData || !rawData.response || !rawData.response[0]) {
      return {
        season: selectedSeason,
        league: {
          id: TUNISIA_LEAGUE_ID,
          name: 'Ligue 1',
          logo: 'https://media.api-sports.io/football/leagues/202.png',
          country: 'Tunisia',
          flag: 'https://media.api-sports.io/flags/tn.svg',
        },
        standings: [],
      };
    }

    const leagueData = rawData.response[0].league;
    const standingsRows = leagueData.standings && leagueData.standings[0] ? leagueData.standings[0] : [];

    const normalizedStandings: NormalizedStandingRow[] = standingsRows.map((row: any) => {
      const isUSM = row.team.id === USM_TEAM_ID || row.team.name.toLowerCase().includes('monastir');
      return {
        rank: row.rank,
        teamId: row.team.id,
        team: row.team.name,
        logo: row.team.logo,
        played: row.all.played,
        win: row.all.win,
        draw: row.all.draw,
        lose: row.all.lose,
        goalsFor: row.all.goals.for,
        goalsAgainst: row.all.goals.against,
        goalDifference: row.goalsDiff,
        points: row.points,
        form: row.form || null,
        isUSM,
      };
    });

    return {
      season: selectedSeason,
      league: {
        id: leagueData.id,
        name: leagueData.name,
        logo: leagueData.logo,
        country: leagueData.country,
        flag: leagueData.flag,
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

    const previous = formattedAll
      .filter((f) => finishedStatuses.includes(f.status))
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
