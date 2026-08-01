import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistItem, WishlistItemSchema } from './wishlist-item.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishlistItem.name, schema: WishlistItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
