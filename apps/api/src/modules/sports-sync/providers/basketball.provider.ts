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

export const REAL_BASKETBALL_RESULTS: FixtureDto[] = [
  {
    externalId: 'bb-proa-fin3-2026',
    sport: 'basketball',
    competitionId: 'pro-a-basketball',
    competition: 'Super Play-off Pro A — Finale (Match 3, Titre)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 3، اللقب)',
    season: '2025/26',
    round: 'Finale - Match 3',
    date: '2026-04-05T17:00:00+01:00',
    time: '17:00',
    venue: 'Salle Aziz Miled, Kairouan',
    venueAr: 'قاعة عزيز ميلاد، القيروان',
    status: 'finished',
    rawStatus: 'FT',
    homeTeam: { id: 'bb_jsk', name: 'JS Kairouan', nameAr: 'الجمعية الرياضية القيروانية', logo: '/teams/jsk.svg', isUSM: false },
    awayTeam: { id: 'bb_usm', name: 'US Monastir', nameAr: 'الاتحاد الرياضي المنستيري', logo: '/logo basket.png', isUSM: true },
    score: { home: 76, away: 78 },
    quarters: { home: [19, 21, 18, 18], away: [20, 18, 22, 18] },
    stats: {
      rebounds: { home: 36, away: 41 },
      assists: { home: 18, away: 22 },
      threePointers: { home: 8, away: 11 },
      fouls: { home: 21, away: 19 },
    },
  },
  {
    externalId: 'bb-proa-fin2-2026',
    sport: 'basketball',
    competitionId: 'pro-a-basketball',
    competition: 'Super Play-off Pro A — Finale (Match 2)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 2)',
    season: '2025/26',
    round: 'Finale - Match 2',
    date: '2026-04-02T17:00:00+01:00',
    time: '17:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'finished',
    rawStatus: 'FT',
    homeTeam: { id: 'bb_usm', name: 'US Monastir', nameAr: 'الاتحاد الرياضي المنستيري', logo: '/logo basket.png', isUSM: true },
    awayTeam: { id: 'bb_jsk', name: 'JS Kairouan', nameAr: 'الجمعية الرياضية القيروانية', logo: '/teams/jsk.svg', isUSM: false },
    score: { home: 71, away: 69 },
    quarters: { home: [19, 17, 18, 17], away: [16, 18, 17, 18] },
    stats: {
      rebounds: { home: 44, away: 38 },
      assists: { home: 20, away: 16 },
      threePointers: { home: 7, away: 9 },
      fouls: { home: 18, away: 22 },
    },
  },
  {
    externalId: 'bb-proa-fin1-2026',
    sport: 'basketball',
    competitionId: 'pro-a-basketball',
    competition: 'Super Play-off Pro A — Finale (Match 1)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 1)',
    season: '2025/26',
    round: 'Finale - Match 1',
    date: '2026-03-29T17:00:00+01:00',
    time: '17:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'finished',
    rawStatus: 'FT',
    homeTeam: { id: 'bb_usm', name: 'US Monastir', nameAr: 'الاتحاد الرياضي المنستيري', logo: '/logo basket.png', isUSM: true },
    awayTeam: { id: 'bb_jsk', name: 'JS Kairouan', nameAr: 'الجمعية الرياضية القيروانية', logo: '/teams/jsk.svg', isUSM: false },
    score: { home: 78, away: 75 },
    quarters: { home: [22, 18, 19, 19], away: [18, 19, 18, 20] },
    stats: {
      rebounds: { home: 42, away: 39 },
      assists: { home: 24, away: 17 },
      threePointers: { home: 10, away: 8 },
      fouls: { home: 17, away: 23 },
    },
  },
  {
    externalId: 'bb-bal-2025-hoopers',
    sport: 'basketball',
    competitionId: 'bal-2025',
    competition: 'Basketball Africa League (BAL)',
    competitionAr: 'الدوري الإفريقي لكرة السلة',
    season: '2024/25',
    round: 'Phase Finale BAL',
    date: '2025-06-07T18:00:00+01:00',
    time: '18:00',
    venue: 'SunBet Arena, Pretoria, Afrique du Sud',
    venueAr: 'صن بيت أرينا، بريتوريا، جنوب إفريقيا',
    status: 'finished',
    rawStatus: 'FT',
    homeTeam: { id: 'bb_usm', name: 'US Monastir', nameAr: 'الاتحاد الرياضي المنستيري', logo: '/logo basket.png', isUSM: true },
    awayTeam: { id: 'bb_hoopers', name: 'Rivers Hoopers', nameAr: 'ريفرز هوبرز', logo: null, isUSM: false },
    score: { home: 89, away: 81 },
    quarters: { home: [24, 20, 23, 22], away: [19, 22, 18, 22] },
    stats: {
      rebounds: { home: 45, away: 35 },
      assists: { home: 25, away: 19 },
      threePointers: { home: 12, away: 7 },
      fouls: { home: 16, away: 20 },
    },
  },
];

export const REAL_BASKETBALL_FIXTURES: FixtureDto[] = [
  {
    externalId: 'bb-proa-2026-j1',
    sport: 'basketball',
    competitionId: 'pro-a-basketball',
    competition: 'Championnat National Pro A — J1',
    competitionAr: 'البطولة الوطنية المحترفة أ — الجولة 1',
    season: '2026/27',
    round: 'Journée 1',
    date: '2026-10-18T18:00:00+01:00',
    time: '18:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'upcoming',
    rawStatus: 'NS',
    homeTeam: { id: 'bb_usm', name: 'US Monastir', nameAr: 'الاتحاد الرياضي المنستيري', logo: '/logo basket.png', isUSM: true },
    awayTeam: { id: 'bb_ca', name: 'Club Africain', nameAr: 'النادي الإفريقي', logo: '/teams/ca.png', isUSM: false },
    score: { home: null, away: null },
    quarters: null,
  },
  {
    externalId: 'bb-proa-2026-j2',
    sport: 'basketball',
    competitionId: 'pro-a-basketball',
    competition: 'Championnat National Pro A — J2',
    competitionAr: 'البطولة الوطنية المحترفة أ — الجولة 2',
    season: '2026/27',
    round: 'Journée 2',
    date: '2026-10-25T17:30:00+01:00',
    time: '17:30',
    venue: 'Salle Olympique de Sousse',
    venueAr: 'القاعة الأولمبية بسوسة',
    status: 'upcoming',
    rawStatus: 'NS',
    homeTeam: { id: 'bb_ess', name: 'Étoile du Sahel', nameAr: 'النجم الرياضي الساحلي', logo: '/teams/ess.png', isUSM: false },
    awayTeam: { id: 'bb_usm', name: 'US Monastir', nameAr: 'الاتحاد الرياضي المنستيري', logo: '/logo basket.png', isUSM: true },
    score: { home: null, away: null },
    quarters: null,
  },
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

  async getFixtures(teamExternalId: string, leagueExternalId?: string, season?: string): Promise<FixtureDto[]> {
    return REAL_BASKETBALL_FIXTURES;
  }

  async getResults(teamExternalId: string, leagueExternalId?: string, season?: string, limit = 10): Promise<FixtureDto[]> {
    return REAL_BASKETBALL_RESULTS.slice(0, limit);
  }

  async getMatch(matchExternalId: string): Promise<FixtureDto | null> {
    const all = [...REAL_BASKETBALL_RESULTS, ...REAL_BASKETBALL_FIXTURES];
    return all.find((m) => m.externalId === matchExternalId) || null;
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

