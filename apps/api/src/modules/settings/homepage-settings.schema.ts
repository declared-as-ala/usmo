import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HomepageSettings extends Document {
  @Prop({ type: String, required: true, unique: true, default: 'homepage' })
  key: string;

  @Prop({ type: String, required: true, default: 'Union Sportive Monastirienne' })
  heroTitle: string;

  @Prop({ type: String, default: 'Rigueur, passion, victoire' })
  heroSubtitle: string;

  @Prop({ type: String, default: '' })
  heroDescription: string;

  @Prop({ type: String, default: '' })
  heroImageUrl: string;

  @Prop({ type: String, default: 'Découvrir le club' })
  primaryCtaLabel: string;

  @Prop({ type: String, default: '/history' })
  primaryCtaHref: string;

  /** Editorial campaign displayed inside the public boutique catalogue. */
  @Prop({ type: Object, default: {} })
  boutiqueBanner?: {
    isActive?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    /** Legacy desktop image retained for backwards compatibility. */
    imageUrl?: string;
    desktopImageUrl?: string;
    mobileImageUrl?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };

  @Prop({ type: Object, default: {} })
  sections: Record<string, boolean>;

  @Prop({ type: String, default: '' })
  footballBannerUrl?: string;

  @Prop({ type: String, default: '' })
  basketballBannerUrl?: string;
}

export const HomepageSettingsSchema = SchemaFactory.createForClass(HomepageSettings);
