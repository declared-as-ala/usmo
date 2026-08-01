import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SponsorCategory = 'Main' | 'Official' | 'Technical' | 'Media' | 'Academy';

@Schema({ timestamps: true })
export class Sponsor extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, unique: true, sparse: true })
  slug?: string;

  @Prop({ type: String, enum: ['Main', 'Official', 'Technical', 'Media', 'Academy'], default: 'Official' })
  category: SponsorCategory;

  @Prop({ type: String, default: '' })
  logo: string;

  @Prop({ type: String, default: '' })
  story: string;

  @Prop({ type: String, default: '' })
  storyFr: string;

  @Prop({ type: String, default: '' })
  storyAr: string;

  @Prop({ type: String, default: '' })
  offer: string;

  @Prop({ type: String, default: '' })
  offerFr: string;

  @Prop({ type: String, default: '' })
  offerAr: string;

  @Prop({ type: String, default: '' })
  link: string;

  @Prop({ type: Object, default: { impressions: 0, clicks: 0, ctr: 0 } })
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

export const SponsorSchema = SchemaFactory.createForClass(Sponsor);
