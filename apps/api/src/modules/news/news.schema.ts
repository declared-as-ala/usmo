import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ type: String, unique: true, sparse: true, index: true })
  slug?: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  titleAr: string;

  @Prop({ type: String, required: true })
  titleFr: string;

  @Prop({ type: String, required: true })
  summary: string;

  @Prop({ type: String, required: true })
  summaryAr: string;

  @Prop({ type: String, required: true })
  summaryFr: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  contentAr: string;

  @Prop({ type: String, required: true })
  contentFr: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({
    type: String,
    required: true,
    enum: ['Football', 'Basketball', 'Club', 'Academy', 'Announcements', 'Sponsors'],
    default: 'Club',
  })
  category: 'Football' | 'Basketball' | 'Club' | 'Academy' | 'Announcements' | 'Sponsors';

  @Prop({ type: String, required: true })
  categoryAr: string;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true, default: '3 min' })
  readTime: string;

  @Prop({ type: Boolean, required: true, default: false })
  official: boolean;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: Boolean, required: true, default: true })
  published: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  featured: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isBreaking?: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  showOnNewsHero?: boolean;

  @Prop({ type: String, default: '2025/2026', index: true })
  season?: string;

  @Prop({ type: String, enum: ['article', 'video', 'analysis'], default: 'article' })
  contentType?: 'article' | 'video' | 'analysis';

  @Prop({ type: String })
  videoEmbed?: string;

  @Prop({ type: [String], default: [] })
  gallery?: string[];

  @Prop({ type: Number, default: 0, min: 0 })
  views?: number;

  @Prop({ type: String, enum: ['draft', 'published', 'archived'], default: 'published' })
  status?: 'draft' | 'published' | 'archived';

  @Prop({ type: Date })
  scheduledAt?: Date;

  @Prop({ type: String, default: 'fr' })
  language?: string;

  @Prop({ type: String })
  seoTitle?: string;

  @Prop({ type: String })
  seoDescription?: string;
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.index({ category: 1 });
NewsSchema.index({ published: 1 });
NewsSchema.index({ featured: 1 });
NewsSchema.index({ date: -1 });
NewsSchema.index({ views: -1 });
