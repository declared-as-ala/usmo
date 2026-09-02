import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { FanPhoto, FanPhotoSchema } from './fan-photo.schema';
import { HomepageSettings, HomepageSettingsSchema } from './homepage-settings.schema';
import { ClubSettings, ClubSettingsSchema } from './club-settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: HomepageSettings.name, schema: HomepageSettingsSchema },
    { name: FanPhoto.name, schema: FanPhotoSchema },
    { name: ClubSettings.name, schema: ClubSettingsSchema },
  ]), AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
