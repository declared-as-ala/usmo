import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LegendsService } from './legends.service';
import { Legend } from './legend.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class LegendsController {
  constructor(private readonly legendsService: LegendsService) {}

  @Get('legends')
  findPublic(@Query('sport') sport?: string) {
    return this.legendsService.findPublic(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/legends')
  findAll(@Query('sport') sport?: string) {
    return this.legendsService.findAll(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/legends')
  create(@Body() body: Partial<Legend>) {
    return this.legendsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/legends/:id')
  update(@Param('id') id: string, @Body() body: Partial<Legend>) {
    return this.legendsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/legends/:id')
  delete(@Param('id') id: string) {
    return this.legendsService.delete(id);
  }
}
