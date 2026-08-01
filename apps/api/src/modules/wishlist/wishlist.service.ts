import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WishlistItem } from './wishlist-item.schema';
import { Product } from '../products/product.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishlistItem.name) private readonly wishlistModel: Model<WishlistItem>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async findMine(userId: string) {
    const items = await this.wishlistModel.find({ userId }).sort({ createdAt: -1 }).lean();
    const productIds = items.map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    return items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          _id: item._id,
          productId: item.productId,
          addedAt: (item as any).createdAt,
          product: {
            name: product.name,
            slug: product.slug,
            coverImage: product.coverImage,
            price: product.price,
          },
        };
      })
      .filter(Boolean);
  }

  async add(userId: string, productId: string) {
    return this.wishlistModel.findOneAndUpdate(
      { userId, productId },
      { $setOnInsert: { userId, productId } },
      { upsert: true, new: true },
    );
  }

  async remove(userId: string, productId: string) {
    await this.wishlistModel.deleteOne({ userId, productId });
  }
}
