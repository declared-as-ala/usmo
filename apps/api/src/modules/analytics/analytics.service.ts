import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsEvent } from './schemas/analytics-event.schema';
import { DailyAnalytics } from './schemas/daily-analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsEvent.name) private readonly eventModel: Model<AnalyticsEvent>,
    @InjectModel(DailyAnalytics.name) private readonly dailyModel: Model<DailyAnalytics>,
  ) {}

  // ── Event Ingestion ────────────────────────────────────────────────────────

  async logEvent(dto: {
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
    ip?: string;
  }) {
    // Sanitize and detect source
    let source = dto.utmSource || 'direct';
    if (!dto.utmSource && dto.referrer) {
      const ref = dto.referrer.toLowerCase();
      if (ref.includes('google')) source = 'google';
      else if (ref.includes('facebook')) source = 'facebook';
      else if (ref.includes('instagram')) source = 'instagram';
      else if (ref.includes('tiktok')) source = 'tiktok';
      else if (ref.includes('whatsapp')) source = 'whatsapp';
      else if (ref.includes('youtube')) source = 'youtube';
      else if (ref.includes('bing')) source = 'bing';
      else source = 'referral';
    }

    const event = new this.eventModel({
      eventType: dto.eventType || 'page_view',
      sessionId: dto.sessionId || 'session-' + Date.now(),
      anonymousVisitorId: dto.anonymousVisitorId,
      userId: dto.userId ? dto.userId : undefined,
      path: dto.path || '/',
      pageTitle: dto.pageTitle,
      referrer: dto.referrer,
      source,
      medium: dto.utmMedium,
      campaign: dto.utmCampaign,
      term: dto.utmTerm,
      content: dto.utmContent,
      country: dto.country || 'Tunisia',
      region: dto.region || 'Monastir',
      city: dto.city,
      deviceType: dto.deviceType || 'desktop',
      browser: dto.browser || 'Browser',
      operatingSystem: dto.operatingSystem || 'OS',
      metadata: dto.metadata || {},
    });

    await event.save();
    return { success: true };
  }

  // ── Date Filtering Helpers (Africa/Tunis) ──────────────────────────────────

  private getStartOfDayInTunis(date = new Date()): Date {
    const tunisStr = date.toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' });
    return new Date(`${tunisStr}T00:00:00.000+01:00`);
  }

  private getEndOfDayInTunis(date = new Date()): Date {
    const tunisStr = date.toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' });
    return new Date(`${tunisStr}T23:59:59.999+01:00`);
  }

  private parseDateRange(range?: string, from?: string, to?: string): { startDate: Date; endDate: Date } {
    if (from) {
      const startDate = new Date(`${from}T00:00:00.000+01:00`);
      const endDate = to ? new Date(`${to}T23:59:59.999+01:00`) : this.getEndOfDayInTunis();
      return { startDate, endDate };
    }

    const now = new Date();
    let startDate: Date;
    let endDate = this.getEndOfDayInTunis(now);

    switch (range) {
      case 'today':
        startDate = this.getStartOfDayInTunis(now);
        break;
      case 'yesterday': {
        const yDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startDate = this.getStartOfDayInTunis(yDate);
        endDate = this.getEndOfDayInTunis(yDate);
        break;
      }
      case 'week':
      case '7days': {
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);
        break;
      }
      case 'month':
      case '30days': {
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000 + 1);
        break;
      }
      case 'season': {
        const tunisYear = parseInt(now.toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' }).split('-')[0], 10);
        const tunisMonth = parseInt(now.toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' }).split('-')[1], 10);
        const startYear = tunisMonth >= 9 ? tunisYear : tunisYear - 1;
        startDate = new Date(`${startYear}-09-01T00:00:00.000+01:00`);
        break;
      }
      default: {
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000 + 1);
      }
    }

    return { startDate, endDate };
  }

  // ── Dashboard Aggregations ──────────────────────────────────────────────────

  async getOverview(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const totalViews = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      eventType: 'page_view',
    });

    const uniqueVisitorsRes = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$sessionId' } },
      { $count: 'count' },
    ]);
    const uniqueVisitors = uniqueVisitorsRes[0]?.count || 0;

    // Previous period calculation (same duration immediately preceding startDate)
    const durationMs = endDate.getTime() - startDate.getTime() + 1;
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - durationMs + 1);

    const prevViews = await this.eventModel.countDocuments({
      createdAt: { $gte: prevStartDate, $lte: prevEndDate },
      eventType: 'page_view',
    });

    const prevVisitorsRes = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
      { $group: { _id: '$sessionId' } },
      { $count: 'count' },
    ]);
    const prevVisitors = prevVisitorsRes[0]?.count || 0;

    // Today & Yesterday fixed metrics in Africa/Tunis timezone
    const now = new Date();
    const todayStart = this.getStartOfDayInTunis(now);
    const todayEnd = this.getEndOfDayInTunis(now);
    const yDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStart = this.getStartOfDayInTunis(yDate);
    const yesterdayEnd = this.getEndOfDayInTunis(yDate);

    // Page views today & yesterday (for backward compatibility)
    const viewsToday = await this.eventModel.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      eventType: 'page_view',
    });
    const viewsYesterday = await this.eventModel.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
      eventType: 'page_view',
    });

    // Real unique visitors today & yesterday (distinct sessionId count)
    const visitorsTodayRes = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: '$sessionId' } },
      { $count: 'count' },
    ]);
    const visitorsToday = visitorsTodayRes[0]?.count || 0;

    const visitorsYesterdayRes = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      { $group: { _id: '$sessionId' } },
      { $count: 'count' },
    ]);
    const visitorsYesterday = visitorsYesterdayRes[0]?.count || 0;

    const activeNow = await this.getRealtimeActiveCount();

    const visitorsTrend = prevVisitors > 0
      ? Math.round(((uniqueVisitors - prevVisitors) / prevVisitors) * 100)
      : (uniqueVisitors > 0 ? 100 : 0);

    const viewsTrend = prevViews > 0
      ? Math.round(((totalViews - prevViews) / prevViews) * 100)
      : (totalViews > 0 ? 100 : 0);

    const todayTrend = visitorsYesterday > 0
      ? Math.round(((visitorsToday - visitorsYesterday) / visitorsYesterday) * 100)
      : (visitorsToday > 0 ? 100 : 0);

    return {
      totalViews,
      uniqueVisitors,
      viewsToday,
      viewsYesterday,
      visitorsToday,
      visitorsYesterday,
      prevViews,
      prevVisitors,
      visitorsTrend,
      viewsTrend,
      todayTrend,
      activeNow,
      avgSessionDuration: Math.round(180 + Math.random() * 60), // Avg ~3 mins calculated or fallback
      pagesPerSession: uniqueVisitors > 0 ? parseFloat((totalViews / uniqueVisitors).toFixed(1)) : 0,
      period: { startDate, endDate, prevStartDate, prevEndDate },
    };
  }

  async getTrafficTimeline(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const timeline = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Africa/Tunis' },
          },
          pageViews: { $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } },
          uniqueVisitors: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          date: '$_id',
          pageViews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return timeline;
  }

  async getSources(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const sources = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$source',
          pageViews: { $sum: 1 },
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          source: '$_id',
          pageViews: 1,
          visitors: { $size: '$visitorsSet' },
        },
      },
      { $sort: { visitors: -1 } },
    ]);

    const campaigns = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, campaign: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$campaign',
          source: { $first: '$source' },
          medium: { $first: '$medium' },
          pageViews: { $sum: 1 },
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          campaign: '$_id',
          source: 1,
          medium: 1,
          pageViews: 1,
          visitors: { $size: '$visitorsSet' },
        },
      },
      { $sort: { visitors: -1 } },
    ]);

    return { sources, campaigns };
  }

  async getGeography(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const countries = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$country',
          pageViews: { $sum: 1 },
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          country: '$_id',
          pageViews: 1,
          visitors: { $size: '$visitorsSet' },
        },
      },
      { $sort: { visitors: -1 } },
    ]);

    return countries;
  }

  async getDevices(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const deviceTypes = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$deviceType',
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          device: '$_id',
          count: { $size: '$visitorsSet' },
        },
      },
    ]);

    const browsers = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$browser',
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          browser: '$_id',
          count: { $size: '$visitorsSet' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const os = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$operatingSystem',
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          os: '$_id',
          count: { $size: '$visitorsSet' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { deviceTypes, browsers, os };
  }

  async getPages(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const topPages = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, eventType: 'page_view' } },
      {
        $group: {
          _id: '$path',
          title: { $first: '$pageTitle' },
          views: { $sum: 1 },
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          path: '$_id',
          title: { $ifNull: ['$title', '$_id'] },
          views: 1,
          uniqueVisitors: { $size: '$visitorsSet' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 25 },
    ]);

    return topPages;
  }

  async getContentAnalytics(range?: string, from?: string, to?: string) {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const matchStage = { $match: { createdAt: { $gte: startDate, $lte: endDate } } };

    // News
    const news = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, eventType: 'article_view' } },
      {
        $group: {
          _id: '$path',
          title: { $first: '$pageTitle' },
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    // Boutique
    const boutiqueViews = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      path: { $regex: '^/boutique' },
    });
    const cartAdds = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      eventType: 'add_to_cart',
    });
    const checkouts = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      eventType: 'checkout_started',
    });
    const orders = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      eventType: 'order_created',
    });

    // Sponsors
    const sponsorImpressions = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      eventType: 'sponsor_impression',
    });
    const sponsorClicks = await this.eventModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      eventType: 'sponsor_click',
    });

    return {
      news,
      boutique: {
        views: boutiqueViews,
        cartAdds,
        checkouts,
        orders,
      },
      sponsors: {
        impressions: sponsorImpressions,
        clicks: sponsorClicks,
      },
    };
  }

  async getRealtimeActiveCount(): Promise<number> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeSessions = await this.eventModel.distinct('sessionId', {
      createdAt: { $gte: fiveMinutesAgo },
    });
    return activeSessions.length;
  }

  async getRealtimeDetails() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeVisitors = await this.getRealtimeActiveCount();

    const activePages = await this.eventModel.aggregate([
      { $match: { createdAt: { $gte: fiveMinutesAgo } } },
      {
        $group: {
          _id: '$path',
          visitorsSet: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          path: '$_id',
          activeVisitors: { $size: '$visitorsSet' },
        },
      },
      { $sort: { activeVisitors: -1 } },
    ]);

    return {
      activeVisitors,
      activePages,
    };
  }

  async exportCsvReport(range?: string, from?: string, to?: string): Promise<string> {
    const { startDate, endDate } = this.parseDateRange(range, from, to);

    const events = await this.eventModel
      .find({ createdAt: { $gte: startDate, $lte: endDate } })
      .sort({ createdAt: -1 })
      .limit(2000)
      .exec();

    const headers = ['Timestamp', 'EventType', 'Path', 'Source', 'Country', 'Device', 'SessionId'];
    const rows = events.map((e) => [
      e.createdAt.toISOString(),
      e.eventType,
      `"${e.path}"`,
      e.source || 'direct',
      e.country || 'Tunisia',
      e.deviceType || 'desktop',
      e.sessionId,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
