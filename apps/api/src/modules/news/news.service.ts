import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './news.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>
  ) {}

  async findAll(query: {
    category?: string;
    search?: string;
    featured?: boolean;
    published?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ news: News[]; total: number }> {
    const filter: any = {};

    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    if (query.published !== undefined) {
      filter.published = query.published;
    }

    if (query.featured !== undefined) {
      filter.featured = query.featured;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { titleAr: { $regex: query.search } },
        { titleFr: searchRegex },
        { summary: searchRegex },
        { summaryAr: { $regex: query.search } },
        { summaryFr: searchRegex },
        { content: searchRegex },
        { contentAr: { $regex: query.search } },
        { contentFr: searchRegex },
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      this.newsModel
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.newsModel.countDocuments(filter).exec(),
    ]);

    return { news, total };
  }

  async findOne(id: string): Promise<News> {
    const article = await this.newsModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article introuvable avec l'ID ${id}`);
    }
    return article;
  }

  async findBySlug(slug: string): Promise<News> {
    const article = await this.newsModel.findOneAndUpdate(
      { slug, published: true },
      { $inc: { views: 1 } },
      { new: true },
    ).exec();
    if (!article) throw new NotFoundException(`Article introuvable: ${slug}`);
    return article;
  }

  async create(data: Partial<News>): Promise<News> {
    // If date is not provided, use today's date in YYYY-MM-DD
    if (!data.date) {
      data.date = new Date().toISOString().slice(0, 10);
    }
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const newArticle = new this.newsModel(data);
    return newArticle.save();
  }

  async update(id: string, data: Partial<News>): Promise<News> {
    const article = await this.newsModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!article) {
      throw new NotFoundException(`Article introuvable avec l'ID ${id}`);
    }
    return article;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.newsModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Article introuvable avec l'ID ${id}`);
    }
    return { success: true };
  }
}
