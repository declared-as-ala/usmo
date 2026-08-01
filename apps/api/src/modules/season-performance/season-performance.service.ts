import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeasonPerformance } from './season-performance.schema';

@Injectable()
export class SeasonPerformanceService {
  constructor(@InjectModel(SeasonPerformance.name) private readonly model: Model<SeasonPerformance>) {}

  findPublic(sport?: string, type?: string) {
    const filter: Record<string, unknown> = { status: 'published' };
    if (sport) filter.sport = sport;
    if (type) filter.type = type;
    return this.model.find(filter).sort({ displayOrder: 1, season: 1 }).lean();
  }

  findAll(sport?: string, type?: string) {
    const filter: Record<string, unknown> = {};
    if (sport) filter.sport = sport;
    if (type) filter.type = type;
    return this.model.find(filter).sort({ displayOrder: 1, season: 1 }).lean();
  }

  create(input: Partial<SeasonPerformance>) {
    return this.model.create(input);
  }

  async update(id: string, input: Partial<SeasonPerformance>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Season performance row not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Season performance row not found');
  }
}
