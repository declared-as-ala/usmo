import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FanPoint extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  points: number; // signed int

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({ type: String })
  sourceType?: string;

  @Prop({ type: String })
  sourceId?: string;
}

export const FanPointSchema = SchemaFactory.createForClass(FanPoint);
FanPointSchema.index({ userId: 1, createdAt: -1 });

@Schema()
export class VoteOption {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  label: string;
}

export const VoteOptionSchema = SchemaFactory.createForClass(VoteOption);

@Schema({ timestamps: true })
export class FanVote extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Boolean, default: false, index: true })
  isActive: boolean;

  @Prop({ type: [VoteOptionSchema], default: [] })
  options: VoteOption[];

  @Prop({ type: Date })
  startsAt?: Date;

  @Prop({ type: Date })
  endsAt?: Date;
}

export const FanVoteSchema = SchemaFactory.createForClass(FanVote);

@Schema({ timestamps: true })
export class FanVoteEntry extends Document {
  @Prop({ type: Types.ObjectId, ref: 'FanVote', required: true })
  voteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  optionKey: string;
}

export const FanVoteEntrySchema = SchemaFactory.createForClass(FanVoteEntry);
// One vote per fan per poll
FanVoteEntrySchema.index({ voteId: 1, userId: 1 }, { unique: true });
