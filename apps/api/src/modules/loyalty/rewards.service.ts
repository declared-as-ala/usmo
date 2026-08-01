import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reward, RewardRedemption } from './reward.schema';
import { FanPoint } from '../fan-zone/fan-zone.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(RewardRedemption.name) private readonly redemptionModel: Model<RewardRedemption>,
    @InjectModel(FanPoint.name) private readonly fanPointModel: Model<FanPoint>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.rewardModel.find({ isActive: true }).sort({ displayOrder: 1 }).exec();
  }

  async getPointsBalance(userId: string): Promise<number> {
    const result = await this.fanPointModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);
    return result[0]?.total || 0;
  }

  async findMyRedemptions(userId: string) {
    return this.redemptionModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async redeem(userId: string, rewardId: string): Promise<RewardRedemption> {
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward || !reward.isActive) {
      throw new NotFoundException('Récompense introuvable');
    }
    if (reward.stock != null && reward.stock <= 0) {
      throw new BadRequestException('Stock épuisé pour cette récompense');
    }

    const balance = await this.getPointsBalance(userId);
    if (balance < reward.pointsCost) {
      throw new BadRequestException('Points insuffisants pour cette récompense');
    }

    await this.fanPointModel.create({
      userId: new Types.ObjectId(userId),
      points: -reward.pointsCost,
      reason: 'reward_redemption',
      sourceType: 'Reward',
      sourceId: reward._id.toString(),
    });

    if (reward.stock != null) {
      reward.stock -= 1;
      await reward.save();
    }

    return this.redemptionModel.create({
      userId: new Types.ObjectId(userId),
      rewardId: reward._id,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      status: 'pending',
    });
  }

  // ── Admin ──────────────────────────────────────────────────────────────
  async findAllAdmin() {
    return this.rewardModel.find({}).sort({ displayOrder: 1 }).exec();
  }

  async create(data: Partial<Reward>) {
    return new this.rewardModel(data).save();
  }

  async update(id: string, data: Partial<Reward>) {
    return this.rewardModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    await this.rewardModel.findByIdAndDelete(id).exec();
  }

  async findAllRedemptionsAdmin() {
    return this.redemptionModel.find({}).sort({ createdAt: -1 }).populate('userId', 'name email').exec();
  }

  async updateRedemptionStatus(id: string, status: 'fulfilled' | 'cancelled', adminNote?: string) {
    const redemption = await this.redemptionModel.findByIdAndUpdate(id, { status, adminNote }, { new: true }).exec();
    if (redemption) {
      await this.notificationsService.create(
        redemption.userId.toString(),
        'reward_status',
        status === 'fulfilled' ? 'Récompense remise' : 'Échange annulé',
        status === 'fulfilled'
          ? `Votre récompense "${redemption.rewardTitle}" a été remise.`
          : `Votre échange pour "${redemption.rewardTitle}" a été annulé.`,
        '/compte/recompenses',
      );
    }
    return redemption;
  }
}
