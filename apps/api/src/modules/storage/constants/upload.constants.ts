// ─────────────────────────────────────────────────────────────────────────────
// Upload validation constants — single source of truth for all storage limits
// ─────────────────────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
] as const;

export const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

/** Max image upload size: 10 MB */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/** Max video upload size: 300 MB */
export const MAX_VIDEO_SIZE = 300 * 1024 * 1024;

/** Max banner/hero image size: 10 MB */
export const MAX_BANNER_SIZE = 10 * 1024 * 1024;

/** Max files per multi-upload request */
export const MAX_FILES_PER_REQUEST = 20;

/** Target widths for image resize variants (WebP output) */
export const IMAGE_SIZES = {
  thumbnail: 300,
  medium: 800,
  large: 1600,
} as const;

/** WebP output quality (0–100) */
export const WEBP_QUALITY = 82;

/** MinIO bucket name (should match MINIO_BUCKET env var) */
export const DEFAULT_BUCKET = 'usm-media';

/** Folder prefixes inside the bucket */
export const FOLDERS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  COLLECTIONS: 'collections',
  BANNERS: 'banners',
  SPONSORS: 'sponsors',
  MEDIA_PHOTOS: 'media/photos',
  MEDIA_VIDEOS: 'media/videos',
  MEDIA_THUMBNAILS: 'media/thumbnails',
  USERS: 'users/avatars',
  FAN_ZONE: 'fan-zone',
  DONATIONS: 'donations',
  SEO: 'seo',
  TEMP: 'temp',
} as const;
