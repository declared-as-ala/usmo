import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineEvent } from './timeline-event.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('timeline')
  findPublic() {
    return this.timelineService.findPublic();
  }

  @Get('timeline/on-this-day')
  onThisDay() {
    return this.timelineService.findOnThisDay();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/timeline')
  findAll() {
    return this.timelineService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/timeline')
  create(@Body() body: Partial<TimelineEvent>) {
    return this.timelineService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/timeline/:id')
  update(@Param('id') id: string, @Body() body: Partial<TimelineEvent>) {
    return this.timelineService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/timeline/:id')
  delete(@Param('id') id: string) {
    return this.timelineService.delete(id);
  }
}
