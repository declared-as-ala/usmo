import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
