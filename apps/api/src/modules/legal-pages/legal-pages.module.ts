import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LegalPage, LegalPageSchema } from './legal-page.schema';
import { LegalPagesService } from './legal-pages.service';
import { LegalPagesController } from './legal-pages.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LegalPage.name, schema: LegalPageSchema }]),
    AuthModule,
  ],
  controllers: [LegalPagesController],
  providers: [LegalPagesService],
})
export class LegalPagesModule {}
