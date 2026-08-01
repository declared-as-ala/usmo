import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FanPoint, FanPointSchema, FanVote, FanVoteSchema, FanVoteEntry, FanVoteEntrySchema } from './fan-zone.schema';
import { FanZoneService } from './fan-zone.service';
import { FanZoneController } from './fan-zone.controller';
import { MembershipsModule } from '../memberships/memberships.module';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FanPoint.name, schema: FanPointSchema },
      { name: FanVote.name, schema: FanVoteSchema },
      { name: FanVoteEntry.name, schema: FanVoteEntrySchema },
    ]),
    MembershipsModule,
    AuthModule,
    LoyaltyModule,
  ],
  controllers: [FanZoneController],
  providers: [FanZoneService],
  exports: [FanZoneService],
})
export class FanZoneModule {}
