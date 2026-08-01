import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroSlide } from './hero-slide.schema';

@Injectable()
export class HeroSlidesService {
  constructor(@InjectModel(HeroSlide.name) private readonly model: Model<HeroSlide>) {}

  async findPublic(page = 'home') {
    const now = new Date();
    const slides = await this.model
      .find({ page, isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    // Respect optional scheduling window without needing a cron job.
    return slides.filter((s) => (!s.startsAt || s.startsAt <= now) && (!s.endsAt || s.endsAt >= now));
  }

  findAll(page?: string) {
    const filter: Record<string, unknown> = {};
    if (page) filter.page = page;
    return this.model.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  create(input: Partial<HeroSlide>) {
    return this.model.create(input);
  }

  async update(id: string, input: Partial<HeroSlide>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Hero slide not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Hero slide not found');
  }

  async reorder(items: { id: string; displayOrder: number }[]) {
    await Promise.all(
      items.map((item) => this.model.updateOne({ _id: item.id }, { $set: { displayOrder: item.displayOrder } })),
    );
    return this.findAll();
  }
}
