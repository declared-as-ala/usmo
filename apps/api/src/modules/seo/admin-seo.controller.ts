import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { SYSTEM_PERMISSIONS } from '../roles/default-roles';

@Controller('admin/seo')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminSeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('overview')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  async getOverview() {
    return this.seoService.getOverview();
  }

  @Get('content')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  async getContentList(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('missing') missing?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.seoService.getContentList({
      type,
      status,
      missing,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('content/:type/:id')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  async getContentItem(@Param('type') type: string, @Param('id') id: string) {
    return this.seoService.getContentItem(type, id);
  }

  @Patch('content/:type/:id')
  @Permissions(SYSTEM_PERMISSIONS.SEO_EDIT)
  async updateContentItem(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const adminEmail = req.user?.email || 'admin';
    return this.seoService.updateContentItem(type, id, body, adminEmail);
  }

  @Post('bulk')
  @Permissions(SYSTEM_PERMISSIONS.SEO_BULK_EDIT)
  async bulkAction(@Body() body: { action: string; ids?: string[] }) {
    return this.seoService.bulkAction(body.action, body.ids || []);
  }

  @Post('analyze-all')
  @Permissions(SYSTEM_PERMISSIONS.SEO_ANALYZE)
  async analyzeAll() {
    return this.seoService.analyzeAll();
  }

  @Get('settings')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  async getSettings() {
    return this.seoService.getSettings();
  }

  @Patch('settings')
  @Permissions(SYSTEM_PERMISSIONS.SEO_MANAGE_SETTINGS)
  async updateSettings(@Body() body: any) {
    return this.seoService.updateSettings(body);
  }

  @Get('redirects')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  async getRedirects() {
    return this.seoService.getRedirects();
  }

  @Post('redirects')
  @Permissions(SYSTEM_PERMISSIONS.SEO_MANAGE_REDIRECTS)
  async createRedirect(@Body() body: any, @Req() req: any) {
    const adminEmail = req.user?.email || 'admin';
    return this.seoService.createRedirect(body, adminEmail);
  }

  @Patch('redirects/:id')
  @Permissions(SYSTEM_PERMISSIONS.SEO_MANAGE_REDIRECTS)
  async updateRedirect(@Param('id') id: string, @Body() body: any) {
    return this.seoService.updateRedirect(id, body);
  }

  @Delete('redirects/:id')
  @Permissions(SYSTEM_PERMISSIONS.SEO_MANAGE_REDIRECTS)
  async deleteRedirect(@Param('id') id: string) {
    return this.seoService.deleteRedirect(id);
  }

  @Get('404')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  async getNotFoundLogs() {
    return this.seoService.getNotFoundLogs();
  }

  @Get('export')
  @Permissions(SYSTEM_PERMISSIONS.SEO_VIEW)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="usm-seo-report.csv"')
  async exportCsv(@Res() res: Response) {
    const csv = await this.seoService.exportCsv();
    return res.send(csv);
  }
}
