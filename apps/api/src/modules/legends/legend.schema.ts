import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Legend extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  nameAr: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball', 'club'], default: 'club' })
  sport: 'football' | 'basketball' | 'club';

  @Prop({ type: String, default: '' })
  years: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, default: '' })
  roleAr: string;

  @Prop({ type: String, default: '' })
  achievement: string;

  @Prop({ type: String, default: '' })
  achievementAr: string;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' })
  bioAr: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const LegendSchema = SchemaFactory.createForClass(Legend);

LegendSchema.index({ sport: 1 });
LegendSchema.index({ status: 1 });
