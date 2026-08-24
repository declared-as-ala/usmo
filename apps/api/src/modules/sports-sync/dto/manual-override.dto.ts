import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class StandingManualOverrideDto {
  @IsOptional()
  @IsBoolean()
  manualOverride?: boolean;

  @IsOptional()
  @IsDateString()
  manualOverrideUntil?: string | null;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsNumber()
  played?: number;

  @IsOptional()
  @IsNumber()
  won?: number;

  @IsOptional()
  @IsNumber()
  drawn?: number;

  @IsOptional()
  @IsNumber()
  lost?: number;

  @IsOptional()
  @IsNumber()
  goalsFor?: number;

  @IsOptional()
  @IsNumber()
  goalsAgainst?: number;

  @IsOptional()
  @IsNumber()
  goalDifference?: number;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsString()
  form?: string;
}

export class MatchManualOverrideDto {
  @IsOptional()
  @IsBoolean()
  manualOverride?: boolean;

  @IsOptional()
  @IsDateString()
  manualOverrideUntil?: string | null;

  @IsOptional()
  @IsString()
  homeTeam?: string;

  @IsOptional()
  @IsString()
  awayTeam?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  status?: 'upcoming' | 'live' | 'finished';

  @IsOptional()
  score?: { home: number; away: number };
}
