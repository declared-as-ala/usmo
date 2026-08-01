import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SeasonPerformanceService } from './season-performance.service';
import { SeasonPerformance } from './season-performance.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class SeasonPerformanceController {
  constructor(private readonly seasonPerformanceService: SeasonPerformanceService) {}

  @Get('season-performance')
  findPublic(@Query('sport') sport?: string, @Query('type') type?: string) {
    return this.seasonPerformanceService.findPublic(sport, type);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/season-performance')
  findAll(@Query('sport') sport?: string, @Query('type') type?: string) {
    return this.seasonPerformanceService.findAll(sport, type);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/season-performance')
  create(@Body() body: Partial<SeasonPerformance>) {
    return this.seasonPerformanceService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/season-performance/:id')
  update(@Param('id') id: string, @Body() body: Partial<SeasonPerformance>) {
    return this.seasonPerformanceService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/season-performance/:id')
  delete(@Param('id') id: string) {
    return this.seasonPerformanceService.delete(id);
  }
}
