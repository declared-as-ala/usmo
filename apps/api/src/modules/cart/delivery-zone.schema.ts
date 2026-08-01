import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DeliveryZone extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  nameFr?: string;

  @Prop({ type: String })
  nameAr?: string;

  @Prop({ type: Number, required: true, default: 0 })
  price: number; // in millimes

  @Prop({ type: Boolean, required: true, default: true, index: true })
  active: boolean;
}

export const DeliveryZoneSchema = SchemaFactory.createForClass(DeliveryZone);
