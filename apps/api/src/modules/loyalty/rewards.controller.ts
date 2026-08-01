import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from './reward.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('rewards')
  findPublic() {
    return this.rewardsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/rewards')
  findMine(@Req() req: any) {
    return this.rewardsService.findMyRedemptions(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/:id/redeem')
  redeem(@Param('id') id: string, @Req() req: any) {
    return this.rewardsService.redeem(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/rewards')
  findAllAdmin() {
    return this.rewardsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/rewards')
  create(@Body() body: Partial<Reward>) {
    return this.rewardsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/rewards/:id')
  update(@Param('id') id: string, @Body() body: Partial<Reward>) {
    return this.rewardsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/rewards/:id')
  delete(@Param('id') id: string) {
    return this.rewardsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/reward-redemptions')
  findAllRedemptionsAdmin() {
    return this.rewardsService.findAllRedemptionsAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/reward-redemptions/:id')
  updateRedemptionStatus(@Param('id') id: string, @Body() body: { status: 'fulfilled' | 'cancelled'; adminNote?: string }) {
    return this.rewardsService.updateRedemptionStatus(id, body.status, body.adminNote);
  }
}
