import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DonationDocument = Donation & Document;

@Schema({ timestamps: true })
export class Donation {
  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ required: true, default: 'TND' })
  currency: string;

  @Prop({ required: true })
  donorName: string;

  @Prop({ required: true })
  donorEmail: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true, enum: ['public', 'anonymous'], default: 'public' })
  visibility: 'public' | 'anonymous';

  @Prop({ required: false })
  message?: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true })
  paymentStatus: 'pending' | 'completed' | 'failed';

  @Prop({ required: false, unique: true, sparse: true })
  paymentReference?: string;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
