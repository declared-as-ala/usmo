import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadItem } from './download-item.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get('downloads')
  findPublic(@Query('category') category?: string) {
    return this.downloadsService.findPublic(category);
  }

  @Post('downloads/:id/register')
  registerDownload(@Param('id') id: string) {
    return this.downloadsService.registerDownload(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/downloads')
  findAll(@Query('category') category?: string) {
    return this.downloadsService.findAll(category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('admin/downloads')
  create(@Body() body: Partial<DownloadItem>) {
    return this.downloadsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/downloads/:id')
  update(@Param('id') id: string, @Body() body: Partial<DownloadItem>) {
    return this.downloadsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('admin/downloads/:id')
  delete(@Param('id') id: string) {
    return this.downloadsService.delete(id);
  }
}
