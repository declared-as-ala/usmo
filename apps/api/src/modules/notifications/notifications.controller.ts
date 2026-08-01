import { Controller, Get, Patch, Param, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('me/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Req() req: any) {
    return this.notificationsService.findMine(req.user.sub);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markRead(req.user.sub, id);
  }

  @Post('read-all')
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.sub);
  }
}
