import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import sharp = require('sharp');
import * as path from 'path';
import { Readable } from 'stream';
import { fileTypeFromBuffer } from 'file-type';

import { MINIO_CLIENT } from './minio.provider';
import { MediaFile } from './media-file.schema';
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  IMAGE_SIZES,
  WEBP_QUALITY,
} from './constants/upload.constants';

export interface ProcessedUpload {
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  objectKey: string;
  thumbnailKey?: string;
  mediumKey?: string;
  largeKey?: string;
  width?: number;
  height?: number;
  size: number;
  mimeType: string;
  filename: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    @Inject(MINIO_CLIENT) private readonly minio: Client,
    @InjectModel(MediaFile.name) private readonly mediaFileModel: Model<MediaFile>,
  ) {
    this.bucket = process.env.MINIO_BUCKET || 'usm-media';
    this.publicUrl = (process.env.MINIO_PUBLIC_URL || 'http://localhost:9000/usm-media').replace(/\/$/, '');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Upload a single file (image or video).
   * Images are automatically processed into 4 WebP variants.
   * Returns a saved MediaFile document.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string,
    uploadedBy?: string,
    options?: { altText?: string; caption?: string; tags?: string[] },
  ): Promise<MediaFile> {
    // 1. Validate
    const { type, extension, detectedMime } = await this.validateFile(buffer, mimetype, originalName);
    const maxSize = type === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (buffer.length > maxSize) {
      const mb = (maxSize / 1024 / 1024).toFixed(0);
      throw new BadRequestException(`File exceeds maximum size of ${mb} MB`);
    }

    // 2. Generate safe filename
    const uid = uuidv4();
    const safeName = sanitizeFilename(originalName);

    let processed: ProcessedUpload;

    if (type === 'image') {
      processed = await this.processAndUploadImage(buffer, uid, folder, extension);
    } else {
      processed = await this.uploadRawFile(buffer, uid, folder, extension, detectedMime);
    }

    // 3. Persist metadata
    const doc = new this.mediaFileModel({
      filename: `${uid}.${type === 'image' ? 'webp' : extension}`,
      originalName: safeName,
      bucket: this.bucket,
      objectKey: processed.objectKey,
      url: processed.url,
      thumbnailUrl: processed.thumbnailUrl,
      mediumUrl: processed.mediumUrl,
      largeUrl: processed.largeUrl,
      thumbnailKey: processed.thumbnailKey,
      mediumKey: processed.mediumKey,
      largeKey: processed.largeKey,
      mimeType: type === 'image' ? 'image/webp' : detectedMime,
      extension: type === 'image' ? 'webp' : extension,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      type,
      folder,
      altText: options?.altText,
      caption: options?.caption,
      tags: options?.tags || [],
      uploadedBy,
      isPublic: true,
    });

    return doc.save();
  }

  /**
   * Upload multiple files at once.
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string,
    uploadedBy?: string,
  ): Promise<MediaFile[]> {
    const results: MediaFile[] = [];
    for (const file of files) {
      const doc = await this.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        folder,
        uploadedBy,
      );
      results.push(doc);
    }
    return results;
  }

  /**
   * Delete a MediaFile document + all associated MinIO objects (all variants).
   */
  async deleteMediaFile(id: string): Promise<void> {
    const doc = await this.mediaFileModel.findById(id).exec();
    if (!doc) return;

    const keysToDelete = [
      doc.objectKey,
      doc.thumbnailKey,
      doc.mediumKey,
      doc.largeKey,
    ].filter(Boolean) as string[];

    await Promise.allSettled(
      keysToDelete.map((key) =>
        this.minio.removeObject(this.bucket, key).catch((err) =>
          this.logger.warn(`Could not delete MinIO object ${key}: ${err.message}`),
        ),
      ),
    );

    await this.mediaFileModel.findByIdAndDelete(id).exec();
  }

  /**
   * Delete all MinIO objects under a given prefix (folder).
   */
  async deletePrefix(prefix: string): Promise<void> {
    const stream = this.minio.listObjects(this.bucket, prefix, true);
    const keys: string[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (obj) => { if (obj.name) keys.push(obj.name); });
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    if (keys.length) {
      await this.minio.removeObjects(this.bucket, keys);
    }
  }

  /**
   * Get the full public URL for a given object key.
   */
  getPublicUrl(objectKey: string): string {
    return `${this.publicUrl}/${objectKey}`;
  }

  /**
   * Paginated media library query (admin panel).
   */
  async findAll(query: {
    type?: string;
    folder?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ files: MediaFile[]; total: number }> {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    if (query.folder) filter.folder = { $regex: query.folder, $options: 'i' };
    if (query.search) {
      filter.$or = [
        { originalName: { $regex: query.search, $options: 'i' } },
        { altText: { $regex: query.search, $options: 'i' } },
        { caption: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, query.limit || 50);
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.mediaFileModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.mediaFileModel.countDocuments(filter).exec(),
    ]);

    return { files, total };
  }

  /**
   * Update altText, caption, tags on an existing MediaFile.
   */
  async updateMetadata(
    id: string,
    updates: { altText?: string; caption?: string; tags?: string[] },
  ): Promise<MediaFile | null> {
    return this.mediaFileModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
  }

  /**
   * Generate a presigned PUT URL for direct browser uploads (optional / future use).
   */
  async generateSignedUploadUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    return this.minio.presignedPutObject(this.bucket, objectKey, expirySeconds);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private async validateFile(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<{ type: 'image' | 'video'; extension: string; detectedMime: string }> {
    // Get extension from original filename
    const ext = path.extname(originalName).slice(1).toLowerCase();

    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) {
      throw new BadRequestException('The uploaded file type could not be verified');
    }

    const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(detected.mime) &&
                    ALLOWED_IMAGE_EXTENSIONS.includes(detected.ext) &&
                    ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(detected.mime) &&
                    ALLOWED_VIDEO_EXTENSIONS.includes(detected.ext) &&
                    ALLOWED_VIDEO_EXTENSIONS.includes(ext);

    if ((!isImage && !isVideo) || detected.mime !== mimetype) {
      throw new BadRequestException(
        `Unsupported or mismatched file type. Allowed: jpg, png, webp, avif, mp4, webm, mov`,
      );
    }

    // Block dangerous patterns in filename
    const dangerous = /[<>"'`;${}|&]|\.\./;
    if (dangerous.test(originalName)) {
      throw new BadRequestException('Invalid characters in filename');
    }

    return {
      type: isImage ? 'image' : 'video',
      extension: detected.ext === 'mov' ? 'mov' : detected.ext,
      detectedMime: detected.mime,
    };
  }

  private async processAndUploadImage(
    buffer: Buffer,
    uid: string,
    folder: string,
    _originalExt: string,
  ): Promise<ProcessedUpload> {
    const image = sharp(buffer).rotate(); // auto-rotate from EXIF

    // Get original dimensions
    const meta = await image.metadata();
    const width = meta.width;
    const height = meta.height;

    const uploadVariant = async (
      variantBuffer: Buffer,
      suffix: string,
    ): Promise<string> => {
      const key = `${folder}/${uid}/${suffix}.webp`;
      const stream = Readable.from(variantBuffer);
      await this.minio.putObject(this.bucket, key, stream, variantBuffer.length, {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
      return key;
    };

    // Generate variants in parallel
    const [thumbBuf, medBuf, largeBuf, origBuf] = await Promise.all([
      image.clone().resize(IMAGE_SIZES.thumbnail, null, { withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer(),
      image.clone().resize(IMAGE_SIZES.medium, null, { withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer(),
      image.clone().resize(IMAGE_SIZES.large, null, { withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer(),
      image.clone().webp({ quality: WEBP_QUALITY }).toBuffer(),
    ]);

    const [thumbKey, medKey, largeKey, origKey] = await Promise.all([
      uploadVariant(thumbBuf, 'thumbnail'),
      uploadVariant(medBuf, 'medium'),
      uploadVariant(largeBuf, 'large'),
      uploadVariant(origBuf, 'original'),
    ]);

    return {
      objectKey: origKey,
      thumbnailKey: thumbKey,
      mediumKey: medKey,
      largeKey: largeKey,
      url: this.getPublicUrl(origKey),
      thumbnailUrl: this.getPublicUrl(thumbKey),
      mediumUrl: this.getPublicUrl(medKey),
      largeUrl: this.getPublicUrl(largeKey),
      width,
      height,
      size: origBuf.length,
      mimeType: 'image/webp',
      filename: `${uid}.webp`,
    };
  }

  private async uploadRawFile(
    buffer: Buffer,
    uid: string,
    folder: string,
    extension: string,
    mimetype: string,
  ): Promise<ProcessedUpload> {
    const key = `${folder}/${uid}/video.${extension}`;
    const stream = Readable.from(buffer);
    await this.minio.putObject(this.bucket, key, stream, buffer.length, {
      'Content-Type': mimetype,
    });

    return {
      objectKey: key,
      url: this.getPublicUrl(key),
      size: buffer.length,
      mimeType: mimetype,
      filename: `${uid}.${extension}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\- ]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 200);
}
