import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StaffMember } from './staff.schema';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class StaffService {
  constructor(@InjectModel(StaffMember.name) private readonly staffModel: Model<StaffMember>) {}

  findPublic(sport?: string) {
    const filter: Record<string, unknown> = { active: true };
    if (sport) filter.sport = sport;
    return this.staffModel.find(filter).sort({ name: 1 }).lean();
  }

  findAllAdmin() {
    return this.staffModel.find().sort({ name: 1 }).lean();
  }

  async create(input: Partial<StaffMember>) {
    let slug = slugify(input.name || '') || `staff-${Date.now().toString(36)}`;
    if (await this.staffModel.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    return this.staffModel.create({ ...input, slug });
  }

  async update(id: string, input: Partial<StaffMember>) {
    const staff = await this.staffModel.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async remove(id: string) {
    const staff = await this.staffModel.findByIdAndDelete(id);
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }
}
