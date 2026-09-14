import { Controller, Get, Post, Query, Body, Req } from '@nestjs/common';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('metadata')
  async getMetadata(@Query('path') path: string) {
    if (!path) return null;
    return this.seoService.resolveMetadataForPath(path);
  }

  @Get('settings')
  async getPublicSettings() {
    const settings = await this.seoService.getSettings();
    return {
      siteName: settings.siteName,
      organizationName: settings.organizationName,
      defaultMetaDescription: settings.defaultMetaDescription,
      defaultSocialImage: settings.defaultSocialImage,
      twitterHandle: settings.twitterHandle,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      logoUrl: settings.logoUrl,
      canonicalDomain: settings.canonicalDomain,
      defaultLanguage: settings.defaultLanguage,
    };
  }

  @Get('redirects/resolve')
  async resolveRedirect(@Query('path') path: string) {
    if (!path) return null;
    const redirect = await this.seoService.resolveRedirect(path);
    if (!redirect) return null;
    return {
      destination: redirect.destinationPath,
      statusCode: redirect.statusCode,
    };
  }

  @Post('404')
  async logNotFound(@Body() body: { path: string; referrer?: string }) {
    if (!body?.path) return { success: false };
    await this.seoService.logNotFound(body.path, body.referrer);
    return { success: true };
  }

  @Get('sitemap-entries')
  async getSitemapEntries() {
    return this.seoService.getSitemapEntries();
  }
}
