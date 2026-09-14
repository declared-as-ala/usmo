import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'seo_redirects' })
export class SeoRedirect extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  sourcePath: string;

  @Prop({ type: String, required: true })
  destinationPath: string;

  @Prop({ type: Number, enum: [301, 302], default: 301 })
  statusCode: 301 | 302;

  @Prop({ type: Boolean, default: true, index: true })
  active: boolean;

  @Prop({ type: Number, default: 0 })
  hits: number;

  @Prop({ type: Date })
  lastHitAt?: Date;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  createdBy?: string;
}

export const SeoRedirectSchema = SchemaFactory.createForClass(SeoRedirect);
SeoRedirectSchema.index({ active: 1, sourcePath: 1 });
