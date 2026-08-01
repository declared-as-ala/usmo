import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StadiumPage, StadiumPageSchema } from './stadium-page.schema';
import { Venue, VenueSchema } from './venue.schema';
import { StadiumPageService } from './stadium-page.service';
import { VenuesService } from './venues.service';
import { StadiumController } from './stadium.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StadiumPage.name, schema: StadiumPageSchema },
      { name: Venue.name, schema: VenueSchema },
    ]),
    AuthModule,
  ],
  controllers: [StadiumController],
  providers: [StadiumPageService, VenuesService],
  exports: [StadiumPageService, VenuesService],
})
export class StadiumModule {}
