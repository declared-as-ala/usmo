import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from './address.schema';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private readonly model: Model<Address>) {}

  findMine(userId: string) {
    return this.model.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  }

  async create(userId: string, input: Partial<Address>) {
    if (input.isDefault) {
      await this.model.updateMany({ userId }, { $set: { isDefault: false } });
    }
    return this.model.create({ ...input, userId });
  }

  async update(userId: string, id: string, input: Partial<Address>) {
    if (input.isDefault) {
      await this.model.updateMany({ userId }, { $set: { isDefault: false } });
    }
    const doc = await this.model.findOneAndUpdate({ _id: id, userId }, { $set: input }, { new: true });
    if (!doc) throw new NotFoundException('Address not found');
    return doc;
  }

  async delete(userId: string, id: string) {
    const doc = await this.model.findOneAndDelete({ _id: id, userId });
    if (!doc) throw new NotFoundException('Address not found');
  }
}
