import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PickupPoint extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  nameFr?: string;

  @Prop({ type: String })
  nameAr?: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String })
  addressFr?: string;

  @Prop({ type: String })
  addressAr?: string;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  active: boolean;
}

export const PickupPointSchema = SchemaFactory.createForClass(PickupPoint);
