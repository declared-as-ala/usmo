import {
  Controller,
  Post,
  Delete,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StorageService } from './storage.service';
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_FILES_PER_REQUEST,
  FOLDERS,
} from './constants/upload.constants';

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE }, // outer limit — fine-grained per-type done in service
};

@Controller('admin/storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Super Admin')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * POST /api/admin/storage/upload
   * Upload a single file. Accepts multipart/form-data.
   * Form fields: file (required), folder (optional), altText, caption, tags (comma-separated)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      folder?: string;
      altText?: string;
      caption?: string;
      tags?: string;
    },
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const folder = sanitizeFolder(body.folder || FOLDERS.TEMP);
    const tags = body.tags ? body.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    return this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
      req.user?.userId,
      { altText: body.altText, caption: body.caption, tags },
    );
  }

  /**
   * POST /api/admin/storage/upload-multiple
   * Upload up to 20 files at once.
   * Form field: files (array), folder
   */
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_REQUEST, multerOptions))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder: string,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const safeFolder = sanitizeFolder(folder || FOLDERS.TEMP);
    return this.storageService.uploadMultiple(files, safeFolder, req.user?.userId);
  }

  /**
   * DELETE /api/admin/storage/:id
   * Delete a MediaFile document + all MinIO objects for all variants.
   * Super Admin only (prevents accidental deletions by regular admins).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(@Param('id') id: string) {
    await this.storageService.deleteMediaFile(id);
  }

  /**
   * GET /api/admin/storage/presign?key=products/...
   * Generate a presigned upload URL for direct-to-MinIO browser uploads.
   */
  @Get('presign')
  async getPresignedUrl(@Query('key') objectKey: string) {
    if (!objectKey) {
      throw new BadRequestException('Object key is required');
    }
    const safeObjectKey = sanitizeFolder(objectKey);
    if (!safeObjectKey || safeObjectKey !== objectKey || objectKey.includes('..')) {
      throw new BadRequestException('Invalid object key');
    }
    const url = await this.storageService.generateSignedUploadUrl(safeObjectKey);
    return { url, objectKey: safeObjectKey };
  }
}

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Super Admin')
export class MediaLibraryController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * GET /api/admin/media
   * Paginated media library with optional filters.
   * Query: type, folder, search, page, limit
   */
  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('folder') folder?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storageService.findAll({
      type,
      folder,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * PATCH /api/admin/media/:id
   * Update altText, caption, or tags on an existing file.
   */
  @Patch(':id')
  async updateMetadata(
    @Param('id') id: string,
    @Body() body: { altText?: string; caption?: string; tags?: string[] },
  ) {
    const updates = {
      ...(typeof body.altText === 'string' ? { altText: body.altText.slice(0, 500) } : {}),
      ...(typeof body.caption === 'string' ? { caption: body.caption.slice(0, 2000) } : {}),
      ...(Array.isArray(body.tags)
        ? { tags: body.tags.filter((tag) => typeof tag === 'string').slice(0, 30) }
        : {}),
    };
    return this.storageService.updateMetadata(id, updates);
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function sanitizeFolder(folder: string): string {
  // Only allow alphanumeric, hyphens, underscores, and forward slashes
  return folder.replace(/[^a-zA-Z0-9\-_/]/g, '').slice(0, 100);
}
