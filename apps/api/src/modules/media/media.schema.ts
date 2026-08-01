import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MediaItem extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  titleFr?: string;

  @Prop({ type: String })
  titleAr?: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  descriptionFr?: string;

  @Prop({ type: String })
  descriptionAr?: string;

  @Prop({ type: String, required: true, enum: ['album', 'video'], index: true })
  type: 'album' | 'video';

  @Prop({ type: String, required: true, enum: ['public', 'fan', 'premium'], default: 'public', index: true })
  accessLevel: 'public' | 'fan' | 'premium';

  @Prop({ type: String, required: true })
  coverImage: string;

  @Prop({ type: String })
  videoUrl?: string; // Full video stream URL (locked if not authorized)

  @Prop({ type: String })
  teaserUrl?: string; // Always accessible preview trailer

  @Prop({ type: [String], default: [] })
  photos: string[]; // Full photo album (locked if not authorized)

  @Prop({ type: [String], default: [] })
  teaserPhotos: string[]; // Preview photos (always accessible)

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const MediaItemSchema = SchemaFactory.createForClass(MediaItem);

MediaItemSchema.index({ displayOrder: 1, createdAt: -1 });
