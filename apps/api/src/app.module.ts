import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StorageModule } from './modules/storage/storage.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { NewsModule } from './modules/news/news.module';
import { SportsDbModule } from './modules/sportsdb/sportsdb.module';
import { HistoryModule } from './modules/history/history.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { TrophiesModule } from './modules/trophies/trophies.module';
import { LegendsModule } from './modules/legends/legends.module';
import { StadiumModule } from './modules/stadium/stadium.module';
import { SearchModule } from './modules/search/search.module';
import { DownloadsModule } from './modules/downloads/downloads.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SupportModule } from './modules/support/support.module';
import { PredictionsModule } from './modules/predictions/predictions.module';
import { SeasonPerformanceModule } from './modules/season-performance/season-performance.module';
import { AuditLogsModule } from './modules/auditlogs/auditlogs.module';
import { MembershipPlansModule } from './modules/membership-plans/membership-plans.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { FanZoneModule } from './modules/fan-zone/fan-zone.module';
import { MediaModule } from './modules/media/media.module';
import { DonationsModule } from './modules/donations/donations.module';
import { HeroSlidesModule } from './modules/hero-slides/hero-slides.module';
import { PalmaresPageModule } from './modules/palmares-page/palmares-page.module';
import { LegalPagesModule } from './modules/legal-pages/legal-pages.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { MatchesModule } from './modules/matches/matches.module';
import { PlayersModule } from './modules/players/players.module';
import { StaffModule } from './modules/staff/staff.module';
import { validateEnvironment } from './config/environment';
import { PublicMediaUrlInterceptor } from './common/public-media-url.interceptor';

@Module({
  imports: [
    // Load .env into process.env globally for all modules
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60, // Default global limit, can be overridden on specific endpoints
    }]),

    // MongoDB connection (URI loaded from .env via ConfigModule)
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo',
      }),
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    CollectionsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    StorageModule,
    SettingsModule,
    SponsorsModule,
    NewsModule,
    SportsDbModule,
    HistoryModule,
    TimelineModule,
    TrophiesModule,
    LegendsModule,
    StadiumModule,
    SearchModule,
    DownloadsModule,
    AddressesModule,
    WishlistModule,
    LoyaltyModule,
    NotificationsModule,
    SupportModule,
    PredictionsModule,
    SeasonPerformanceModule,
    AuditLogsModule,
    MembershipPlansModule,
    MembershipsModule,
    FanZoneModule,
    MediaModule,
    DonationsModule,
    HeroSlidesModule,
    PalmaresPageModule,
    LegalPagesModule,
    CompetitionsModule,
    MatchesModule,
    PlayersModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: PublicMediaUrlInterceptor },
  ],
})
export class AppModule {}
