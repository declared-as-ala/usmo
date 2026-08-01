import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('staff')
  findPublic(@Query('sport') sport?: string) {
    return this.staffService.findPublic(sport);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/staff')
  findAllAdmin() {
    return this.staffService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/staff')
  create(@Body() body: Record<string, unknown>) {
    return this.staffService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/staff/:id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.staffService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/staff/:id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
