import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FanZoneService } from './fan-zone.service';
import { CastVoteDto } from './fan-zone.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireActiveMembership } from '../auth/require-active-membership.guard';

@Controller('fan-zone')
export class FanZoneController {
  constructor(private readonly fanZoneService: FanZoneService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() req: any) {
    return this.fanZoneService.getDashboard(req.user.sub);
  }

  @Get('votes/active')
  async getActiveVote() {
    return this.fanZoneService.getActiveVote();
  }

  @Post('votes/:id/vote')
  @UseGuards(JwtAuthGuard, RequireActiveMembership)
  async castVote(
    @Param('id') voteId: string,
    @Body() dto: CastVoteDto,
    @Req() req: any,
  ) {
    return this.fanZoneService.castVote(req.user.sub, voteId, dto.optionKey);
  }

  @Get('ranking')
  @UseGuards(JwtAuthGuard)
  async getRanking() {
    return this.fanZoneService.getRanking();
  }

  @Get('points/history')
  @UseGuards(JwtAuthGuard)
  async getPointsHistory(@Req() req: any) {
    return this.fanZoneService.getPointsHistory(req.user.sub);
  }
}
