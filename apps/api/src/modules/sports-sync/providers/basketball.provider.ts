import { Injectable, Logger } from '@nestjs/common';
import {
  CompetitionSummaryDto,
  FixtureDto,
  SportsDataProvider,
  StandingDto,
  TeamProfileDto,
} from '../interfaces/sports-provider.interface';

const DEFAULT_PRO_A_STANDINGS: StandingDto[] = [
  { position: 1, teamId: 'bb_usm', teamName: 'US Monastir', teamLogo: '/logo basket.png', played: 14, won: 13, drawn: 0, lost: 1, goalsFor: 1148, goalsAgainst: 952, goalDifference: 196, points: 27, form: 'WWWWW', isUSM: true },
  { position: 2, teamId: 'bb_ca', teamName: 'Club Africain', teamLogo: null, played: 14, won: 12, drawn: 0, lost: 2, goalsFor: 1092, goalsAgainst: 940, goalDifference: 152, points: 26, form: 'WWLWW', isUSM: false },
  { position: 3, teamId: 'bb_ess', teamName: 'Étoile du Sahel', teamLogo: null, played: 14, won: 10, drawn: 0, lost: 4, goalsFor: 1025, goalsAgainst: 975, goalDifference: 50, points: 24, form: 'WLWWL', isUSM: false },
  { position: 4, teamId: 'bb_jsk', teamName: 'JS Kairouan', teamLogo: null, played: 14, won: 9, drawn: 0, lost: 5, goalsFor: 980, goalsAgainst: 960, goalDifference: 20, points: 23, form: 'LWWLW', isUSM: false },
  { position: 5, teamId: 'bb_sn', teamName: 'Stade Nabeulien', teamLogo: null, played: 14, won: 6, drawn: 0, lost: 8, goalsFor: 945, goalsAgainst: 980, goalDifference: -35, points: 20, form: 'WLLWL', isUSM: false },
  { position: 6, teamId: 'bb_esr', teamName: 'ES Radès', teamLogo: null, played: 14, won: 5, drawn: 0, lost: 9, goalsFor: 920, goalsAgainst: 990, goalDifference: -70, points: 19, form: 'LLWLL', isUSM: false },
  { position: 7, teamId: 'bb_dsg', teamName: 'DS Grombalia', teamLogo: null, played: 14, won: 4, drawn: 0, lost: 10, goalsFor: 890, goalsAgainst: 1020, goalDifference: -130, points: 18, form: 'LWLLL', isUSM: false },
  { position: 8, teamId: 'bb_usa', teamName: 'US Ansar', teamLogo: null, played: 14, won: 1, drawn: 0, lost: 13, goalsFor: 840, goalsAgainst: 1023, goalDifference: -183, points: 15, form: 'LLLLL', isUSM: false },
];

@Injectable()
export class BasketballProvider implements SportsDataProvider {
  readonly providerName = 'basketball-provider';
  private readonly logger = new Logger(BasketballProvider.name);

  async getStandings(leagueExternalId: string, season: string): Promise<StandingDto[]> {
    return DEFAULT_PRO_A_STANDINGS.map((row) => ({
      ...row,
      form: row.form || 'WWWWW',
    }));
  }

  async getFixtures(teamExternalId: string): Promise<FixtureDto[]> {
    return [];
  }

  async getResults(teamExternalId: string, leagueExternalId?: string, season?: string, limit = 10): Promise<FixtureDto[]> {
    return [];
  }

  async getMatch(matchExternalId: string): Promise<FixtureDto | null> {
    return null;
  }

  async getLiveMatches(): Promise<FixtureDto[]> {
    return [];
  }

  async getTeamInfo(teamExternalId: string): Promise<TeamProfileDto | null> {
    return {
      id: 'bb_usm',
      name: 'US Monastir Basketball',
      shortName: 'USMO Basket',
      badge: '/logo basket.png',
      stadium: 'Salle Omnisports Mohamed Mzali',
      stadiumCapacity: 5000,
      formedYear: 1959,
      league: 'Pro A Tunisie / BAL',
      description: 'Champion de Tunisie (10 titres) et Champion d’Afrique BAL 2022.',
      website: 'https://usmonastir.tn/basketball',
    };
  }

  async getCompetitionInfo(leagueExternalId: string): Promise<CompetitionSummaryDto | null> {
    return {
      id: 'pro-a-basketball',
      name: 'Championnat National Pro A',
      nameAr: 'البطولة الوطنية المحترفة لكرة السلة',
      logo: null,
      country: 'Tunisia',
      currentSeason: '2025-2026',
    };
  }
}
