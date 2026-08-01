import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimelineEvent } from './timeline-event.schema';

@Injectable()
export class TimelineService {
  constructor(@InjectModel(TimelineEvent.name) private readonly model: Model<TimelineEvent>) {}

  findPublic() {
    return this.model.find({ status: 'published' }).sort({ displayOrder: 1, year: 1 }).lean();
  }

  findAll() {
    return this.model.find().sort({ displayOrder: 1, year: 1 }).lean();
  }

  async findOnThisDay() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const exact = await this.model
      .find({ status: 'published', month, day })
      .sort({ displayOrder: 1, year: 1 })
      .lean();
    if (exact.length > 0) return exact;
    return this.model
      .find({ status: 'published', isHighlighted: true })
      .sort({ displayOrder: 1, year: 1 })
      .limit(3)
      .lean();
  }

  create(input: Partial<TimelineEvent>) {
    return this.model.create(input);
  }

  async update(id: string, input: Partial<TimelineEvent>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Timeline event not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Timeline event not found');
  }
}
