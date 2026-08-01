import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimelineEvent, TimelineEventSchema } from './timeline-event.schema';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimelineEvent.name, schema: TimelineEventSchema }]),
    AuthModule,
  ],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
