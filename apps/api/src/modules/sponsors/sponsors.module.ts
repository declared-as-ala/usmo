import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sponsor, SponsorSchema } from './sponsor.schema';
import { PartnerLead, PartnerLeadSchema } from './partner-lead.schema';
import { SponsorsService } from './sponsors.service';
import { PartnerLeadsService } from './partner-leads.service';
import { SponsorsController } from './sponsors.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sponsor.name, schema: SponsorSchema },
      { name: PartnerLead.name, schema: PartnerLeadSchema },
    ]),
    AuthModule,
  ],
  controllers: [SponsorsController],
  providers: [SponsorsService, PartnerLeadsService],
  exports: [SponsorsService],
})
export class SponsorsModule {}
