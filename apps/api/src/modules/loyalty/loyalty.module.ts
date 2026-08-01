import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Badge, BadgeSchema, FanBadge, FanBadgeSchema } from './badge.schema';
import { Reward, RewardSchema, RewardRedemption, RewardRedemptionSchema } from './reward.schema';
import { FanPoint, FanPointSchema } from '../fan-zone/fan-zone.schema';
import { BadgesService } from './badges.service';
import { RewardsService } from './rewards.service';
import { BadgesController } from './badges.controller';
import { RewardsController } from './rewards.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Badge.name, schema: BadgeSchema },
      { name: FanBadge.name, schema: FanBadgeSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRedemption.name, schema: RewardRedemptionSchema },
      { name: FanPoint.name, schema: FanPointSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [BadgesController, RewardsController],
  providers: [BadgesService, RewardsService],
  exports: [BadgesService, RewardsService],
})
export class LoyaltyModule {}
