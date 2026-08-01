import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me/support-tickets')
  create(@Req() req: any, @Body() body: { subject: string; category: string; message: string }) {
    return this.supportService.create(req.user.sub, body.subject, body.category, body.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/support-tickets')
  findMine(@Req() req: any) {
    return this.supportService.findMine(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/support-tickets/:id')
  findOneMine(@Param('id') id: string, @Req() req: any) {
    return this.supportService.findOneMine(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/support-tickets/:id/reply')
  replyAsFan(@Param('id') id: string, @Req() req: any, @Body('message') message: string) {
    return this.supportService.replyAsFan(req.user.sub, id, message);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/support-tickets')
  findAllAdmin() {
    return this.supportService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/support-tickets/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.supportService.findOneAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/support-tickets/:id/reply')
  replyAsAdmin(@Param('id') id: string, @Body('message') message: string) {
    return this.supportService.replyAsAdmin(id, message);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/support-tickets/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'open' | 'answered' | 'closed') {
    return this.supportService.updateStatus(id, status);
  }
}
