import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DownloadItem extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: '' })
  titleAr: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  descriptionAr: string;

  @Prop({
    type: String,
    required: true,
    enum: ['regulations', 'membership', 'press-kit', 'forms', 'other'],
    default: 'other',
  })
  category: 'regulations' | 'membership' | 'press-kit' | 'forms' | 'other';

  @Prop({ type: String, required: true })
  fileUrl: string;

  @Prop({ type: String, default: '' })
  fileType: string;

  @Prop({ type: Number, default: 0 })
  fileSizeKb: number;

  @Prop({ type: Number, default: 0 })
  downloadCount: number;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const DownloadItemSchema = SchemaFactory.createForClass(DownloadItem);

DownloadItemSchema.index({ category: 1 });
DownloadItemSchema.index({ status: 1 });
