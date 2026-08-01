import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeasonPerformance, SeasonPerformanceSchema } from './season-performance.schema';
import { SeasonPerformanceService } from './season-performance.service';
import { SeasonPerformanceController } from './season-performance.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SeasonPerformance.name, schema: SeasonPerformanceSchema }]),
    AuthModule,
  ],
  controllers: [SeasonPerformanceController],
  providers: [SeasonPerformanceService],
  exports: [SeasonPerformanceService],
})
export class SeasonPerformanceModule {}
