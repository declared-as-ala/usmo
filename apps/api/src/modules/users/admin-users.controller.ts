import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.usersService.findAllAdmin(search, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findAdminDetail(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'Active' | 'Inactive') {
    return this.usersService.update(id, { status });
  }
}
