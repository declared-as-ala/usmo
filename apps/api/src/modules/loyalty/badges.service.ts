import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Badge, FanBadge } from './badge.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel(Badge.name) private readonly badgeModel: Model<Badge>,
    @InjectModel(FanBadge.name) private readonly fanBadgeModel: Model<FanBadge>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.badgeModel.find({ isActive: true }).sort({ displayOrder: 1 }).exec();
  }

  async findMine(userId: string) {
    const [catalog, unlocked] = await Promise.all([
      this.badgeModel.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      this.fanBadgeModel.find({ userId: new Types.ObjectId(userId) }).lean(),
    ]);
    const unlockedMap = new Map(unlocked.map((u) => [u.badgeKey, (u as any).createdAt]));
    return catalog.map((badge) => ({
      ...badge,
      unlocked: unlockedMap.has(badge.key),
      unlockedAt: unlockedMap.get(badge.key) || null,
    }));
  }

  /** Idempotently unlocks a badge for a user. No-op if the badge key isn't in the catalog or already unlocked. */
  async unlock(userId: string, badgeKey: string): Promise<void> {
    const badge = await this.badgeModel.findOne({ key: badgeKey, isActive: true }).exec();
    if (!badge) return;

    const existing = await this.fanBadgeModel.findOne({ userId: new Types.ObjectId(userId), badgeKey }).exec();
    if (existing) return;

    try {
      await this.fanBadgeModel.create({ userId: new Types.ObjectId(userId), badgeKey });
    } catch {
      return; // duplicate-key race: badge was unlocked concurrently, nothing new to notify
    }

    await this.notificationsService.create(
      userId,
      'badge_unlocked',
      'Nouveau badge débloqué',
      `Vous avez débloqué le badge "${badge.name}".`,
      '/compte/badges',
    );
  }

  // ── Admin ──────────────────────────────────────────────────────────────
  async findAllAdmin() {
    return this.badgeModel.find({}).sort({ displayOrder: 1 }).exec();
  }

  async create(data: Partial<Badge>) {
    return new this.badgeModel(data).save();
  }

  async update(id: string, data: Partial<Badge>) {
    return this.badgeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    await this.badgeModel.findByIdAndDelete(id).exec();
  }
}
