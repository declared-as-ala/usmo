import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const LEGAL_PAGE_KEYS = ['privacy', 'terms', 'cookies'] as const;
export type LegalPageKey = (typeof LEGAL_PAGE_KEYS)[number];

@Schema({ timestamps: true })
export class LegalPage extends Document {
  @Prop({ type: String, required: true, unique: true, enum: LEGAL_PAGE_KEYS })
  key: LegalPageKey;

  @Prop({ type: String, default: '' })
  title: string;

  @Prop({ type: String, default: '' })
  content: string;
}

export const LegalPageSchema = SchemaFactory.createForClass(LegalPage);
