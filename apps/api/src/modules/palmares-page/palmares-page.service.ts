import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PalmaresPage } from './palmares-page.schema';

const ALLOWED_FIELDS = [
  'heroBadge', 'heroTitle', 'heroSubtitle', 'heroImage', 'heroCtaText',
  'seoTitle', 'seoDescription', 'status',
];

@Injectable()
export class PalmaresPageService {
  constructor(@InjectModel(PalmaresPage.name) private readonly palmaresPageModel: Model<PalmaresPage>) {}

  async getPublic() {
    const doc = await this.getOrCreate();
    return doc.status === 'published' ? doc : { ...doc.toObject(), status: 'draft' };
  }

  getAdmin() {
    return this.getOrCreate();
  }

  private async getOrCreate() {
    return this.palmaresPageModel.findOneAndUpdate(
      { key: 'palmares' },
      { $setOnInsert: { key: 'palmares' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  async update(input: Record<string, unknown>) {
    const update: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (input[field] !== undefined) update[field] = input[field];
    }
    return this.palmaresPageModel.findOneAndUpdate(
      { key: 'palmares' },
      { $set: update, $setOnInsert: { key: 'palmares' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
}
