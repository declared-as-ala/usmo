import { Injectable, Logger } from '@nestjs/common';
import {
  CompetitionSummaryDto,
  FixtureDto,
  SportsDataProvider,
  StandingDto,
  TeamProfileDto,
} from '../interfaces/sports-provider.interface';

const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const USM_LEAGUE_ID = '4828';
const USM_TEAM_ID = '139871';

@Injectable()
export class TheSportsDbProvider implements SportsDataProvider {
  readonly providerName = 'thesportsdb';
  private readonly logger = new Logger(TheSportsDbProvider.name);

  private async request<T>(endpoint: string, retries = 2): Promise<T | null> {
    const url = `${SPORTSDB_BASE}${endpoint}`;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`TheSportsDB request failed (${res.status}): ${url}`);
        }
        const json = await res.json();
        return json as T;
      } catch (err: any) {
        if (attempt === retries) {
          this.logger.warn(`TheSportsDB request error on ${endpoint}: ${err.message}`);
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }
    return null;
  }

  async getStandings(leagueExternalId: string, season: string): Promise<StandingDto[]> {
    const leagueId = leagueExternalId || USM_LEAGUE_ID;
    const targetSeason = season || '2024-2025';

    // Try target season, then unparameterized lookup
    const seasonsToTry = [targetSeason, ''];
    let rows: any[] = [];

    for (const s of seasonsToTry) {
      const endpoint = s ? `/lookuptable.php?l=${leagueId}&s=${s}` : `/lookuptable.php?l=${leagueId}`;
      const data = await this.request<{ table: any[] | null }>(endpoint);
      if (data && Array.isArray(data.table) && data.table.length > 0) {
        rows = data.table;
        break;
      }
    }

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row, idx) => {
      const isUSM =
        row.idTeam === USM_TEAM_ID ||
        (row.strTeam &&
          (row.strTeam.toLowerCase().includes('monastir') ||
            row.strTeam.toLowerCase().includes('usm')));

      return {
        position: Number(row.intRank || idx + 1),
        teamId: String(row.idTeam || idx + 1),
        teamName: row.strTeam || `Team ${idx + 1}`,
        teamLogo: row.strBadge || null,
        played: Number(row.intPlayed || 0),
        won: Number(row.intWin || 0),
        drawn: Number(row.intDraw || 0),
        lost: Number(row.intLoss || 0),
        goalsFor: Number(row.intGoalsFor || 0),
        goalsAgainst: Number(row.intGoalsAgainst || 0),
        goalDifference: Number(row.intGoalDifference || 0),
        points: Number(row.intPoints || 0),
        form: row.strForm || null,
        isUSM,
      };
    });
  }

  async getFixtures(teamExternalId: string): Promise<FixtureDto[]> {
    const teamId = teamExternalId || USM_TEAM_ID;
    const data = await this.request<{ events: any[] | null }>(`/eventsnext.php?id=${teamId}`);
    const events = data?.events || [];

    return events.map((ev): FixtureDto => {
      const homeIsUSM = ev.idHomeTeam === teamId || (ev.strHomeTeam && ev.strHomeTeam.toLowerCase().includes('monastir'));
      const awayIsUSM = ev.idAwayTeam === teamId || (ev.strAwayTeam && ev.strAwayTeam.toLowerCase().includes('monastir'));

      return {
        externalId: String(ev.idEvent),
        sport: 'football',
        competition: ev.strLeague || 'Ligue 1',
        season: ev.strSeason || '2024-2025',
        round: ev.intRound || null,
        date: ev.dateEvent ? `${ev.dateEvent}T${ev.strTime || '16:00:00'}` : new Date().toISOString(),
        time: ev.strTime ? ev.strTime.slice(0, 5) : '16:00',
        venue: ev.strVenue || 'Stade Mustapha Ben Jannet',
        status: 'upcoming',
        homeTeam: {
          id: String(ev.idHomeTeam || 'home'),
          name: ev.strHomeTeam || 'Home Team',
          logo: ev.strHomeTeamBadge || null,
          isUSM: homeIsUSM,
        },
        awayTeam: {
          id: String(ev.idAwayTeam || 'away'),
          name: ev.strAwayTeam || 'Away Team',
          logo: ev.strAwayTeamBadge || null,
          isUSM: awayIsUSM,
        },
        score: {
          home: null,
          away: null,
        },
      };
    });
  }

  async getResults(teamExternalId: string, leagueExternalId?: string, season?: string, limit = 10): Promise<FixtureDto[]> {
    const teamId = teamExternalId || USM_TEAM_ID;
    const data = await this.request<{ results: any[] | null }>(`/eventslast.php?id=${teamId}`);
    const results = data?.results || [];

    return results.slice(0, limit).map((ev): FixtureDto => {
      const homeIsUSM = ev.idHomeTeam === teamId || (ev.strHomeTeam && ev.strHomeTeam.toLowerCase().includes('monastir'));
      const awayIsUSM = ev.idAwayTeam === teamId || (ev.strAwayTeam && ev.strAwayTeam.toLowerCase().includes('monastir'));

      return {
        externalId: String(ev.idEvent),
        sport: 'football',
        competition: ev.strLeague || 'Ligue 1',
        season: ev.strSeason || '2024-2025',
        round: ev.intRound || null,
        date: ev.dateEvent ? `${ev.dateEvent}T${ev.strTime || '16:00:00'}` : new Date().toISOString(),
        time: ev.strTime ? ev.strTime.slice(0, 5) : '16:00',
        venue: ev.strVenue || 'Stade Mustapha Ben Jannet',
        status: 'finished',
        homeTeam: {
          id: String(ev.idHomeTeam || 'home'),
          name: ev.strHomeTeam || 'Home Team',
          logo: ev.strHomeTeamBadge || null,
          isUSM: homeIsUSM,
        },
        awayTeam: {
          id: String(ev.idAwayTeam || 'away'),
          name: ev.strAwayTeam || 'Away Team',
          logo: ev.strAwayTeamBadge || null,
          isUSM: awayIsUSM,
        },
        score: {
          home: ev.intHomeScore !== null && ev.intHomeScore !== undefined ? Number(ev.intHomeScore) : null,
          away: ev.intAwayScore !== null && ev.intAwayScore !== undefined ? Number(ev.intAwayScore) : null,
        },
      };
    });
  }

  async getMatch(matchExternalId: string): Promise<FixtureDto | null> {
    const data = await this.request<{ events: any[] | null }>(`/lookupevent.php?id=${matchExternalId}`);
    const ev = data?.events?.[0];
    if (!ev) return null;

    return {
      externalId: String(ev.idEvent),
      sport: 'football',
      competition: ev.strLeague || 'Ligue 1',
      season: ev.strSeason || '2024-2025',
      date: ev.dateEvent || new Date().toISOString(),
      time: ev.strTime ? ev.strTime.slice(0, 5) : '16:00',
      venue: ev.strVenue || 'Stade Mustapha Ben Jannet',
      status: ev.strStatus === 'Match Finished' ? 'finished' : 'upcoming',
      homeTeam: {
        id: String(ev.idHomeTeam),
        name: ev.strHomeTeam,
        logo: ev.strHomeTeamBadge || null,
        isUSM: String(ev.idHomeTeam) === USM_TEAM_ID,
      },
      awayTeam: {
        id: String(ev.idAwayTeam),
        name: ev.strAwayTeam,
        logo: ev.strAwayTeamBadge || null,
        isUSM: String(ev.idAwayTeam) === USM_TEAM_ID,
      },
      score: {
        home: ev.intHomeScore !== null ? Number(ev.intHomeScore) : null,
        away: ev.intAwayScore !== null ? Number(ev.intAwayScore) : null,
      },
    };
  }

  async getLiveMatches(): Promise<FixtureDto[]> {
    return [];
  }

  async getTeamInfo(teamExternalId: string): Promise<TeamProfileDto | null> {
    const teamId = teamExternalId || USM_TEAM_ID;
    const data = await this.request<{ teams: any[] | null }>(`/lookupteam.php?id=${teamId}`);
    const team = data?.teams?.[0];
    if (!team) return null;

    return {
      id: String(team.idTeam),
      name: team.strTeam,
      shortName: team.strTeamShort || 'USMO',
      badge: team.strBadge || null,
      stadium: team.strStadium || 'Stade Mustapha Ben Jannet',
      stadiumCapacity: team.intStadiumCapacity ? Number(team.intStadiumCapacity) : 15000,
      formedYear: team.intFormedYear ? Number(team.intFormedYear) : 1923,
      league: team.strLeague || 'Tunisian Ligue 1',
      description: team.strDescriptionEN || team.strDescriptionFR || null,
      website: 'https://usmonastir.tn',
    };
  }

  async getCompetitionInfo(leagueExternalId: string): Promise<CompetitionSummaryDto | null> {
    const leagueId = leagueExternalId || USM_LEAGUE_ID;
    const data = await this.request<{ leagues: any[] | null }>(`/lookupleague.php?id=${leagueId}`);
    const l = data?.leagues?.[0];
    if (!l) return null;

    return {
      id: String(l.idLeague),
      name: l.strLeague || 'Tunisian Ligue 1',
      nameAr: 'الرابطة المحترفة الأولى',
      logo: l.strBadge || l.strLogo || null,
      country: l.strCountry || 'Tunisia',
      currentSeason: l.strCurrentSeason || '2024-2025',
    };
  }
}
