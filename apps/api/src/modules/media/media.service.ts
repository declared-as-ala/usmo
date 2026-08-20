import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaItem } from './media.schema';
import { Membership } from '../memberships/membership.schema';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaItem.name) private readonly mediaModel: Model<MediaItem>,
    @InjectModel(Membership.name) private readonly membershipModel: Model<Membership>,
  ) {}

  async findAllAdmin(): Promise<MediaItem[]> {
    return this.mediaModel.find().sort({ displayOrder: 1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<MediaItem> {
    const item = await this.mediaModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Média non trouvé');
    }
    return item;
  }

  async create(dto: any): Promise<MediaItem> {
    const item = new this.mediaModel(dto);
    return item.save();
  }

  async update(id: string, dto: any): Promise<MediaItem> {
    const item = await this.mediaModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!item) {
      throw new NotFoundException('Média non trouvé');
    }
    return item;
  }

  async delete(id: string): Promise<void> {
    const result = await this.mediaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Média non trouvé');
    }
  }

  // Public retrieval: all media is 100% public for all users
  async findAllPublic(user?: any): Promise<any[]> {
    const items = await this.mediaModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();

    return items.map((item) => this.transformMedia(item, true));
  }

  async findOnePublic(id: string, user?: any): Promise<any> {
    const item = await this.mediaModel.findById(id).exec();
    if (!item || !item.isActive) {
      throw new NotFoundException('Média non trouvé');
    }

    return this.transformMedia(item, true);
  }

  private transformMedia(item: MediaItem, _hasAccess = true) {
    const obj = item.toObject();
    obj.locked = false;
    return obj;
  }
}
