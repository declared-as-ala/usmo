import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserNotification, UserNotificationSchema } from './notification.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserNotification.name, schema: UserNotificationSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
