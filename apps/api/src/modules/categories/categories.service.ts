import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>
  ) {}

  async findAll(activeOnly = true): Promise<Category[]> {
    const filter = activeOnly ? { active: true } : {};
    return this.categoryModel.find(filter).sort({ displayOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Catégorie introuvable avec l'ID ${id}`);
    }
    return category;
  }

  async create(data: Partial<Category>): Promise<Category> {
    const newCategory = new this.categoryModel(data);
    return newCategory.save();
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = await this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!category) {
      throw new NotFoundException(`Catégorie introuvable avec l'ID ${id}`);
    }
    return category;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Catégorie introuvable avec l'ID ${id}`);
    }
    return { success: true };
  }
}
