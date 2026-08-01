import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Membership, MembershipSchema } from './membership.schema';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { MembershipPlansModule } from '../membership-plans/membership-plans.module';
import { AuditLogsModule } from '../auditlogs/auditlogs.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membership.name, schema: MembershipSchema },
    ]),
    MembershipPlansModule,
    AuditLogsModule,
    LoyaltyModule,
    NotificationsModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService, MongooseModule],
})
export class MembershipsModule {}
