import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Player extends Document {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: 'football' | 'basketball';

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  nameAr: string;

  @Prop({ type: Number, required: true })
  number: number;

  @Prop({ type: String, required: true })
  position: string;

  @Prop({ type: String, default: '' })
  positionAr: string;

  @Prop({ type: String, default: '' })
  nationality: string;

  @Prop({ type: String, default: '' })
  nationalityAr: string;

  @Prop({ type: String, default: '' })
  image: string;

  @Prop({ type: Object, default: {} })
  stats: Record<string, number | string>;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' })
  bioAr: string;

  @Prop({ type: String, default: '' })
  height: string;

  @Prop({ type: String, default: '' })
  weight: string;

  @Prop({ type: Number, default: null })
  age: number | null;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.index({ sport: 1, active: 1 });
