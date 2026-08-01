import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { minioProvider } from './minio.provider';
import { MediaFile, MediaFileSchema } from './media-file.schema';
import { StorageService } from './storage.service';
import { StorageController, MediaLibraryController } from './storage.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaFile.name, schema: MediaFileSchema },
    ]),
  ],
  providers: [minioProvider, StorageService],
  controllers: [StorageController, MediaLibraryController],
  exports: [StorageService, minioProvider],
})
export class StorageModule {}
