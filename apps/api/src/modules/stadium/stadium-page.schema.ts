import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class SafetyRule {
  @Prop({ type: String, default: '' })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;
}

@Schema({ timestamps: true })
export class StadiumPage extends Document {
  @Prop({ type: String, required: true, unique: true, default: 'stadium' })
  key: string;

  @Prop({ type: String, default: '' })
  heroTitle: string;

  @Prop({ type: String, default: '' })
  heroSubtitle: string;

  @Prop({ type: String, default: '' })
  heroImage: string;

  @Prop({ type: String, default: '' })
  safetyIntro: string;

  @Prop({ type: [SafetyRule], default: [] })
  safetyRules: SafetyRule[];

  @Prop({ type: String, enum: ['draft', 'published'], default: 'published' })
  status: 'draft' | 'published';
}

export const StadiumPageSchema = SchemaFactory.createForClass(StadiumPage);
