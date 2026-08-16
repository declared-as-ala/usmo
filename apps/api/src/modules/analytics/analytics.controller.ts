import { Controller, Post, Get, Body, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ── Public Ingestion Endpoint (Rate-Limited) ──────────────────────────────

  @UseGuards(ThrottlerGuard)
  @Post('analytics/events')
  async logEvent(
    @Body()
    body: {
      eventType: string;
      sessionId: string;
      anonymousVisitorId?: string;
      userId?: string;
      path: string;
      pageTitle?: string;
      referrer?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      utmTerm?: string;
      utmContent?: string;
      country?: string;
      region?: string;
      city?: string;
      deviceType?: 'desktop' | 'mobile' | 'tablet';
      browser?: string;
      operatingSystem?: string;
      metadata?: Record<string, any>;
    },
    @Req() req: Request,
  ) {
    return this.analyticsService.logEvent({
      ...body,
      ip: req.ip,
    });
  }

  // ── Admin Protected Analytics Endpoints ────────────────────────────────────

  @Get('admin/analytics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getOverview(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getOverview(range, from, to);
  }

  @Get('admin/analytics/traffic')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getTrafficTimeline(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getTrafficTimeline(range, from, to);
  }

  @Get('admin/analytics/sources')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getSources(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getSources(range, from, to);
  }

  @Get('admin/analytics/geography')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getGeography(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getGeography(range, from, to);
  }

  @Get('admin/analytics/devices')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getDevices(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getDevices(range, from, to);
  }

  @Get('admin/analytics/pages')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getPages(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getPages(range, from, to);
  }

  @Get('admin/analytics/content')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getContentAnalytics(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getContentAnalytics(range, from, to);
  }

  @Get('admin/analytics/realtime')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.view')
  getRealtime() {
    return this.analyticsService.getRealtimeDetails();
  }

  @Get('admin/analytics/export')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('analytics.export')
  async exportCsv(
    @Query('range') range: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csvContent = await this.analyticsService.exportCsvReport(range, from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=usm-analytics-export-${Date.now()}.csv`);
    return res.send(csvContent);
  }
}
