import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerSport = 'football' | 'basketball';
export type PlayerStatus = 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'LOANED' | 'LEFT_CLUB' | 'RETIRED' | 'INACTIVE';
export type PreferredFoot = 'Droit' | 'Gauche' | 'Ambidextre';

@Schema({ timestamps: true })
export class Player extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true, enum: ['football', 'basketball'], index: true })
  sport: PlayerSport;

  @Prop({ type: String, default: '' })
  firstName?: string;

  @Prop({ type: String, default: '' })
  lastName?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  displayName?: string;

  @Prop({ type: String, default: '' })
  nameAr?: string;

  @Prop({ type: Number, required: true, index: true })
  number: number;

  @Prop({ type: String, default: 'Équipe Première' })
  team?: string;

  @Prop({ type: String, required: true, index: true })
  position: string;

  @Prop({ type: String, default: '' })
  secondaryPosition?: string;

  @Prop({ type: String, default: '' })
  positionAr?: string;

  @Prop({ type: String, default: 'Tunisian' })
  nationality: string;

  @Prop({ type: String, default: 'تونسي' })
  nationalityAr?: string;

  /** Primary portrait photo */
  @Prop({ type: String, default: '' })
  image: string;

  @Prop({
    type: Object,
    default: {
      portrait: '',
      cardImage: '',
      heroImage: '',
      focalPoint: { x: 50, y: 50 },
    },
  })
  media?: {
    portrait?: string;
    cardImage?: string;
    heroImage?: string;
    focalPoint?: { x: number; y: number };
  };

  @Prop({
    type: Object,
    default: {
      joinedAt: '',
      contractEndAt: '',
      previousClub: '',
      isCaptain: false,
      isViceCaptain: false,
    },
  })
  club?: {
    joinedAt?: string;
    contractEndAt?: string;
    previousClub?: string;
    isCaptain?: boolean;
    isViceCaptain?: boolean;
  };

  @Prop({ type: String, default: '2026-2027', index: true })
  season?: string;

  @Prop({ type: String, default: '2026-2027' })
  currentSeasonId?: string;

  @Prop({ type: Object, default: {} })
  stats: Record<string, number | string>;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' })
  shortBio?: string;

  @Prop({ type: String, default: '' })
  bioAr?: string;

  @Prop({ type: String, default: '' })
  height: string;

  @Prop({ type: String, default: '' })
  weight: string;

  @Prop({ type: String, default: null })
  dateOfBirth?: string | null;

  @Prop({ type: Number, default: null })
  age: number | null;

  @Prop({ type: String, enum: ['Droit', 'Gauche', 'Ambidextre'], default: 'Droit' })
  preferredFoot?: PreferredFoot;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INJURED', 'SUSPENDED', 'LOANED', 'LEFT_CLUB', 'RETIRED', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
  })
  status: PlayerStatus;

  @Prop({ type: Boolean, default: true, index: true })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0, index: true })
  displayOrder: number;

  @Prop({ type: String, default: '' })
  seoTitle?: string;

  @Prop({ type: String, default: '' })
  seoDescription?: string;

  @Prop({ type: String, default: '' })
  ogImage?: string;

  @Prop({ type: String, default: '' })
  createdBy?: string;

  @Prop({ type: String, default: '' })
  updatedBy?: string;

  @Prop({ type: Date, default: null })
  archivedAt?: Date | null;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.index({ sport: 1, active: 1, displayOrder: 1 });
PlayerSchema.index({ sport: 1, position: 1 });
PlayerSchema.index({ sport: 1, number: 1 });
