import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trophy extends Document {
  @Prop({ type: String, required: true, enum: ['football', 'basketball'] })
  sport: 'football' | 'basketball';

  @Prop({ type: String, required: true })
  competition: string;

  @Prop({
    type: String,
    required: true,
    enum: ['Winner', 'Runner-up', 'Champion', 'Podium', 'Participation'],
    default: 'Winner',
  })
  achievementType: 'Winner' | 'Runner-up' | 'Champion' | 'Podium' | 'Participation';

  @Prop({ type: Number, default: 1 })
  titleCount: number;

  @Prop({ type: String, default: '' })
  years: string;

  @Prop({ type: String, default: '' })
  season: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  remarks: string;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  verified: boolean;

  @Prop({ type: String, default: '' })
  sourceNote: string;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const TrophySchema = SchemaFactory.createForClass(Trophy);

TrophySchema.index({ sport: 1 });
TrophySchema.index({ status: 1 });
