import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StaffMember extends Document {
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, enum: ['football', 'basketball', null], default: null, index: true })
  sport: 'football' | 'basketball' | null;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  nameAr: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, default: '' })
  roleAr: string;

  @Prop({ type: String, default: '' })
  image: string;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' })
  bioAr: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const StaffMemberSchema = SchemaFactory.createForClass(StaffMember);
StaffMemberSchema.index({ sport: 1, active: 1 });
