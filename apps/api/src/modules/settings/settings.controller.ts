import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FanPhoto } from './fan-photo.schema';
import { HomepageSettings } from './homepage-settings.schema';
import { ClubSettings } from './club-settings.schema';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings/homepage') getHomepage() { return this.settings.getHomepage(); }
  @Get('settings/club') getClubSettings() { return this.settings.getClubSettings(); }
  @Get('fan-photos') getFanPhotos() { return this.settings.listFanPhotos(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin', 'Boutique Manager')
  @Patch('admin/settings/homepage') updateHomepage(@Body() body: Partial<HomepageSettings>) { return this.settings.updateHomepage(body); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin')
  @Patch('admin/settings/club') updateClubSettings(@Body() body: Partial<ClubSettings>) { return this.settings.updateClubSettings(body); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin')
  @Get('admin/fan-photos') getAdminFanPhotos() { return this.settings.listFanPhotos(true); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin')
  @Post('admin/fan-photos') createFanPhoto(@Body() body: Partial<FanPhoto>) { return this.settings.createFanPhoto(body); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin')
  @Patch('admin/fan-photos/:id') updateFanPhoto(@Param('id') id: string, @Body() body: Partial<FanPhoto>) { return this.settings.updateFanPhoto(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin')
  @Delete('admin/fan-photos/:id') @HttpCode(204) deleteFanPhoto(@Param('id') id: string) { return this.settings.deleteFanPhoto(id); }
}
