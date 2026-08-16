import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  password?: string;

  @Prop({ type: String, required: true, default: 'Customer' })
  role: string;

  @Prop({ type: String, required: true, default: 'Active' })
  status: 'Active' | 'Inactive';

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: String })
  displayName?: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: String, enum: ['football', 'basketball', 'both'] })
  favoriteSport?: 'football' | 'basketball' | 'both';

  @Prop({ type: String })
  favoritePlayer?: string;

  @Prop({
    type: {
      showProfilePublicly: { type: Boolean, default: false },
      showCity: { type: Boolean, default: false },
      showRanking: { type: Boolean, default: false },
      showDonationBadge: { type: Boolean, default: false },
      showDonationAmount: { type: Boolean, default: false },
      useNickname: { type: Boolean, default: false },
    },
    default: () => ({
      showProfilePublicly: false,
      showCity: false,
      showRanking: false,
      showDonationBadge: false,
      showDonationAmount: false,
      useNickname: false,
    }),
  })
  privacySettings: {
    showProfilePublicly: boolean;
    showCity: boolean;
    showRanking: boolean;
    showDonationBadge: boolean;
    showDonationAmount: boolean;
    useNickname: boolean;
  };

  @Prop({ type: Boolean, default: false })
  newsletterOptIn: boolean;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: [String], default: [] })
  customPermissions: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: String })
  lastLoginIp?: string;

  @Prop({ type: Boolean, default: false })
  isSuspended: boolean;

  @Prop({ type: Date })
  suspendedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  suspendedBy?: Types.ObjectId;

  @Prop({ type: String })
  internalNotes?: string;

  @Prop({ type: String })
  emailVerificationToken?: string;

  @Prop({ type: Date })
  emailVerificationExpires?: Date;

  @Prop({ type: String })
  resetPasswordToken?: string;

  @Prop({ type: Date })
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

