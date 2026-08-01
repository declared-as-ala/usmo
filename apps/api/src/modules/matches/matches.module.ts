import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './match.schema';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    AuthModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
