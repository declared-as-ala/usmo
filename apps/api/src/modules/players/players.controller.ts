import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('players')
  findPublic(
    @Query('sport') sport?: string,
    @Query('position') position?: string,
    @Query('season') season?: string,
    @Query('featured') featured?: string,
  ) {
    return this.playersService.findPublic({
      sport,
      position,
      season,
      isFeatured: featured === 'true',
    });
  }

  @Get('football/players')
  findFootballPlayers(@Query('position') position?: string, @Query('season') season?: string) {
    return this.playersService.findPublic({
      sport: 'football',
      position,
      season,
    });
  }

  @Get('basketball/players')
  findBasketballPlayers(@Query('position') position?: string, @Query('season') season?: string) {
    return this.playersService.findPublic({
      sport: 'basketball',
      position,
      season,
    });
  }

  @Get('players/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.playersService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Get('admin/players')
  findAllAdmin(
    @Query('sport') sport?: string,
    @Query('position') position?: string,
    @Query('season') season?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('withPhoto') withPhoto?: string,
  ) {
    return this.playersService.findAllAdmin({
      sport,
      position,
      season,
      status,
      search,
      withPhoto,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Get('admin/players/:id')
  findById(@Param('id') id: string) {
    return this.playersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Post('admin/players')
  create(@Body() body: Record<string, unknown>) {
    return this.playersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Patch('admin/players/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.playersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Patch('admin/players/:id/archive')
  archive(@Param('id') id: string) {
    return this.playersService.archive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Patch('admin/players/:id/restore')
  restore(@Param('id') id: string) {
    return this.playersService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Content Editor')
  @Post('admin/players/:id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.playersService.duplicateDraft(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/players/:id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
