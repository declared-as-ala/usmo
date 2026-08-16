import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AnalyticsEvent extends Document {
  @Prop({ type: String, required: true, index: true })
  eventType: string; // page_view, session_start, product_view, add_to_cart, checkout_started, order_created, article_view, player_view, video_view, album_view, sponsor_impression, sponsor_click, match_view, search, donation_started, donation_submitted, membership_page_view

  @Prop({ type: String, required: true, index: true })
  sessionId: string;

  @Prop({ type: String, index: true })
  anonymousVisitorId?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  path: string;

  @Prop({ type: String })
  pageTitle?: string;

  @Prop({ type: String })
  referrer?: string;

  @Prop({ type: String, index: true })
  source?: string; // direct, google, facebook, instagram, tiktok, whatsapp, youtube, bing, sponsor, other

  @Prop({ type: String })
  medium?: string; // social, cpc, email, referral, organic, direct

  @Prop({ type: String, index: true })
  campaign?: string; // utm_campaign

  @Prop({ type: String })
  term?: string; // utm_term

  @Prop({ type: String })
  content?: string; // utm_content

  @Prop({ type: String, index: true, default: 'Unknown' })
  country: string;

  @Prop({ type: String, default: 'Unknown' })
  region: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' })
  deviceType: 'desktop' | 'mobile' | 'tablet';

  @Prop({ type: String, default: 'Unknown' })
  browser: string;

  @Prop({ type: String, default: 'Unknown' })
  operatingSystem: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);

// Compound indexes for analytics aggregations
AnalyticsEventSchema.index({ createdAt: -1, eventType: 1 });
AnalyticsEventSchema.index({ createdAt: -1, path: 1 });
AnalyticsEventSchema.index({ createdAt: -1, source: 1 });
AnalyticsEventSchema.index({ createdAt: -1, country: 1 });
// TTL index: 90 days automatic expiration for raw events
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
