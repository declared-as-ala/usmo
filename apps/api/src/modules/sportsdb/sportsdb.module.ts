import { Module } from '@nestjs/common';
import { SportsDbService } from './sportsdb.service';
import { SportsDbController } from './sportsdb.controller';

@Module({
  controllers: [SportsDbController],
  providers: [SportsDbService],
  exports: [SportsDbService],
})
export class SportsDbModule {}
