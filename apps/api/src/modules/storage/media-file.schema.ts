import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaFileType = 'image' | 'video' | 'document';

@Schema({ timestamps: true })
export class MediaFile extends Document {
  /** Safe generated filename stored in MinIO (e.g. a1b2c3d4.webp) */
  @Prop({ type: String, required: true })
  filename: string;

  /** Original uploaded filename (sanitized, for display only) */
  @Prop({ type: String, required: true })
  originalName: string;

  /** MinIO bucket name */
  @Prop({ type: String, required: true })
  bucket: string;

  /** Full object key inside the bucket (e.g. products/slug/main/uuid.webp) */
  @Prop({ type: String, required: true, unique: true, index: true })
  objectKey: string;

  /** Public URL for original/large version */
  @Prop({ type: String, required: true })
  url: string;

  /** Public URL for thumbnail variant (300px WebP) — images only */
  @Prop({ type: String })
  thumbnailUrl?: string;

  /** Public URL for medium variant (800px WebP) — images only */
  @Prop({ type: String })
  mediumUrl?: string;

  /** Public URL for large variant (1600px WebP) — images only */
  @Prop({ type: String })
  largeUrl?: string;

  /** MinIO object key for thumbnail variant */
  @Prop({ type: String })
  thumbnailKey?: string;

  /** MinIO object key for medium variant */
  @Prop({ type: String })
  mediumKey?: string;

  /** MinIO object key for large variant */
  @Prop({ type: String })
  largeKey?: string;

  /** MIME type of the original file */
  @Prop({ type: String, required: true })
  mimeType: string;

  /** File extension (jpg, png, webp, mp4 …) */
  @Prop({ type: String, required: true })
  extension: string;

  /** File size in bytes */
  @Prop({ type: Number, required: true })
  size: number;

  /** Image/video width in pixels (if applicable) */
  @Prop({ type: Number })
  width?: number;

  /** Image/video height in pixels (if applicable) */
  @Prop({ type: Number })
  height?: number;

  /** Media type classification */
  @Prop({ type: String, required: true, enum: ['image', 'video', 'document'], index: true })
  type: MediaFileType;

  /** Logical folder/prefix (e.g. products, banners, media/photos) */
  @Prop({ type: String, required: true, index: true })
  folder: string;

  /** Alt text for accessibility and SEO */
  @Prop({ type: String })
  altText?: string;

  /** Caption / title for media galleries */
  @Prop({ type: String })
  caption?: string;

  /** Tags for filtering and search */
  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  /**
   * Tracks which entities use this file.
   * Array of strings like "product:slug", "banner:boutique-hero", "category:jerseys"
   */
  @Prop({ type: [String], default: [] })
  usedIn: string[];

  /** User ID who uploaded this file */
  @Prop({ type: String, index: true })
  uploadedBy?: string;

  /** Whether this file is publicly accessible without authentication */
  @Prop({ type: Boolean, default: true })
  isPublic: boolean;

  // ──────────────────────────────────────────────
  // Video-specific fields
  // ──────────────────────────────────────────────

  /** Duration in seconds (videos) */
  @Prop({ type: Number })
  duration?: number;

  /**
   * Source type for video content.
   * - "uploaded" : file is stored in MinIO
   * - "youtube"  : external YouTube URL
   * - "facebook" : external Facebook URL
   * - "external" : any other external URL
   */
  @Prop({ type: String, enum: ['uploaded', 'youtube', 'facebook', 'external'] })
  sourceType?: 'uploaded' | 'youtube' | 'facebook' | 'external';

  /** External video URL (YouTube/Facebook/other) */
  @Prop({ type: String })
  videoUrl?: string;
}

export const MediaFileSchema = SchemaFactory.createForClass(MediaFile);

// Compound indexes for efficient admin queries
MediaFileSchema.index({ type: 1, folder: 1 });
MediaFileSchema.index({ createdAt: -1 });
MediaFileSchema.index({ tags: 1, type: 1 });
