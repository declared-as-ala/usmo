import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { NewsModule } from '../news/news.module';
import { ProductsModule } from '../products/products.module';
import { PlayersModule } from '../players/players.module';
import { StaffModule } from '../staff/staff.module';
import { SponsorsModule } from '../sponsors/sponsors.module';
import { LegendsModule } from '../legends/legends.module';
import { StadiumModule } from '../stadium/stadium.module';

@Module({
  imports: [
    NewsModule,
    ProductsModule,
    PlayersModule,
    StaffModule,
    SponsorsModule,
    LegendsModule,
    StadiumModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
