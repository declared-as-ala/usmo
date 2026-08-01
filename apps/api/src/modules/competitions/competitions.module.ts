import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Competition, CompetitionSchema } from './competition.schema';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Competition.name, schema: CompetitionSchema }]),
    AuthModule,
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
