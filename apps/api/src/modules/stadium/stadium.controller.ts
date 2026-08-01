import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StadiumPageService } from './stadium-page.service';
import { VenuesService } from './venues.service';
import { Venue } from './venue.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class StadiumController {
  constructor(
    private readonly stadiumPageService: StadiumPageService,
    private readonly venuesService: VenuesService,
  ) {}

  @Get('stadium-page')
  getPublicPage() {
    return this.stadiumPageService.getPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/stadium-page')
  getAdminPage() {
    return this.stadiumPageService.getAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/stadium-page')
  updatePage(@Body() body: Record<string, unknown>) {
    return this.stadiumPageService.update(body);
  }

  @Get('venues')
  findPublicVenues(@Query('sport') sport?: string) {
    return this.venuesService.findPublic(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/venues')
  findAllVenues(@Query('sport') sport?: string) {
    return this.venuesService.findAll(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/venues')
  createVenue(@Body() body: Partial<Venue>) {
    return this.venuesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/venues/:id')
  updateVenue(@Param('id') id: string, @Body() body: Partial<Venue>) {
    return this.venuesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/venues/:id')
  deleteVenue(@Param('id') id: string) {
    return this.venuesService.delete(id);
  }
}
