import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SportType, SyncResourceType } from '../interfaces/sports-provider.interface';

export class TriggerSyncDto {
  @IsOptional()
  @IsEnum(['football', 'basketball'])
  sport?: SportType;

  @IsOptional()
  @IsEnum(['standings', 'fixtures', 'results', 'live', 'all'])
  resourceType?: SyncResourceType;

  @IsOptional()
  @IsString()
  competitionId?: string;

  @IsOptional()
  @IsString()
  season?: string;
}
