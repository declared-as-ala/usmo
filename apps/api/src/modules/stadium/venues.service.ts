import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Venue } from './venue.schema';

@Injectable()
export class VenuesService {
  constructor(@InjectModel(Venue.name) private readonly model: Model<Venue>) {}

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

  create(input: Partial<Venue>) {
    return this.model.create(input);
  }

  async update(id: string, input: Partial<Venue>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Venue not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Venue not found');
  }
}
