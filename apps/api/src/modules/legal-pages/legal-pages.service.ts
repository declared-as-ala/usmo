import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LegalPage, LEGAL_PAGE_KEYS, LegalPageKey } from './legal-page.schema';

const DEFAULTS: Record<LegalPageKey, { title: string; content: string }> = {
  privacy: {
    title: 'Politique de confidentialité',
    content:
      "L'Union Sportive Monastirienne (USM) attache une grande importance à la protection de vos données personnelles. Cette page sera bientôt complétée avec le détail de notre politique de confidentialité.",
  },
  terms: {
    title: "Conditions d'utilisation",
    content:
      "En accédant au site officiel de l'Union Sportive Monastirienne (USM), vous acceptez les présentes conditions d'utilisation. Cette page sera bientôt complétée avec le détail de nos conditions.",
  },
  cookies: {
    title: 'Politique de cookies',
    content:
      "Ce site utilise des cookies afin d'améliorer votre expérience de navigation. Cette page sera bientôt complétée avec le détail de notre politique de cookies.",
  },
};

@Injectable()
export class LegalPagesService {
  constructor(@InjectModel(LegalPage.name) private readonly legalPageModel: Model<LegalPage>) {}

  private assertValidKey(key: string): asserts key is LegalPageKey {
    if (!LEGAL_PAGE_KEYS.includes(key as LegalPageKey)) {
      throw new BadRequestException(`Unknown legal page key: ${key}`);
    }
  }

  async getPublic(key: string) {
    this.assertValidKey(key);
    return this.getOrCreate(key);
  }

  async getAllAdmin() {
    return Promise.all(LEGAL_PAGE_KEYS.map((key) => this.getOrCreate(key)));
  }

  async getAdmin(key: string) {
    this.assertValidKey(key);
    return this.getOrCreate(key);
  }

  async update(key: string, input: { title?: string; content?: string }) {
    this.assertValidKey(key);
    const update: Record<string, unknown> = {};
    if (input.title !== undefined) update.title = input.title;
    if (input.content !== undefined) update.content = input.content;
    return this.legalPageModel.findOneAndUpdate(
      { key },
      { $set: update, $setOnInsert: { key } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }

  private async getOrCreate(key: LegalPageKey) {
    return this.legalPageModel.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, ...DEFAULTS[key] } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
}
