import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchPrediction } from './prediction.schema';
import { FanPoint } from '../fan-zone/fan-zone.schema';
import { BadgesService } from '../loyalty/badges.service';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(MatchPrediction.name) private readonly predictionModel: Model<MatchPrediction>,
    @InjectModel(FanPoint.name) private readonly fanPointModel: Model<FanPoint>,
    @InjectModel('User') private readonly userModel: Model<any>,
    private readonly badgesService: BadgesService,
  ) {}

  async submit(userId: string, matchId: string, matchLabel: string, homeScore: number, awayScore: number) {
    if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      throw new BadRequestException('Score de prédiction invalide');
    }

    const existing = await this.predictionModel.findOne({ matchId, userId: new Types.ObjectId(userId) }).exec();

    if (existing) {
      existing.homeScore = homeScore;
      existing.awayScore = awayScore;
      existing.matchLabel = matchLabel;
      return existing.save();
    }

    const created = await this.predictionModel.create({
      matchId,
      matchLabel,
      userId: new Types.ObjectId(userId),
      homeScore,
      awayScore,
    });

    await this.fanPointModel.create({
      userId: new Types.ObjectId(userId),
      points: 30,
      reason: 'match_prediction',
      sourceType: 'MatchPrediction',
      sourceId: created._id.toString(),
    });

    await this.badgesService.unlock(userId, 'first-prediction');

    return created;
  }

  async findMine(userId: string, matchId: string) {
    return this.predictionModel.findOne({ matchId, userId: new Types.ObjectId(userId) }).exec();
  }

  async findByMatch(matchId: string) {
    const predictions = await this.predictionModel.find({ matchId }).sort({ createdAt: -1 }).lean();
    const userIds = predictions.map((p) => p.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    return predictions.map((p) => {
      const user: any = userMap.get(p.userId.toString());
      const isPublic = user?.privacySettings?.showProfilePublicly !== false;
      return {
        _id: p._id,
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        createdAt: (p as any).createdAt,
        fanName: isPublic ? (user?.privacySettings?.useNickname ? (user.displayName || 'Supporter') : (user?.name || 'Supporter')) : 'Supporter anonyme',
        fanCity: isPublic && user?.privacySettings?.showCity ? user.city : undefined,
      };
    });
  }
}
