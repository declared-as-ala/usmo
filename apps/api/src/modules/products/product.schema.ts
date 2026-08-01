import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ProductVariant extends Document {
  @Prop({ type: String, required: true })
  id: string; // client side unique variant identifier

  @Prop({ type: String, required: true, index: true })
  sku: string;

  @Prop({ type: String, required: true })
  size: string;

  @Prop({ type: String, required: true })
  color: string;

  @Prop({ type: String })
  colorHex?: string;

  @Prop({ type: Number, required: true, default: 0 })
  stock: number;

  @Prop({ type: Number })
  price?: number; // custom variant overrides if applicable (in millimes)
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  nameFr?: string;

  @Prop({ type: String })
  nameAr?: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  sku: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  descriptionFr?: string;

  @Prop({ type: String })
  descriptionAr?: string;

  @Prop({ type: String })
  shortDescription?: string;

  @Prop({ type: String, required: true })
  coverImage: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Number, required: true })
  price: number; // Stored in millimes (e.g. 85000 for 85 TND)

  @Prop({ type: Number })
  oldPrice?: number;

  @Prop({ type: Number })
  costPrice?: number;

  @Prop({ type: String, required: true, index: true })
  category: string; // references Category slug

  @Prop({ type: [String], default: [], index: true })
  collections: string[]; // references Collection slugs

  @Prop({ type: String, required: true, default: 'club' })
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';

  @Prop({ type: String, required: true })
  season: string;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  material?: string;

  @Prop({ type: String })
  careInstructions?: string;

  @Prop({ type: String })
  sizeGuideUrl?: string;

  @Prop({ type: String, required: true, default: 'published', index: true })
  status: 'draft' | 'published' | 'archived';

  @Prop({ type: Boolean, default: false, index: true })
  isFeatured?: boolean;

  @Prop({ type: Number, default: 5 })
  lowStockThreshold: number;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: String })
  seoTitle?: string;

  @Prop({ type: String })
  seoDescription?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
