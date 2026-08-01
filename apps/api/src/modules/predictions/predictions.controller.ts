import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('match/:matchId')
  findByMatch(@Param('matchId') matchId: string) {
    return this.predictionsService.findByMatch(matchId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('match/:matchId/mine')
  findMine(@Param('matchId') matchId: string, @Req() req: any) {
    return this.predictionsService.findMine(req.user.sub, matchId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  submit(
    @Req() req: any,
    @Body() body: { matchId: string; matchLabel: string; homeScore: number; awayScore: number },
  ) {
    return this.predictionsService.submit(req.user.sub, body.matchId, body.matchLabel, body.homeScore, body.awayScore);
  }
}
