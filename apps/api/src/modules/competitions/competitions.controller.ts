import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get('competitions')
  findPublic(@Query('sport') sport?: string) {
    return this.competitionsService.findPublic(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/competitions')
  findAllAdmin() {
    return this.competitionsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/competitions')
  create(@Body() body: Record<string, unknown>) {
    return this.competitionsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/competitions/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.competitionsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/competitions/:id')
  remove(@Param('id') id: string) {
    return this.competitionsService.remove(id);
  }
}
