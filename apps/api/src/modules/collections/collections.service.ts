import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection } from './collection.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private readonly collectionModel: Model<Collection>
  ) {}

  async findAll(activeOnly = true): Promise<Collection[]> {
    const filter = activeOnly ? { active: true } : {};
    return this.collectionModel.find(filter).sort({ displayOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<Collection> {
    const collection = await this.collectionModel.findById(id).exec();
    if (!collection) {
      throw new NotFoundException(`Collection introuvable avec l'ID ${id}`);
    }
    return collection;
  }

  async create(data: Partial<Collection>): Promise<Collection> {
    const newCollection = new this.collectionModel(data);
    return newCollection.save();
  }

  async update(id: string, data: Partial<Collection>): Promise<Collection> {
    const collection = await this.collectionModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!collection) {
      throw new NotFoundException(`Collection introuvable avec l'ID ${id}`);
    }
    return collection;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.collectionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Collection introuvable avec l'ID ${id}`);
    }
    return { success: true };
  }
}
