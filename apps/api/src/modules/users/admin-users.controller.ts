import { Body, Controller, Get, Param, Patch, Post, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Fans / Users Management (Accessible by authorized admins) ─────────────

  @Get('users')
  @Permissions('users.view')
  findAllUsers(@Query('search') search?: string, @Query('status') status?: string) {
    return this.usersService.findAllAdmin(search, status);
  }

  @Get('users/:id')
  @Permissions('users.view')
  findOneUser(@Param('id') id: string) {
    return this.usersService.findAdminDetail(id);
  }

  @Patch('users/:id/status')
  @Permissions('users.suspend')
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: 'Active' | 'Inactive',
    @Req() req: any,
  ) {
    return this.usersService.updateFanStatus(id, status, req.user._id || req.user.id);
  }

  @Patch('users/:id/notes')
  @Permissions('users.edit')
  updateUserNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.usersService.updateFanNotes(id, notes, req.user._id || req.user.id);
  }

  @Post('users/:id/promote')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.create')
  promoteUserToAdmin(
    @Param('id') id: string,
    @Body() body: { role: string; permissions: string[] },
    @Req() req: any,
  ) {
    return this.usersService.promoteUserToAdmin(
      id,
      body.role,
      body.permissions,
      req.user._id || req.user.id,
    );
  }

  // ── Administrators Management (SUPER ADMIN ONLY) ───────────────────────────

  @Get('administrateurs')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.view')
  findAllAdministrators(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAllAdministrators({ search, role, status });
  }

  @Get('administrateurs/:id')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.view')
  getAdminDetails(@Param('id') id: string) {
    return this.usersService.getAdminDetails(id);
  }

  @Post('administrateurs')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.create')
  inviteAdmin(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: string;
      permissions?: string[];
      sendInvitation?: boolean;
    },
    @Req() req: any,
  ) {
    return this.usersService.inviteAdmin({
      ...body,
      actorId: req.user._id || req.user.id,
    });
  }

  @Patch('administrateurs/:id/role')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.assign_roles')
  updateAdminRoleAndPermissions(
    @Param('id') id: string,
    @Body() body: { role: string; permissions: string[] },
    @Req() req: any,
  ) {
    return this.usersService.updateAdminRoleAndPermissions(
      id,
      body.role,
      body.permissions,
      req.user._id || req.user.id,
    );
  }

  @Patch('administrateurs/:id/status')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.edit')
  suspendOrReactivateAdmin(
    @Param('id') id: string,
    @Body('suspend') suspend: boolean,
    @Req() req: any,
  ) {
    return this.usersService.suspendOrReactivateAdmin(
      id,
      suspend,
      req.user._id || req.user.id,
    );
  }

  @Post('administrateurs/:id/reset-access')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.edit')
  resetAdminAccess(@Param('id') id: string, @Req() req: any) {
    return this.usersService.resetAdminAccess(id, req.user._id || req.user.id);
  }

  @Delete('administrateurs/:id')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.delete')
  deleteAdmin(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deleteAdmin(id, req.user._id || req.user.id);
  }

  @Delete('administrateurs/:id/sessions/:sessionId')
  @Roles('SUPER_ADMIN')
  @Permissions('admins.edit')
  revokeSession(@Param('sessionId') sessionId: string, @Req() req: any) {
    return this.usersService.revokeSession(sessionId, req.user._id || req.user.id);
  }
}
