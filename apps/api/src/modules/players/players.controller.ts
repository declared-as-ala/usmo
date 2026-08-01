import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('players')
  findPublic(@Query('sport') sport?: string) {
    return this.playersService.findPublic(sport);
  }

  @Get('players/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.playersService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/players')
  findAllAdmin(@Query('sport') sport?: string) {
    return this.playersService.findAllAdmin(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/players')
  create(@Body() body: Record<string, unknown>) {
    return this.playersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/players/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.playersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/players/:id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
