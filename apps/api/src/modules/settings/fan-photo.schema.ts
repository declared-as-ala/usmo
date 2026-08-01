import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FanPhoto extends Document {
  @Prop({ type: String, required: true })
  imageUrl: string;

  @Prop({ type: String, default: '' })
  caption: string;

  @Prop({ type: String, default: '' })
  supporterName: string;

  @Prop({ type: Boolean, default: true, index: true })
  published: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;
}

export const FanPhotoSchema = SchemaFactory.createForClass(FanPhoto);
