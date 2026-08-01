import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaItem, MediaItemSchema } from './media.schema';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Membership, MembershipSchema } from '../memberships/membership.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaItem.name, schema: MediaItemSchema },
      { name: Membership.name, schema: MembershipSchema },
    ]),
    AuthModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
