import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HeroSlide extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: '' })
  subtitle: string;

  @Prop({ type: String, default: '' })
  badgeText: string;

  @Prop({ type: String, required: true })
  backgroundImage: string;

  @Prop({ type: String })
  mobileBackgroundImage?: string;

  @Prop({ type: String, default: '' })
  primaryCtaText: string;

  @Prop({ type: String, default: '' })
  primaryCtaLink: string;

  @Prop({ type: String, default: '' })
  secondaryCtaText: string;

  @Prop({ type: String, default: '' })
  secondaryCtaLink: string;

  @Prop({ type: String, enum: ['light', 'medium', 'strong'], default: 'medium' })
  overlayStrength: 'light' | 'medium' | 'strong';

  @Prop({ type: String, enum: ['left', 'center', 'right'], default: 'left' })
  textPosition: 'left' | 'center' | 'right';

  /** Which page this slide belongs to — defaults to the homepage carousel. */
  @Prop({ type: String, default: 'home' })
  page: string;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  startsAt?: Date;

  @Prop({ type: Date })
  endsAt?: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;
}

export const HeroSlideSchema = SchemaFactory.createForClass(HeroSlide);

HeroSlideSchema.index({ page: 1, isActive: 1, displayOrder: 1 });
