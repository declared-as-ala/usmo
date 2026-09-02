import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ClubSettings extends Document {
  @Prop({ type: String, required: true, unique: true, default: 'club' })
  key: string;

  @Prop({ type: String, default: 'Union Sportive Monastirienne' })
  clubName: string;

  @Prop({ type: String, default: '/logo.webp' })
  logoUrl: string;

  @Prop({ type: String, default: 'contact@usmonastir.tn' })
  contactEmail: string;

  @Prop({ type: String, default: '+216 73 462 600' })
  contactPhone: string;

  @Prop({ type: String, default: 'Avenue Ibn El Jazzar, Monastir 5000, Tunisia' })
  address: string;

  @Prop({ type: String, default: '' })
  facebook: string;

  @Prop({ type: String, default: '' })
  instagram: string;

  @Prop({ type: String, default: '' })
  youtube: string;

  @Prop({ type: String, default: '' })
  twitter: string;

  @Prop({ type: String, default: '' })
  tiktok: string;
}

export const ClubSettingsSchema = SchemaFactory.createForClass(ClubSettings);
