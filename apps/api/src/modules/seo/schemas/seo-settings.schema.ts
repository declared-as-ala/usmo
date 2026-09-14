import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'seo_settings' })
export class SeoSettings extends Document {
  @Prop({ type: String, required: true, unique: true, default: 'global' })
  key: string;

  @Prop({ type: String, default: 'US Monastir' })
  siteName: string;

  @Prop({ type: String, default: 'Union Sportive Monastirienne' })
  organizationName: string;

  @Prop({ type: String, default: '%s | US Monastir' })
  titleTemplateDefault: string;

  @Prop({ type: String, default: '%s | Boutique Officielle US Monastir' })
  titleTemplateProducts: string;

  @Prop({ type: String, default: '%s | Actualités US Monastir' })
  titleTemplateNews: string;

  @Prop({ type: String, default: '%s | US Monastir' })
  titleTemplatePlayers: string;

  @Prop({ type: String, default: '%s | Match Center US Monastir' })
  titleTemplateMatches: string;

  @Prop({
    type: String,
    default:
      "Bienvenue sur le portail officiel de l'Union Sportive Monastirienne (USM). Suivez l'actualité de nos équipes de football et basketball, le match center en direct, la boutique officielle et la billetterie.",
  })
  defaultMetaDescription: string;

  @Prop({ type: String, default: '/images/seo/usm-social-share-default.webp' })
  defaultSocialImage: string;

  @Prop({ type: String, default: '@USMonastir' })
  twitterHandle: string;

  @Prop({ type: String, default: 'https://www.facebook.com/USMonastir.officiel' })
  facebookUrl: string;

  @Prop({ type: String, default: 'https://www.instagram.com/usmonastir_officiel' })
  instagramUrl: string;

  @Prop({ type: String, default: 'https://www.youtube.com/@USMonastir' })
  youtubeUrl: string;

  @Prop({ type: String, default: '/logo.webp' })
  logoUrl: string;

  @Prop({ type: String, default: 'https://usmonastir.tn' })
  canonicalDomain: string;


  @Prop({ type: String, default: 'fr' })
  defaultLanguage: string;
}

export const SeoSettingsSchema = SchemaFactory.createForClass(SeoSettings);
