import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryPage } from './history-page.schema';

const ALLOWED_FIELDS = [
  'heroTitle', 'heroSubtitle', 'heroImage', 'cityIntro', 'foundationText',
  'footballStory', 'basketballStory', 'values', 'evolutionFootball',
  'evolutionBasketball', 'seoTitle', 'seoDescription', 'status',
];

@Injectable()
export class HistoryService {
  constructor(@InjectModel(HistoryPage.name) private readonly historyModel: Model<HistoryPage>) {}

  async getPublic() {
    const doc = await this.getOrCreate();
    return doc.status === 'published' ? doc : { ...doc.toObject(), status: 'draft' };
  }

  getAdmin() {
    return this.getOrCreate();
  }

  private async getOrCreate() {
    return this.historyModel.findOneAndUpdate(
      { key: 'history' },
      { $setOnInsert: { key: 'history' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  async update(input: Record<string, unknown>) {
    const update: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (input[field] !== undefined) update[field] = input[field];
    }
    return this.historyModel.findOneAndUpdate(
      { key: 'history' },
      { $set: update, $setOnInsert: { key: 'history' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
}
