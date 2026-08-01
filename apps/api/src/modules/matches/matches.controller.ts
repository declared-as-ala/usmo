import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('matches')
  findPublic(@Query('sport') sport?: string) {
    return this.matchesService.findPublic(sport);
  }

  @Get('matches/upcoming')
  findUpcoming(@Query('sport') sport?: string, @Query('limit') limit?: string) {
    return this.matchesService.findUpcoming(sport, limit ? parseInt(limit, 10) : 10);
  }

  @Get('matches/results')
  findResults(@Query('sport') sport?: string, @Query('limit') limit?: string) {
    return this.matchesService.findResults(sport, limit ? parseInt(limit, 10) : 10);
  }

  @Get('matches/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.matchesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/matches')
  findAllAdmin() {
    return this.matchesService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/matches')
  create(@Body() body: Record<string, unknown>) {
    return this.matchesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/matches/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.matchesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/matches/:id')
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/matches/:id/score')
  updateScore(@Param('id') id: string, @Body() body: { team: 'home' | 'away'; amount: number }) {
    return this.matchesService.updateScore(id, body.team, body.amount);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/matches/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: 'upcoming' | 'live' | 'finished' }) {
    return this.matchesService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/matches/:id/events')
  addEvent(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.matchesService.addEvent(id, body as any);
  }
}
