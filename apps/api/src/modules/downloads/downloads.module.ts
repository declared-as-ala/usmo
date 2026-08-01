import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadItem, DownloadItemSchema } from './download-item.schema';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DownloadItem.name, schema: DownloadItemSchema }]),
    AuthModule,
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
