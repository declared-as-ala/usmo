import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SportsSyncService } from './sports-sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TriggerSyncDto } from './dto/sync-trigger.dto';
import { UpdateSportsConfigDto } from './dto/sports-config.dto';
import {
  MatchManualOverrideDto,
  StandingManualOverrideDto,
} from './dto/manual-override.dto';
import { SportType } from './interfaces/sports-provider.interface';

@Controller()
export class SportsSyncController {
  constructor(private readonly syncService: SportsSyncService) {}

  // ── Public Endpoints ───────────────────────────────────────────────────

  @Get('sports-sync/standings')
  async getStandings(
    @Query('sport') sport: SportType = 'football',
    @Query('season') season?: string,
  ) {
    return this.syncService.getPublicStandings(sport, season);
  }

  @Get('sports-sync/freshness')
  async getFreshness(@Query('sport') sport: SportType = 'football') {
    return this.syncService.getDataFreshness(sport);
  }

  // ── Admin Endpoints ────────────────────────────────────────────────────

  @Get('admin/sports-sync/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getHealthStatus() {
    return this.syncService.getHealthStatus();
  }

  @Get('admin/sports-sync/logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getSyncLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('sport') sport?: string,
    @Query('status') status?: string,
  ) {
    return this.syncService.getSyncLogs(Number(page) || 1, Number(limit) || 20, sport, status);
  }

  @Post('admin/sports-sync/trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async triggerSync(@Body() body: TriggerSyncDto) {
    const sport = body.sport;
    const resourceType = body.resourceType || 'all';

    if (resourceType === 'all') {
      return this.syncService.syncAll(sport, 'MANUAL');
    }

    if (resourceType === 'standings') {
      return this.syncService.syncStandings(sport || 'football', 'MANUAL');
    }

    if (resourceType === 'fixtures') {
      return this.syncService.syncUpcomingMatches(sport || 'football', 'MANUAL');
    }

    if (resourceType === 'results') {
      return this.syncService.syncRecentResults(sport || 'football', 'MANUAL', 10);
    }

    return this.syncService.syncAll(sport, 'MANUAL');
  }

  @Get('admin/sports-sync/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getConfig() {
    const health = await this.syncService.getHealthStatus();
    return {
      football: health.football,
      basketball: health.basketball,
    };
  }

  @Patch('admin/sports-sync/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  async updateConfig(@Body() body: UpdateSportsConfigDto) {
    return this.syncService.updateConfig(body);
  }

  @Patch('admin/sports-sync/manual-override/standing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async overrideStanding(
    @Param('id') id: string,
    @Body() body: StandingManualOverrideDto,
  ) {
    return this.syncService.overrideStanding(id, body);
  }

  @Patch('admin/sports-sync/manual-override/match/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async overrideMatch(
    @Param('id') id: string,
    @Body() body: MatchManualOverrideDto,
  ) {
    return this.syncService.overrideMatch(id, body);
  }
}
