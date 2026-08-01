import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PalmaresPage extends Document {
  @Prop({ type: String, required: true, unique: true, default: 'palmares' })
  key: string;

  @Prop({ type: String, default: '' })
  heroBadge: string;

  @Prop({ type: String, default: '' })
  heroTitle: string;

  @Prop({ type: String, default: '' })
  heroSubtitle: string;

  @Prop({ type: String, default: '' })
  heroImage: string;

  @Prop({ type: String, default: '' })
  heroCtaText: string;

  @Prop({ type: String })
  seoTitle?: string;

  @Prop({ type: String })
  seoDescription?: string;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const PalmaresPageSchema = SchemaFactory.createForClass(PalmaresPage);
