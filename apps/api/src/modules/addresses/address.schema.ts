import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Address extends Document {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, default: 'Domicile' })
  label: string;

  @Prop({ type: String, required: true })
  recipientName: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  addressLine: string;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({ userId: 1 });
