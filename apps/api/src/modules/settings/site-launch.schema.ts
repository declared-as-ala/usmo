import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SiteLaunchSettings extends Document {
  @Prop({ required: true, default: 'site-launch', unique: true })
  key: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: () => new Date('2026-09-09T18:23:00.000Z') })
  launchAt: Date;

  @Prop({ default: 'Africa/Tunis' })
  timezone: string;

  @Prop({ default: false })
  unlocked: boolean;

  @Prop({ default: 'System' })
  updatedBy: string;
}

export const SiteLaunchSettingsSchema = SchemaFactory.createForClass(SiteLaunchSettings);
