import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SportIntegrationSettingsDto {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  leagueExternalId?: string;

  @IsOptional()
  @IsString()
  teamExternalId?: string;

  @IsOptional()
  @IsString()
  currentSeason?: string;

  @IsOptional()
  @IsString()
  currentSeasonLabel?: string;

  @IsOptional()
  @IsBoolean()
  autoDetectSeason?: boolean;

  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;

  @IsOptional()
  @IsString()
  apiKey?: string;
}

export class SyncIntervalsSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  normalStandingsMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  matchdayStandingsMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  liveMatchMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  normalFixturesMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  normalResultsMinutes?: number;

  @IsOptional()
  @IsString()
  nightlySyncCron?: string;
}

export class UpdateSportsConfigDto {
  @IsOptional()
  football?: SportIntegrationSettingsDto;

  @IsOptional()
  basketball?: SportIntegrationSettingsDto;

  @IsOptional()
  intervals?: SyncIntervalsSettingsDto;
}
