import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TrophiesService } from './trophies.service';
import { Trophy } from './trophy.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class TrophiesController {
  constructor(private readonly trophiesService: TrophiesService) {}

  @Get('trophies')
  findPublic(@Query('sport') sport?: string) {
    return this.trophiesService.findPublic(sport);
  }

  // Convenience aliases matching the "palmarès" naming used on the public page.
  @Get('palmares')
  palmaresAll() {
    return this.trophiesService.findPublic();
  }

  @Get('palmares/football')
  palmaresFootball() {
    return this.trophiesService.findPublic('football');
  }

  @Get('palmares/basketball')
  palmaresBasketball() {
    return this.trophiesService.findPublic('basketball');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/trophies')
  findAll(@Query('sport') sport?: string) {
    return this.trophiesService.findAll(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/trophies')
  create(@Body() body: Partial<Trophy>) {
    return this.trophiesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/trophies/:id')
  update(@Param('id') id: string, @Body() body: Partial<Trophy>) {
    return this.trophiesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/trophies/:id')
  delete(@Param('id') id: string) {
    return this.trophiesService.delete(id);
  }
}
