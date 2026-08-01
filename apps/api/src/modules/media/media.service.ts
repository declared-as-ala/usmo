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

  // Public retrieval with optional auth context
  async findAllPublic(user?: any): Promise<any[]> {
    const items = await this.mediaModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();

    const hasPremium = await this.checkUserPremium(user);

    return Promise.all(
      items.map(async (item) => {
        const hasAccess = await this.userHasAccess(item, user, hasPremium);
        return this.transformMedia(item, hasAccess);
      }),
    );
  }

  async findOnePublic(id: string, user?: any): Promise<any> {
    const item = await this.mediaModel.findById(id).exec();
    if (!item || !item.isActive) {
      throw new NotFoundException('Média non trouvé');
    }

    const hasPremium = await this.checkUserPremium(user);
    const hasAccess = await this.userHasAccess(item, user, hasPremium);

    return this.transformMedia(item, hasAccess);
  }

  private async checkUserPremium(user?: any): Promise<boolean> {
    if (!user || !user.sub) return false;
    const now = new Date();
    const activeMembership = await this.membershipModel
      .findOne({
        userId: new Types.ObjectId(user.sub),
        status: 'active',
        endDate: { $gte: now },
      })
      .exec();
    return !!activeMembership;
  }

  private async userHasAccess(item: MediaItem, user?: any, hasPremium = false): Promise<boolean> {
    if (item.accessLevel === 'public') {
      return true;
    }
    if (item.accessLevel === 'fan') {
      return !!user;
    }
    if (item.accessLevel === 'premium') {
      return hasPremium;
    }
    return false;
  }

  private transformMedia(item: MediaItem, hasAccess: boolean) {
    const obj = item.toObject();
    if (!hasAccess) {
      obj.locked = true;
      if (obj.type === 'video') {
        obj.videoUrl = ''; // Hide full video
      } else if (obj.type === 'album') {
        obj.photos = obj.teaserPhotos || []; // Hide full photo URLs
      }
    } else {
      obj.locked = false;
    }
    return obj;
  }
}
