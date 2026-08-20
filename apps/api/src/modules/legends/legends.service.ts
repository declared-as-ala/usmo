import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Legend } from './legend.schema';

@Injectable()
export class LegendsService {
  constructor(@InjectModel(Legend.name) private readonly model: Model<Legend>) {}

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

  create(input: Partial<Legend>) {
    const payload = {
      ...input,
      nameAr: input.nameAr || input.name || '',
      roleAr: input.roleAr || input.role || '',
      image: input.image || '',
    };
    return this.model.create(payload);
  }

  async update(id: string, input: Partial<Legend>) {
    const payload = {
      ...input,
      ...(input.name && !input.nameAr ? { nameAr: input.name } : {}),
      ...(input.role && !input.roleAr ? { roleAr: input.role } : {}),
    };
    const doc = await this.model.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!doc) throw new NotFoundException('Legend not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Legend not found');
  }
}
