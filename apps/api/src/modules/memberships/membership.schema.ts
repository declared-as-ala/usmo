import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class MembershipStatusHistoryEntry extends Document {
  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'active', 'expired', 'cancelled', 'suspended', 'rejected'],
  })
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended' | 'rejected';

  @Prop({ type: Date, required: true, default: Date.now })
  at: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  by?: Types.ObjectId;

  @Prop({ type: String })
  note?: string;
}

export const MembershipStatusHistoryEntrySchema = SchemaFactory.createForClass(MembershipStatusHistoryEntry);

@Schema({ timestamps: true })
export class Membership extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MembershipPlan', required: true })
  planId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'active', 'expired', 'cancelled', 'suspended', 'rejected'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended' | 'rejected';

  @Prop({ type: String, enum: ['manual', 'online'], default: 'manual' })
  source: 'manual' | 'online';

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy?: Types.ObjectId;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Membership' })
  renewedFrom?: Types.ObjectId;

  @Prop({ type: [MembershipStatusHistoryEntrySchema], default: [] })
  statusHistory: MembershipStatusHistoryEntry[];

  @Prop({ type: String })
  internalNote?: string;

  @Prop({ type: String })
  proofFile?: string;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

// Compound index for active check efficiency
MembershipSchema.index({ userId: 1, status: 1, endDate: -1 });
