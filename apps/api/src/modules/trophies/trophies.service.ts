import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trophy } from './trophy.schema';

@Injectable()
export class TrophiesService {
  constructor(@InjectModel(Trophy.name) private readonly model: Model<Trophy>) {}

  findPublic(sport?: string) {
    const filter: Record<string, unknown> = { status: 'published' };
    if (sport) filter.sport = sport;
    return this.model.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  findAll(sport?: string) {
    const filter: Record<string, unknown> = {};
    if (sport) filter.sport = sport;
    return this.model.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  create(input: Partial<Trophy>) {
    return this.model.create(input);
  }

  async update(id: string, input: Partial<Trophy>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Trophy not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Trophy not found');
  }
}
