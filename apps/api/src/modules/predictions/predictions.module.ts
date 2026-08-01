import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchPrediction, MatchPredictionSchema } from './prediction.schema';
import { FanPoint, FanPointSchema } from '../fan-zone/fan-zone.schema';
import { User, UserSchema } from '../users/user.schema';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchPrediction.name, schema: MatchPredictionSchema },
      { name: FanPoint.name, schema: FanPointSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LoyaltyModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
