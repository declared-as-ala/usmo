import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TimelineEvent extends Document {
  @Prop({ type: String, required: true })
  year: string;

  @Prop({ type: String })
  date?: string;

  @Prop({ type: Number, min: 1, max: 12 })
  month?: number;

  @Prop({ type: Number, min: 1, max: 31 })
  day?: number;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, required: true, enum: ['club', 'football', 'basketball', 'city'], default: 'club' })
  sport: 'club' | 'football' | 'basketball' | 'city';

  @Prop({ type: String })
  image?: string;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: Boolean, default: false })
  isHighlighted: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);

TimelineEventSchema.index({ status: 1 });
TimelineEventSchema.index({ displayOrder: 1 });
