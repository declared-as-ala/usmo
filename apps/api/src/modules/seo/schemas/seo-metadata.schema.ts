import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoEntityType, ISharedSeoAuditIssue } from 'shared';

@Schema({ timestamps: true, collection: 'seo_metadata' })
export class SeoMetadata extends Document {
  @Prop({ type: String, required: true, index: true })
  entityType: SeoEntityType;

  @Prop({ type: String, required: true, index: true })
  entityId: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  path: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  metaTitle?: string;

  @Prop({ type: String })
  metaDescription?: string;

  @Prop({ type: String })
  canonicalUrl?: string;

  @Prop({ type: String })
  slug?: string;

  @Prop({ type: String })
  focusKeyword?: string;

  @Prop({ type: [String], default: [] })
  secondaryKeywords?: string[];

  @Prop({ type: Boolean, default: true })
  robotsIndex: boolean;

  @Prop({ type: Boolean, default: true })
  robotsFollow: boolean;

  // Open Graph
  @Prop({ type: String })
  ogTitle?: string;

  @Prop({ type: String })
  ogDescription?: string;

  @Prop({ type: String })
  ogImage?: string; // 1200x630 Social Share Image in MinIO

  @Prop({ type: String })
  ogImageAlt?: string;

  @Prop({ type: String, default: 'website' })
  ogType?: string;

  @Prop({ type: String, default: 'US Monastir' })
  ogSiteName?: string;

  // Twitter
  @Prop({ type: String, default: 'summary_large_image' })
  twitterCard?: 'summary' | 'summary_large_image';

  @Prop({ type: String })
  twitterTitle?: string;

  @Prop({ type: String })
  twitterDescription?: string;

  @Prop({ type: String })
  twitterImage?: string;

  // Schema.org
  @Prop({ type: String, default: 'WebPage' })
  schemaType?: string;

  @Prop({ type: String })
  customJsonLd?: string;

  // Multilingual & Sitemap
  @Prop({ type: Object, default: {} })
  hreflang?: Record<string, string>;

  @Prop({ type: Boolean, default: true })
  breadcrumbsEnabled?: boolean;

  @Prop({ type: Boolean, default: true })
  sitemapEnabled?: boolean;

  @Prop({ type: Number, default: 0.7 })
  priority?: number;

  @Prop({ type: String, default: 'weekly' })
  changeFrequency?: string;

  // SEO Score & Issues
  @Prop({ type: Number, default: 0, min: 0, max: 100, index: true })
  seoScore: number;

  @Prop({ type: String, default: 'poor' })
  scoreStatus: 'poor' | 'needs_improvement' | 'good' | 'excellent';

  @Prop({ type: Array, default: [] })
  seoIssues: ISharedSeoAuditIssue[];

  @Prop({ type: Date, default: Date.now })
  lastAnalyzedAt: Date;

  @Prop({ type: String })
  updatedBy?: string;
}

export const SeoMetadataSchema = SchemaFactory.createForClass(SeoMetadata);

SeoMetadataSchema.index({ entityType: 1, entityId: 1 }, { unique: true });
SeoMetadataSchema.index({ seoScore: 1 });
SeoMetadataSchema.index({ scoreStatus: 1 });
