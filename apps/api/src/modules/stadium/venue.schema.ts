import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Venue extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  nameAr: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball', 'other'], default: 'other' })
  sport: 'football' | 'basketball' | 'other';

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  descriptionAr: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number })
  capacity?: number;

  @Prop({ type: String, default: '' })
  gates: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: String, default: '' })
  addressAr: string;

  @Prop({ type: String, default: '' })
  directions: string;

  @Prop({ type: String, default: '' })
  directionsAr: string;

  @Prop({ type: [String], default: [] })
  services: string[];

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const VenueSchema = SchemaFactory.createForClass(Venue);

VenueSchema.index({ sport: 1 });
VenueSchema.index({ status: 1 });
