import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sponsor } from './sponsor.schema';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class SponsorsService {
  constructor(
    @InjectModel(Sponsor.name) private readonly sponsorModel: Model<Sponsor>,
  ) {}

  async findAll(activeOnly = true): Promise<Sponsor[]> {
    return this.sponsorModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorModel.findById(id).exec();
    if (!sponsor) {
      throw new NotFoundException(`Sponsor introuvable avec l'ID ${id}`);
    }
    return sponsor;
  }

  async findBySlug(slug: string): Promise<Sponsor> {
    const sponsor = await this.sponsorModel.findOne({ slug }).exec();
    if (!sponsor) {
      throw new NotFoundException(`Sponsor introuvable: ${slug}`);
    }
    return sponsor;
  }

  async create(data: Partial<Sponsor>): Promise<Sponsor> {
    let slug = slugify(data.name || '') || `sponsor-${Date.now().toString(36)}`;
    if (await this.sponsorModel.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    const newSponsor = new this.sponsorModel({ ...data, slug });
    return newSponsor.save();
  }

  async update(id: string, data: Partial<Sponsor>): Promise<Sponsor> {
    const sponsor = await this.sponsorModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!sponsor) {
      throw new NotFoundException(`Sponsor introuvable avec l'ID ${id}`);
    }
    return sponsor;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.sponsorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Sponsor introuvable avec l'ID ${id}`);
    }
    return { success: true };
  }
}
