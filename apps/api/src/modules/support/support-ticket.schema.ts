import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TicketMessage {
  @Prop({ type: String, enum: ['fan', 'admin'], required: true })
  from: 'fan' | 'admin';

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

@Schema({ timestamps: true })
export class SupportTicket extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({
    type: String,
    enum: ['membership', 'order', 'donation', 'account', 'other'],
    default: 'other',
  })
  category: string;

  @Prop({ type: String, enum: ['open', 'answered', 'closed'], default: 'open', index: true })
  status: 'open' | 'answered' | 'closed';

  @Prop({ type: [TicketMessageSchema], default: [] })
  messages: TicketMessage[];
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
