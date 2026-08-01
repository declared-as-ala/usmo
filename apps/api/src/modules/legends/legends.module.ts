import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Legend, LegendSchema } from './legend.schema';
import { LegendsService } from './legends.service';
import { LegendsController } from './legends.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Legend.name, schema: LegendSchema }]),
    AuthModule,
  ],
  controllers: [LegendsController],
  providers: [LegendsService],
  exports: [LegendsService],
})
export class LegendsModule {}
