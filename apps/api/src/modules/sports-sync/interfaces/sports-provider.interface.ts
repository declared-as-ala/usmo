export type SportType = 'football' | 'basketball';
export type SyncResourceType = 'standings' | 'fixtures' | 'results' | 'live' | 'all';
export type SyncTriggerSource = 'CRON' | 'MANUAL' | 'POST_MATCH_TRIGGER' | 'SYSTEM';
export type DataSourceType = 'EXTERNAL_API' | 'MANUAL' | 'HYBRID';
export type SyncStatusType = 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED' | 'IN_PROGRESS';

export interface StandingDto {
  position: number;
  teamId: string;
  teamName: string;
  teamLogo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string | null;
  isUSM: boolean;
  rawStats?: Record<string, unknown>;
}

export interface MatchScoreDto {
  home: number | null;
  away: number | null;
}

export interface MatchTeamDto {
  id: string;
  name: string;
  nameAr?: string;
  logo: string | null;
  isUSM: boolean;
}

export interface MatchEventDto {
  id: string;
  time: number;
  type: 'goal' | 'basket' | 'card-yellow' | 'card-red' | 'foul' | 'substitution' | 'timeout';
  team: 'home' | 'away';
  player: string;
  playerAr?: string;
  detail?: string;
  detailAr?: string;
}

export interface FixtureDto {
  externalId: string;
  sport: SportType;
  competitionId?: string;
  competition: string;
  competitionAr?: string;
  season: string;
  round?: string | null;
  date: string; // ISO string e.g. "2026-08-24T16:00:00+01:00"
  time: string; // "16:00"
  venue: string | null;
  venueAr?: string | null;
  status: 'upcoming' | 'live' | 'finished';
  rawStatus?: string;
  homeTeam: MatchTeamDto;
  awayTeam: MatchTeamDto;
  score: MatchScoreDto;
  quarters?: { home: number[]; away: number[] } | null;
  timeline?: MatchEventDto[];
  stats?: Record<string, { home: number; away: number }>;
}

export interface TeamProfileDto {
  id: string;
  name: string;
  shortName?: string | null;
  badge?: string | null;
  stadium?: string | null;
  stadiumCapacity?: number | null;
  formedYear?: number | null;
  league?: string | null;
  description?: string | null;
  website?: string | null;
}

export interface CompetitionSummaryDto {
  id: string;
  name: string;
  nameAr?: string;
  logo?: string | null;
  country: string;
  currentSeason: string;
}

export interface SportsDataProvider {
  readonly providerName: string;
  getStandings(leagueExternalId: string, season: string): Promise<StandingDto[]>;
  getFixtures(teamExternalId: string, leagueExternalId?: string, season?: string): Promise<FixtureDto[]>;
  getResults(teamExternalId: string, leagueExternalId?: string, season?: string, limit?: number): Promise<FixtureDto[]>;
  getMatch(matchExternalId: string): Promise<FixtureDto | null>;
  getLiveMatches(teamExternalId?: string, leagueExternalId?: string): Promise<FixtureDto[]>;
  getTeamInfo(teamExternalId: string): Promise<TeamProfileDto | null>;
  getCompetitionInfo(leagueExternalId: string): Promise<CompetitionSummaryDto | null>;
}
