import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './collection.schema';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),
    AuthModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
