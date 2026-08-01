import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FanPoint, FanVote, FanVoteEntry } from './fan-zone.schema';
import { MembershipsService } from '../memberships/memberships.service';
import { BadgesService } from '../loyalty/badges.service';

@Injectable()
export class FanZoneService {
  constructor(
    @InjectModel(FanPoint.name) private readonly pointModel: Model<FanPoint>,
    @InjectModel(FanVote.name) private readonly voteModel: Model<FanVote>,
    @InjectModel(FanVoteEntry.name) private readonly entryModel: Model<FanVoteEntry>,
    private readonly membershipsService: MembershipsService,
    private readonly badgesService: BadgesService,
  ) {}

  async getPointsTotal(userId: string): Promise<number> {
    const result = await this.pointModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getDashboard(userId: string) {
    const pointsTotal = await this.getPointsTotal(userId);
    const membershipSummary = await this.membershipsService.getMembershipSummary(userId);
    await this.badgesService.unlock(userId, 'welcome');
    return {
      points: pointsTotal,
      membershipSummary,
    };
  }

  async getPointsHistory(userId: string) {
    return this.pointModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async addPoints(
    userId: string,
    points: number,
    reason: string,
    sourceType?: string,
    sourceId?: string,
  ): Promise<FanPoint> {
    const entry = new this.pointModel({
      userId: new Types.ObjectId(userId),
      points,
      reason,
      sourceType,
      sourceId,
    });
    return entry.save();
  }

  async getActiveVote() {
    const activePoll = await this.voteModel.findOne({ isActive: true }).exec();
    if (!activePoll) return null;

    const entries = await this.entryModel.find({ voteId: activePoll._id }).exec();
    const counts = activePoll.options.reduce((acc, opt) => {
      acc[opt.key] = entries.filter((e) => e.optionKey === opt.key).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      _id: activePoll._id,
      title: activePoll.title,
      options: activePoll.options,
      results: counts,
      totalVotes: entries.length,
      isActive: activePoll.isActive,
    };
  }

  async castVote(userId: string, voteId: string, optionKey: string): Promise<FanVoteEntry> {
    const poll = await this.voteModel.findById(voteId).exec();
    if (!poll || !poll.isActive) {
      throw new NotFoundException('Sondage actif non trouvé');
    }

    const hasOption = poll.options.some((opt) => opt.key === optionKey);
    if (!hasOption) {
      throw new BadRequestException('Option de vote invalide');
    }

    // Check if already voted
    const existing = await this.entryModel.findOne({
      voteId: new Types.ObjectId(voteId),
      userId: new Types.ObjectId(userId),
    }).exec();

    if (existing) {
      throw new ConflictException('Vous avez déjà voté pour ce sondage');
    }

    const entry = new this.entryModel({
      voteId: new Types.ObjectId(voteId),
      userId: new Types.ObjectId(userId),
      optionKey,
    });

    const saved = await entry.save();

    // Reward points for casting a vote
    await this.addPoints(userId, 50, 'vote_cast', 'FanVote', voteId);
    await this.badgesService.unlock(userId, 'first-vote');

    return saved;
  }

  async getRanking() {
    const aggregated = await this.pointModel.aggregate([
      { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } },
      { $sort: { totalPoints: -1 } },
    ]);

    const userModel = this.pointModel.db.model('User');
    const populatedRankings = [];

    for (const item of aggregated) {
      const user: any = await userModel.findById(item._id).exec();
      // Skip if user does not exist or has showRanking set to false
      if (user && user.privacySettings?.showRanking !== false) {
        populatedRankings.push({
          userId: user._id,
          name: user.privacySettings?.useNickname ? (user.displayName || 'Supporter') : user.name,
          city: user.privacySettings?.showCity ? user.city : undefined,
          avatar: user.avatar,
          points: item.totalPoints,
        });
      }
    }

    return populatedRankings.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  // Admin Helper to seed/create a vote
  async createVote(title: string, options: { key: string; label: string }[]) {
    // Deactivate existing votes
    await this.voteModel.updateMany({}, { isActive: false }).exec();

    const newVote = new this.voteModel({
      title,
      options,
      isActive: true,
    });
    return newVote.save();
  }
}
