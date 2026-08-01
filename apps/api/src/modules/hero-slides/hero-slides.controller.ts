import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlide } from './hero-slide.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  @Get('homepage/hero-slides')
  findPublicHome() {
    return this.heroSlidesService.findPublic('home');
  }

  @Get('hero-slides')
  findPublic(@Query('page') page?: string) {
    return this.heroSlidesService.findPublic(page || 'home');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Get('admin/hero-slides')
  findAll(@Query('page') page?: string) {
    return this.heroSlidesService.findAll(page);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Post('admin/hero-slides')
  create(@Body() body: Partial<HeroSlide>) {
    return this.heroSlidesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Patch('admin/hero-slides/reorder')
  reorder(@Body('items') items: { id: string; displayOrder: number }[]) {
    return this.heroSlidesService.reorder(items);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Patch('admin/hero-slides/:id')
  update(@Param('id') id: string, @Body() body: Partial<HeroSlide>) {
    return this.heroSlidesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  @Delete('admin/hero-slides/:id')
  delete(@Param('id') id: string) {
    return this.heroSlidesService.delete(id);
  }
}
