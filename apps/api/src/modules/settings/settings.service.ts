import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FanPhoto } from './fan-photo.schema';
import { HomepageSettings } from './homepage-settings.schema';
import { ClubSettings } from './club-settings.schema';
import { SiteLaunchSettings } from './site-launch.schema';

const DEFAULT_SECTIONS = {
  hero: true, today: true, news: true, heritage: true, standings: true,
  playerSpotlight: true, shop: true, supporterGallery: true, newsletter: true,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(HomepageSettings.name) private readonly settingsModel: Model<HomepageSettings>,
    @InjectModel(FanPhoto.name) private readonly fanPhotoModel: Model<FanPhoto>,
    @InjectModel(ClubSettings.name) private readonly clubSettingsModel: Model<ClubSettings>,
    @InjectModel(SiteLaunchSettings.name) private readonly siteLaunchModel: Model<SiteLaunchSettings>,
  ) {}

  async getHomepage() {
    const settings = await this.settingsModel.findOneAndUpdate(
      { key: 'homepage' },
      { $setOnInsert: { key: 'homepage', sections: DEFAULT_SECTIONS } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
    return { ...settings, sections: { ...DEFAULT_SECTIONS, ...(settings?.sections || {}) } };
  }

  async updateHomepage(input: Partial<HomepageSettings>) {
    const allowed = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroImageUrl', 'primaryCtaLabel', 'primaryCtaHref', 'footballBannerUrl', 'basketballBannerUrl'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      const value = input[key as keyof HomepageSettings];
      if (typeof value === 'string') update[key] = value.trim().slice(0, key === 'heroDescription' ? 2000 : 500);
    }
    if (input.sections && typeof input.sections === 'object') {
      update.sections = Object.fromEntries(Object.entries(input.sections).map(([key, value]) => [key, Boolean(value)]));
    }
    if (input.boutiqueBanner && typeof input.boutiqueBanner === 'object') {
      const banner = input.boutiqueBanner as Record<string, unknown>;
      update.boutiqueBanner = {
        isActive: banner.isActive !== false,
        eyebrow: typeof banner.eyebrow === 'string' ? banner.eyebrow.trim().slice(0, 100) : '',
        title: typeof banner.title === 'string' ? banner.title.trim().slice(0, 160) : '',
        description: typeof banner.description === 'string' ? banner.description.trim().slice(0, 500) : '',
        imageUrl: typeof (banner.desktopImageUrl || banner.imageUrl) === 'string' ? String(banner.desktopImageUrl || banner.imageUrl).trim().slice(0, 1000) : '',
        desktopImageUrl: typeof (banner.desktopImageUrl || banner.imageUrl) === 'string' ? String(banner.desktopImageUrl || banner.imageUrl).trim().slice(0, 1000) : '',
        mobileImageUrl: typeof banner.mobileImageUrl === 'string' ? banner.mobileImageUrl.trim().slice(0, 1000) : '',
        ctaLabel: typeof banner.ctaLabel === 'string' ? banner.ctaLabel.trim().slice(0, 80) : '',
        ctaHref: typeof banner.ctaHref === 'string' ? banner.ctaHref.trim().slice(0, 500) : '',
      };
    }
    return this.settingsModel.findOneAndUpdate({ key: 'homepage' }, { $set: update, $setOnInsert: { key: 'homepage' } }, { new: true, upsert: true });
  }

  listFanPhotos(admin = false) {
    return this.fanPhotoModel.find(admin ? {} : { published: true }).sort({ displayOrder: 1, createdAt: -1 }).lean();
  }

  createFanPhoto(input: Partial<FanPhoto>) {
    if (!input.imageUrl || !/^https?:\/\//.test(input.imageUrl)) throw new BadRequestException('A valid image URL is required');
    return this.fanPhotoModel.create({
      imageUrl: input.imageUrl, caption: input.caption || '', supporterName: input.supporterName || '',
      published: input.published !== false, displayOrder: Number(input.displayOrder) || 0,
    });
  }

  async updateFanPhoto(id: string, input: Partial<FanPhoto>) {
    const update: Record<string, unknown> = {};
    if (typeof input.imageUrl === 'string') {
      if (!/^https?:\/\//.test(input.imageUrl)) throw new BadRequestException('A valid image URL is required');
      update.imageUrl = input.imageUrl;
    }
    if (typeof input.caption === 'string') update.caption = input.caption.trim().slice(0, 500);
    if (typeof input.supporterName === 'string') update.supporterName = input.supporterName.trim().slice(0, 120);
    if (typeof input.published === 'boolean') update.published = input.published;
    if (typeof input.displayOrder === 'number') update.displayOrder = input.displayOrder;
    const photo = await this.fanPhotoModel.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!photo) throw new NotFoundException('Fan photo not found');
    return photo;
  }

  async deleteFanPhoto(id: string) {
    const photo = await this.fanPhotoModel.findByIdAndDelete(id);
    if (!photo) throw new NotFoundException('Fan photo not found');
  }

  // ── Club Settings (social links, contact info) ──
  async getClubSettings() {
    const settings = await this.clubSettingsModel.findOneAndUpdate(
      { key: 'club' },
      { $setOnInsert: { key: 'club' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
    return settings;
  }

  async updateClubSettings(input: Partial<ClubSettings>) {
    const allowed = ['clubName', 'logoUrl', 'contactEmail', 'contactPhone', 'address', 'facebook', 'instagram', 'youtube', 'twitter', 'tiktok'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      const value = input[key as keyof ClubSettings];
      if (typeof value === 'string') update[key] = value.trim().slice(0, 1000);
    }
    return this.clubSettingsModel.findOneAndUpdate(
      { key: 'club' },
      { $set: update, $setOnInsert: { key: 'club' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  // ── Site Launch Settings (19:23 Countdown & Lock Gate) ──
  async getSiteLaunchStatus() {
    let settings = await this.siteLaunchModel.findOne({ key: 'site-launch' }).lean();
    if (!settings) {
      settings = await this.siteLaunchModel.findOneAndUpdate(
        { key: 'site-launch' },
        {
          $setOnInsert: {
            key: 'site-launch',
            enabled: true,
            launchAt: new Date('2026-09-09T18:23:00.000Z'),
            timezone: 'Africa/Tunis',
            unlocked: false,
            updatedBy: 'System',
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();
    }

    const now = new Date();
    const targetTime = new Date(settings.launchAt).getTime();
    const isPastLaunch = now.getTime() >= targetTime;
    const isUnlocked = !settings.enabled || settings.unlocked || isPastLaunch;

    return {
      enabled: settings.enabled,
      launchAt: new Date(settings.launchAt).toISOString(),
      serverTime: now.toISOString(),
      timezone: settings.timezone || 'Africa/Tunis',
      isUnlocked,
      unlocked: settings.unlocked,
      updatedBy: settings.updatedBy || 'System',
      updatedAt: (settings as any).updatedAt ? new Date((settings as any).updatedAt).toISOString() : now.toISOString(),
    };
  }

  async updateSiteLaunch(
    input: { enabled?: boolean; launchAt?: string | Date; timezone?: string; unlocked?: boolean },
    updatedBy = 'Super Admin',
  ) {
    const update: Record<string, unknown> = { updatedBy };
    if (typeof input.enabled === 'boolean') update.enabled = input.enabled;
    if (input.launchAt) update.launchAt = new Date(input.launchAt);
    if (typeof input.timezone === 'string') update.timezone = input.timezone.trim();
    if (typeof input.unlocked === 'boolean') update.unlocked = input.unlocked;

    await this.siteLaunchModel.findOneAndUpdate(
      { key: 'site-launch' },
      { $set: update, $setOnInsert: { key: 'site-launch' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return this.getSiteLaunchStatus();
  }
}

