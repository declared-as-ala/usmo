import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportTicket, SupportTicketSchema } from './support-ticket.schema';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
