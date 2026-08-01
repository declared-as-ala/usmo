import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroSlide, HeroSlideSchema } from './hero-slide.schema';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlidesController } from './hero-slides.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HeroSlide.name, schema: HeroSlideSchema }]),
    AuthModule,
  ],
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService],
  exports: [HeroSlidesService],
})
export class HeroSlidesModule {}
