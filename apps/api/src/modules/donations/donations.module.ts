import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation, DonationSchema } from './donation.schema';
import { FanPoint, FanPointSchema } from '../fan-zone/fan-zone.schema';
import { User, UserSchema } from '../users/user.schema';
import { AuditLogsModule } from '../auditlogs/auditlogs.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Donation.name, schema: DonationSchema },
      { name: FanPoint.name, schema: FanPointSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditLogsModule,
    LoyaltyModule,
    NotificationsModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
