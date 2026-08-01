import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PartnerLead extends Document {
  @Prop({ type: String, required: true })
  company: string;

  @Prop({ type: String, required: true })
  contactName: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, default: '' })
  phone: string;

  @Prop({ type: String, default: '' })
  objective: string;

  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: String, enum: ['new', 'contacted', 'closed'], default: 'new' })
  status: 'new' | 'contacted' | 'closed';
}

export const PartnerLeadSchema = SchemaFactory.createForClass(PartnerLead);
