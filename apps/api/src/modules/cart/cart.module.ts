import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { DeliveryZone, DeliveryZoneSchema } from './delivery-zone.schema';
import { PickupPoint, PickupPointSchema } from './pickup-point.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryZone.name, schema: DeliveryZoneSchema },
      { name: PickupPoint.name, schema: PickupPointSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    MembershipsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
