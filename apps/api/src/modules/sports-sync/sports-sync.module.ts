import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Standing, StandingSchema } from './schemas/standing.schema';
import { SportsSyncStatus, SportsSyncStatusSchema } from './schemas/sports-sync-status.schema';
import { SportsSyncLog, SportsSyncLogSchema } from './schemas/sports-sync-log.schema';
import { SportsConfig, SportsConfigSchema } from './schemas/sports-config.schema';
import { SportsSyncLock, SportsSyncLockSchema } from './schemas/sports-sync-lock.schema';
import { Match, MatchSchema } from '../matches/match.schema';
import { ApiFootballProvider } from './providers/api-football.provider';
import { TheSportsDbProvider } from './providers/thesportsdb.provider';
import { BasketballProvider } from './providers/basketball.provider';
import { SportsProviderService } from './sports-provider.service';
import { SportsSyncService } from './sports-sync.service';
import { SportsSyncScheduler } from './sports-sync.scheduler';
import { SportsSyncController } from './sports-sync.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Standing.name, schema: StandingSchema },
      { name: SportsSyncStatus.name, schema: SportsSyncStatusSchema },
      { name: SportsSyncLog.name, schema: SportsSyncLogSchema },
      { name: SportsConfig.name, schema: SportsConfigSchema },
      { name: SportsSyncLock.name, schema: SportsSyncLockSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [SportsSyncController],
  providers: [
    ApiFootballProvider,
    TheSportsDbProvider,
    BasketballProvider,
    SportsProviderService,
    SportsSyncService,
    SportsSyncScheduler,
  ],
  exports: [SportsSyncService, SportsProviderService],
})
export class SportsSyncModule {}
