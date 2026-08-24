import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SportsSyncLock extends Document {
  @Prop({ type: String, required: true, unique: true })
  lockKey: string;

  @Prop({ type: String, required: true })
  owner: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const SportsSyncLockSchema = SchemaFactory.createForClass(SportsSyncLock);
SportsSyncLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
