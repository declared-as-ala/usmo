import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class DailyAnalytics extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  date: string; // YYYY-MM-DD format

  @Prop({ type: Number, default: 0 })
  totalPageViews: number;

  @Prop({ type: Number, default: 0 })
  totalUniqueVisitors: number;

  @Prop({ type: Number, default: 0 })
  totalSessions: number;

  @Prop({ type: Number, default: 0 })
  newVisitors: number;

  @Prop({ type: Number, default: 0 })
  returningVisitors: number;

  @Prop({ type: Number, default: 0 })
  avgSessionDuration: number; // in seconds

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  sources: Record<string, { visitors: number; pageViews: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  campaigns: Record<string, { visitors: number; pageViews: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  countries: Record<string, { visitors: number; pageViews: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  devices: Record<string, { visitors: number; pageViews: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  browsers: Record<string, { visitors: number; pageViews: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  operatingSystems: Record<string, { visitors: number; pageViews: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: [] })
  topPages: Array<{ path: string; title: string; views: number; uniqueVisitors: number }>;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  contentStats: {
    products?: Record<string, { views: number; cartAdds: number; orders: number }>;
    news?: Record<string, { views: number }>;
    players?: Record<string, { views: number }>;
    media?: Record<string, { views: number }>;
    sponsors?: Record<string, { impressions: number; clicks: number }>;
    matches?: Record<string, { views: number }>;
  };
}

export const DailyAnalyticsSchema = SchemaFactory.createForClass(DailyAnalytics);
