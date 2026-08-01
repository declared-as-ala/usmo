import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trophy, TrophySchema } from './trophy.schema';
import { TrophiesService } from './trophies.service';
import { TrophiesController } from './trophies.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trophy.name, schema: TrophySchema }]),
    AuthModule,
  ],
  controllers: [TrophiesController],
  providers: [TrophiesService],
  exports: [TrophiesService],
})
export class TrophiesModule {}
