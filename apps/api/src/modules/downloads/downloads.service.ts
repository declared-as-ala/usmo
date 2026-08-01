import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DownloadItem } from './download-item.schema';

@Injectable()
export class DownloadsService {
  constructor(@InjectModel(DownloadItem.name) private readonly model: Model<DownloadItem>) {}

  findPublic(category?: string) {
    const filter: Record<string, unknown> = { status: 'published' };
    if (category) filter.category = category;
    return this.model.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
  }

  findAll(category?: string) {
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    return this.model.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
  }

  create(input: Partial<DownloadItem>) {
    return this.model.create(input);
  }

  async update(id: string, input: Partial<DownloadItem>) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Download item not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Download item not found');
  }

  async registerDownload(id: string) {
    const doc = await this.model.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }, { new: true });
    if (!doc) throw new NotFoundException('Download item not found');
    return doc;
  }
}
