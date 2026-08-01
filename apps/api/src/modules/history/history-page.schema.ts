import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HistoryPage extends Document {
  @Prop({ type: String, required: true, unique: true, default: 'history' })
  key: string;

  @Prop({ type: String, default: '' })
  heroTitle: string;

  @Prop({ type: String, default: '' })
  heroSubtitle: string;

  @Prop({ type: String, default: '' })
  heroImage: string;

  @Prop({ type: String, default: '' })
  cityIntro: string;

  @Prop({ type: String, default: '' })
  foundationText: string;

  @Prop({ type: String, default: '' })
  footballStory: string;

  @Prop({ type: String, default: '' })
  basketballStory: string;

  @Prop({ type: [String], default: [] })
  values: string[];

  @Prop({ type: String, default: '' })
  evolutionFootball: string;

  @Prop({ type: String, default: '' })
  evolutionBasketball: string;

  @Prop({ type: String })
  seoTitle?: string;

  @Prop({ type: String })
  seoDescription?: string;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const HistoryPageSchema = SchemaFactory.createForClass(HistoryPage);
