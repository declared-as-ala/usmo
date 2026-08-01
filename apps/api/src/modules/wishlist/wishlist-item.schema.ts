import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WishlistItem extends Document {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true })
  productId: string;
}

export const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);

WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });
