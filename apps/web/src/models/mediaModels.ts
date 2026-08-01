import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Photographer Schema
export interface IPhotographer extends Document {
  name: string;
  avatar?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhotographerSchema = new Schema<IPhotographer>(
  {
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

// 2. MediaCategory Schema
export interface IMediaCategory extends Document {
  name: string;
  slug: string;
  icon: string;
  description: string;
  coverImage: string;
  displayOrder: number;
  active: boolean;
  seo?: {
    title?: string;
    description?: string;
  };
}

const MediaCategorySchema = new Schema<IMediaCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    seo: {
      title: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true }
);

// 3. MediaTag Schema
export interface IMediaTag extends Document {
  name: string;
  slug: string;
  usageCount: number;
  active: boolean;
}

const MediaTagSchema = new Schema<IMediaTag>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

// 4. MediaPhoto Schema
export interface IMediaPhoto extends Document {
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  album?: mongoose.Types.ObjectId;
  category: string;
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';
  season: string;
  photographer: string;
  date: Date;
  downloadEnabled: boolean;
  displayOrder: number;
  status: 'draft' | 'published' | 'archived';
  views: number;
  downloads: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaPhotoSchema = new Schema<IMediaPhoto>(
  {
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    caption: { type: String, required: true },
    altText: { type: String },
    album: { type: Schema.Types.ObjectId, ref: 'MediaAlbum', index: true },
    category: { type: String, required: true, index: true },
    sport: { type: String, enum: ['football', 'basketball', 'club', 'academy', 'fans'], required: true, index: true },
    season: { type: String, required: true },
    photographer: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    downloadEnabled: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    views: { type: Number, default: 0, index: true },
    downloads: { type: Number, default: 0 },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// 5. MediaAlbum Schema
export interface IMediaAlbum extends Document {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  category: string;
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';
  season: string;
  relatedMatch?: string;
  relatedPlayers?: string[];
  relatedArticle?: string;
  photographer: string;
  date: Date;
  location: string;
  tags: string[];
  photos: mongoose.Types.ObjectId[];
  views: number;
  isFeatured: boolean;
  downloadsEnabled: boolean;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAlbumSchema = new Schema<IMediaAlbum>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    coverImage: { type: String, required: true },
    category: { type: String, required: true, index: true },
    sport: { type: String, enum: ['football', 'basketball', 'club', 'academy', 'fans'], required: true, index: true },
    season: { type: String, required: true },
    relatedMatch: { type: String },
    relatedPlayers: [{ type: String }],
    relatedArticle: { type: String },
    photographer: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    location: { type: String },
    tags: [{ type: String }],
    photos: [{ type: Schema.Types.ObjectId, ref: 'MediaPhoto' }],
    views: { type: Number, default: 0, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    downloadsEnabled: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    seo: {
      title: { type: String },
      description: { type: String },
      ogImage: { type: String },
    },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// 6. MediaVideo Schema
export interface IMediaVideo extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  sourceType: 'youtube' | 'facebook' | 'uploaded' | 'external';
  videoUrl: string;
  uploadedFileUrl?: string;
  duration: string;
  category: string;
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';
  season: string;
  relatedMatch?: string;
  relatedPlayers?: string[];
  relatedAlbum?: string;
  sponsor?: {
    name: string;
    logo?: string;
  };
  tags: string[];
  views: number;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaVideoSchema = new Schema<IMediaVideo>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    thumbnail: { type: String, required: true },
    sourceType: { type: String, enum: ['youtube', 'facebook', 'uploaded', 'external'], required: true },
    videoUrl: { type: String, required: true },
    uploadedFileUrl: { type: String },
    duration: { type: String, required: true },
    category: { type: String, required: true, index: true },
    sport: { type: String, enum: ['football', 'basketball', 'club', 'academy', 'fans'], required: true, index: true },
    season: { type: String, required: true },
    relatedMatch: { type: String },
    relatedPlayers: [{ type: String }],
    relatedAlbum: { type: String },
    sponsor: {
      name: { type: String },
      logo: { type: String },
    },
    tags: [{ type: String }],
    views: { type: Number, default: 0, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    seo: {
      title: { type: String },
      description: { type: String },
      ogImage: { type: String },
    },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// 7. FeaturedMedia Schema
export interface IFeaturedMedia extends Document {
  type: 'media_of_week' | 'album' | 'video' | 'latest' | 'archive' | 'phototheque';
  mediaType: 'album' | 'video' | 'photo';
  mediaId: string; // references specific item ID
  title?: string;
  startDate?: Date;
  endDate?: Date;
  displayOrder: number;
  active: boolean;
}

const FeaturedMediaSchema = new Schema<IFeaturedMedia>({
  type: { type: String, enum: ['media_of_week', 'album', 'video', 'latest', 'archive', 'phototheque'], required: true, index: true },
  mediaType: { type: String, enum: ['album', 'video', 'photo'], required: true },
  mediaId: { type: String, required: true },
  title: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true, index: true },
});

// 8. MediaArchive Schema
export interface IMediaArchive extends Document {
  year: string;
  season: string;
  title: string;
  description: string;
  photoCount: number;
  videoCount: number;
  coverImage: string;
  notes?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const MediaArchiveSchema = new Schema<IMediaArchive>(
  {
    year: { type: String, required: true, index: true },
    season: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    photoCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    coverImage: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
  },
  { timestamps: true }
);

// 9. MediaSettings Schema
export interface IMediaSettings extends Document {
  allowPublicDownloads: boolean;
  defaultDownloadPermission: boolean;
  maxPhotoUploadSize: number;
  maxVideoUploadSize: number;
  allowedFileTypes: string[];
  autoImageOptimization: boolean;
  watermarkOption: boolean;
  defaultPhotographer: string;
  defaultSeason: string;
  defaultMediaStatus: 'draft' | 'published';
  showViewsPublicly: boolean;
  showDatesPublicly: boolean;
  enableVideoModal: boolean;
  enableRelatedMedia: boolean;
}

const MediaSettingsSchema = new Schema<IMediaSettings>({
  allowPublicDownloads: { type: Boolean, default: true },
  defaultDownloadPermission: { type: Boolean, default: true },
  maxPhotoUploadSize: { type: Number, default: 10 },
  maxVideoUploadSize: { type: Number, default: 100 },
  allowedFileTypes: [{ type: String }],
  autoImageOptimization: { type: Boolean, default: true },
  watermarkOption: { type: Boolean, default: false },
  defaultPhotographer: { type: String, default: 'USM Media Team' },
  defaultSeason: { type: String, default: '2025/26' },
  defaultMediaStatus: { type: String, enum: ['draft', 'published'], default: 'published' },
  showViewsPublicly: { type: Boolean, default: true },
  showDatesPublicly: { type: Boolean, default: true },
  enableVideoModal: { type: Boolean, default: true },
  enableRelatedMedia: { type: Boolean, default: true },
});

// Compile Models cleanly (prevent recompiling errors in Next.js HMR)
export const PhotographerModel: Model<IPhotographer> = mongoose.models.Photographer || mongoose.model<IPhotographer>('Photographer', PhotographerSchema);
export const MediaCategoryModel: Model<IMediaCategory> = mongoose.models.MediaCategory || mongoose.model<IMediaCategory>('MediaCategory', MediaCategorySchema);
export const MediaTagModel: Model<IMediaTag> = mongoose.models.MediaTag || mongoose.model<IMediaTag>('MediaTag', MediaTagSchema);
export const MediaPhotoModel: Model<IMediaPhoto> = mongoose.models.MediaPhoto || mongoose.model<IMediaPhoto>('MediaPhoto', MediaPhotoSchema);
export const MediaAlbumModel: Model<IMediaAlbum> = mongoose.models.MediaAlbum || mongoose.model<IMediaAlbum>('MediaAlbum', MediaAlbumSchema);
export const MediaVideoModel: Model<IMediaVideo> = mongoose.models.MediaVideo || mongoose.model<IMediaVideo>('MediaVideo', MediaVideoSchema);
export const FeaturedMediaModel: Model<IFeaturedMedia> = mongoose.models.FeaturedMedia || mongoose.model<IFeaturedMedia>('FeaturedMedia', FeaturedMediaSchema);
export const MediaArchiveModel: Model<IMediaArchive> = mongoose.models.MediaArchive || mongoose.model<IMediaArchive>('MediaArchive', MediaArchiveSchema);
export const MediaSettingsModel: Model<IMediaSettings> = mongoose.models.MediaSettings || mongoose.model<IMediaSettings>('MediaSettings', MediaSettingsSchema);
