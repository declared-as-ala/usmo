import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Collection extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  nameFr?: string;

  @Prop({ type: String })
  nameAr?: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  coverImage?: string;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
