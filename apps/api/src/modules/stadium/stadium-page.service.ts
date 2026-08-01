import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StadiumPage } from './stadium-page.schema';

const ALLOWED_FIELDS = ['heroTitle', 'heroSubtitle', 'heroImage', 'safetyIntro', 'safetyRules', 'status'];

@Injectable()
export class StadiumPageService {
  constructor(@InjectModel(StadiumPage.name) private readonly model: Model<StadiumPage>) {}

  async getPublic() {
    const doc = await this.getOrCreate();
    return doc.status === 'published' ? doc : { ...doc.toObject(), status: 'draft' };
  }

  getAdmin() {
    return this.getOrCreate();
  }

  private async getOrCreate() {
    return this.model.findOneAndUpdate(
      { key: 'stadium' },
      { $setOnInsert: { key: 'stadium' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  async update(input: Record<string, unknown>) {
    const update: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (input[field] !== undefined) update[field] = input[field];
    }
    return this.model.findOneAndUpdate(
      { key: 'stadium' },
      { $set: update, $setOnInsert: { key: 'stadium' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
}
