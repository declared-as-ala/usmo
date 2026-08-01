import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryPage, HistoryPageSchema } from './history-page.schema';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HistoryPage.name, schema: HistoryPageSchema }]),
    AuthModule,
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
