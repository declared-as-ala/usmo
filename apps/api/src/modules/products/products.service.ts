import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>
  ) {}

  async findAll(queryParams: {
    category?: string;
    collection?: string;
    sport?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    badge?: string;
    status?: string;
    isFeatured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const {
      category,
      collection,
      sport,
      search,
      minPrice,
      maxPrice,
      badge,
      status = 'published',
      isFeatured,
      sort = 'date_desc',
      page = 1,
      limit = 100,
    } = queryParams;

    const filter: any = {};

    // Apply filters
    if (status !== 'all') {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (collection) {
      filter.collections = collection;
    }
    if (sport) {
      filter.sport = sport;
    }
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }
    if (badge) {
      filter.badges = badge;
    }

    // Price filters (in millimes)
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Search query on name/SKU/description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameFr: { $regex: search, $options: 'i' } },
        { nameAr: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'popularity_desc') {
      sortOptions = { views: -1 };
    } else if (sort === 'date_asc') {
      sortOptions = { createdAt: 1 };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await this.productModel.countDocuments(filter).exec();
    const products = await this.productModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      products,
      total,
      page,
      limit,
    };
  }

  async findOneBySlug(slug: string): Promise<Product> {
    const product = await this.productModel.findOne({ slug, status: 'published' }).exec();
    if (!product) {
      throw new NotFoundException(`Produit introuvable avec le slug "${slug}"`);
    }
    return product;
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Produit introuvable avec l'ID "${id}"`);
    }
    return product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    // Generate slug from name if not provided
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const newProduct = new this.productModel(data);
    return newProduct.save();
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!product) {
      throw new NotFoundException(`Produit introuvable avec l'ID "${id}"`);
    }
    return product;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Produit introuvable avec l'ID "${id}"`);
    }
    return { success: true };
  }

  async incrementViews(id: string): Promise<void> {
    await this.productModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }
}
