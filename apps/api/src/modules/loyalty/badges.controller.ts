import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { Badge } from './badge.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('badges')
  findPublic() {
    return this.badgesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/badges')
  findMine(@Req() req: any) {
    return this.badgesService.findMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/badges')
  findAllAdmin() {
    return this.badgesService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/badges')
  create(@Body() body: Partial<Badge>) {
    return this.badgesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/badges/:id')
  update(@Param('id') id: string, @Body() body: Partial<Badge>) {
    return this.badgesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/badges/:id')
  delete(@Param('id') id: string) {
    return this.badgesService.delete(id);
  }
}
