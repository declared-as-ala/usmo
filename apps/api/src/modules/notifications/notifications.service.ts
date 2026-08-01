import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserNotification } from './notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(UserNotification.name) private readonly notificationModel: Model<UserNotification>,
  ) {}

  async create(userId: string, type: string, title: string, message: string, link?: string): Promise<UserNotification> {
    return this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      message,
      link,
    });
  }

  async findMine(userId: string) {
    return this.notificationModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false }).exec();
  }

  async markRead(userId: string, id: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    ).exec();
  }

  async markAllRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    ).exec();
    return { success: true };
  }
}
