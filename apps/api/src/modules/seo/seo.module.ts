import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoMetadata, SeoMetadataSchema } from './schemas/seo-metadata.schema';
import { SeoSettings, SeoSettingsSchema } from './schemas/seo-settings.schema';
import { SeoRedirect, SeoRedirectSchema } from './schemas/seo-redirect.schema';
import { SeoNotFoundLog, SeoNotFoundLogSchema } from './schemas/seo-not-found-log.schema';
import { SeoHistoryLog, SeoHistoryLogSchema } from './schemas/seo-history-log.schema';
import { SeoService } from './seo.service';
import { AdminSeoController } from './admin-seo.controller';
import { SeoController } from './seo.controller';
import { News, NewsSchema } from '../news/news.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Category, CategorySchema } from '../categories/category.schema';
import { Player, PlayerSchema } from '../players/player.schema';
import { Match, MatchSchema } from '../matches/match.schema';
import { Sponsor, SponsorSchema } from '../sponsors/sponsor.schema';
import { MediaItem, MediaItemSchema } from '../media/media.schema';
import { Legend, LegendSchema } from '../legends/legend.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeoMetadata.name, schema: SeoMetadataSchema },
      { name: SeoSettings.name, schema: SeoSettingsSchema },
      { name: SeoRedirect.name, schema: SeoRedirectSchema },
      { name: SeoNotFoundLog.name, schema: SeoNotFoundLogSchema },
      { name: SeoHistoryLog.name, schema: SeoHistoryLogSchema },
      { name: News.name, schema: NewsSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Sponsor.name, schema: SponsorSchema },
      { name: MediaItem.name, schema: MediaItemSchema },
      { name: Legend.name, schema: LegendSchema },
    ]),
  ],
  controllers: [AdminSeoController, SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
