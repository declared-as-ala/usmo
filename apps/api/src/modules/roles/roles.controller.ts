import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @Permissions('admins.view')
  async getRoles() {
    return this.rolesService.findAll();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @Permissions('admins.create')
  async createRole(@Body() body: { name: string; code: string; description?: string; permissions: string[] }, @Req() req: any) {
    return this.rolesService.create(body, req.user._id || req.user.id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.edit')
  async updateRole(@Param('id') id: string, @Body() body: { name?: string; description?: string; permissions?: string[] }) {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.delete')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
