/**
 * One-shot: wipe and seed the homepage HeroSlide carousel with 4 real slides.
 * Run with: npx tsx apps/api/src/seed-hero-slides.ts
 *
 * Uses the local banner photos already in apps/web/public/banners (no hotlinked URLs).
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

const heroSlideSchema = new Schema({
  title: String, subtitle: String, badgeText: String,
  backgroundImage: String, mobileBackgroundImage: String,
  primaryCtaText: String, primaryCtaLink: String,
  secondaryCtaText: String, secondaryCtaLink: String,
  overlayStrength: { type: String, default: 'medium' },
  textPosition: { type: String, default: 'left' },
  page: { type: String, default: 'home' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startsAt: Date, endsAt: Date,
  createdBy: String, updatedBy: String,
}, { timestamps: true });

const HeroSlideModel = model('HeroSlide', heroSlideSchema);

const slides = [
  {
    title: 'Union Sportive Monastirienne',
    subtitle: 'Depuis 1923',
    badgeText: 'Club officiel',
    backgroundImage: '/banners/BAL 2022 USM winner.webp',
    primaryCtaText: 'Découvrir le club',
    primaryCtaLink: '/histoire',
    secondaryCtaText: 'Palmarès',
    secondaryCtaLink: '/palmares',
    overlayStrength: 'medium',
    textPosition: 'left',
    page: 'home',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Portez les couleurs de Monastir',
    subtitle: 'Boutique officielle USM',
    badgeText: 'Nouvelle collection',
    backgroundImage: '/banners/486419130_9299875776798523_7890028084988873743_n.webp',
    primaryCtaText: 'Découvrir la boutique',
    primaryCtaLink: '/boutique',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    overlayStrength: 'medium',
    textPosition: 'left',
    page: 'home',
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'Revivez les meilleurs moments',
    subtitle: 'USM Media',
    badgeText: 'Photos & vidéos exclusives',
    backgroundImage: '/banners/496944689_1269508031848351_9004919919721692047_n.webp',
    primaryCtaText: 'Explorer USM Media',
    primaryCtaLink: '/media',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    overlayStrength: 'light',
    textPosition: 'left',
    page: 'home',
    displayOrder: 3,
    isActive: true,
  },
  {
    title: 'Rejoignez la famille USM',
    subtitle: 'Fan Zone',
    badgeText: 'Espace supporter',
    backgroundImage: '/banners/499339264_1274966657969155_8144648439245558812_n.webp',
    primaryCtaText: 'Créer mon compte fan',
    primaryCtaLink: '/auth/register',
    secondaryCtaText: 'Découvrir la Fan Zone',
    secondaryCtaLink: '/fanzone',
    overlayStrength: 'medium',
    textPosition: 'left',
    page: 'home',
    displayOrder: 4,
    isActive: true,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('[seed-hero-slides] Connected to MongoDB');

  await HeroSlideModel.deleteMany({ page: 'home' });
  const inserted = await HeroSlideModel.insertMany(slides);
  console.log(`[seed-hero-slides] Inserted ${inserted.length} homepage hero slides`);

  await mongoose.disconnect();
  console.log('[seed-hero-slides] Done ✅');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
