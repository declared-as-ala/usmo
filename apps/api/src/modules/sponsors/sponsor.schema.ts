import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SponsorCategory = 'Main' | 'Official' | 'Technical' | 'Media' | 'Academy' | 'Partner' | 'Institutional';
export type SportScope = 'CLUB' | 'FOOTBALL' | 'BASKETBALL' | 'BOTH';

@Schema({ timestamps: true })
export class Sponsor extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, unique: true, required: true, index: true })
  slug: string;

  @Prop({ type: String, default: '' })
  shortName?: string;

  @Prop({
    type: String,
    enum: ['Main', 'Official', 'Technical', 'Media', 'Academy', 'Partner', 'Institutional'],
    default: 'Official',
  })
  category: SponsorCategory;

  @Prop({ type: String, default: 'OFFICIAL' })
  sponsorType: string;

  @Prop({ type: String, enum: ['CLUB', 'FOOTBALL', 'BASKETBALL', 'BOTH'], default: 'CLUB' })
  sportScope: SportScope;

  /** Primary logo (standard full-color on light backgrounds) */
  @Prop({ type: String, default: '' })
  logo: string;

  @Prop({ type: String, default: '' })
  primaryLogo?: string;

  /** Light logo (for dark navy background sections) */
  @Prop({ type: String, default: '' })
  lightLogo?: string;

  /** Dark/monochrome logo */
  @Prop({ type: String, default: '' })
  darkLogo?: string;

  @Prop({ type: String, default: '' })
  monochromeLogo?: string;

  @Prop({ type: String, default: '' })
  thumbnail?: string;

  @Prop({ type: String, default: '' })
  description?: string;

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

  @Prop({ type: String, default: '' })
  websiteUrl?: string;

  @Prop({ type: Number, default: 0, index: true })
  displayOrder: number;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: true })
  showOnHomepage: boolean;

  @Prop({ type: Boolean, default: true })
  showOnSponsorsPage: boolean;

  @Prop({ type: Date, default: null })
  startDate?: Date | null;

  @Prop({ type: Date, default: null })
  endDate?: Date | null;

  @Prop({ type: String, enum: ['PDF_IMPORT', 'MANUAL'], default: 'PDF_IMPORT' })
  sourceType?: 'PDF_IMPORT' | 'MANUAL';

  @Prop({ type: String, default: '' })
  sourceFile?: string;

  @Prop({ type: Number, default: null })
  sourcePage?: number | null;

  @Prop({ type: Object, default: { impressions: 0, clicks: 0, ctr: 0 } })
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

export const SponsorSchema = SchemaFactory.createForClass(Sponsor);
SponsorSchema.index({ isActive: 1, displayOrder: 1 });
SponsorSchema.index({ showOnHomepage: 1, isActive: 1 });

