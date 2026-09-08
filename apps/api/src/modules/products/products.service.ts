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
    availability?: 'all' | 'in_stock' | 'out_of_stock';
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
      availability,
      isFeatured,
      sort = 'order_asc',
      page = 1,
      limit = 100,
    } = queryParams;

    const filter: any = {};

    // Apply filters
    if (status !== 'all') {
      filter.status = status;
    }
    if (availability === 'in_stock') {
      filter.stockStatus = 'IN_STOCK';
    } else if (availability === 'out_of_stock') {
      filter.stockStatus = 'OUT_OF_STOCK';
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

    // Sorting: Always prioritize IN_STOCK before OUT_OF_STOCK (alphabetical: IN_STOCK comes before OUT_OF_STOCK)
    let userSort: any = { displayOrder: 1, createdAt: -1 };
    if (sort === 'price_asc') {
      userSort = { price: 1 };
    } else if (sort === 'price_desc') {
      userSort = { price: -1 };
    } else if (sort === 'popularity_desc') {
      userSort = { views: -1 };
    } else if (sort === 'date_asc') {
      userSort = { createdAt: 1 };
    } else if (sort === 'date_desc') {
      userSort = { createdAt: -1 };
    } else if (sort === 'order_asc') {
      userSort = { displayOrder: 1, createdAt: -1 };
    }

    const sortOptions = {
      stockStatus: 1, // 'IN_STOCK' (I) before 'OUT_OF_STOCK' (O)
      ...userSort,
    };

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

  private normalizeProductData(data: Partial<Product>): Partial<Product> {
    const normalized = { ...data };
    if (normalized.status !== undefined) {
      normalized.isPublished = normalized.status === 'published';
    }
    if (normalized.trackStock) {
      const qty =
        normalized.stockQuantity !== undefined
          ? normalized.stockQuantity
          : normalized.variants && normalized.variants.length > 0
          ? normalized.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
          : 0;
      normalized.stockStatus = qty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
      normalized.stockQuantity = qty;
    } else if (!normalized.stockStatus) {
      normalized.stockStatus = 'IN_STOCK';
    }
    return normalized;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const prepared = this.normalizeProductData(data);
    // Generate slug from name if not provided
    if (!prepared.slug && prepared.name) {
      prepared.slug = prepared.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const newProduct = new this.productModel(prepared);
    return newProduct.save();
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const prepared = this.normalizeProductData(data);
    const product = await this.productModel.findByIdAndUpdate(id, prepared, { new: true }).exec();
    if (!product) {
      throw new NotFoundException(`Produit introuvable avec l'ID "${id}"`);
    }
    return product;
  }

  async patchStockStatus(id: string, stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK'): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { $set: { stockStatus } },
      { new: true },
    ).exec();
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

  async bulkReorder(items: { id: string; displayOrder: number }[]): Promise<{ success: boolean }> {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));
    await this.productModel.bulkWrite(ops);
    return { success: true };
  }

  async incrementViews(id: string): Promise<void> {
    await this.productModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }
}
