import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Competition extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  nameAr: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: 'football' | 'basketball';

  @Prop({ type: String, required: true })
  season: string;

  @Prop({ type: String, default: '' })
  logo: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);
