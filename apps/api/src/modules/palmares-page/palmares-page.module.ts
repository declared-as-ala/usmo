import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PalmaresPage, PalmaresPageSchema } from './palmares-page.schema';
import { PalmaresPageService } from './palmares-page.service';
import { PalmaresPageController } from './palmares-page.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PalmaresPage.name, schema: PalmaresPageSchema }]),
    AuthModule,
  ],
  controllers: [PalmaresPageController],
  providers: [PalmaresPageService],
})
export class PalmaresPageModule {}
