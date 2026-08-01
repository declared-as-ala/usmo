/**
 * One-shot: backfill `slug` on existing Sponsor documents created before the
 * slug field existed (they were seeded via insertMany in seed.ts, bypassing
 * SponsorsService.create()'s slug generation).
 * Run with: npx tsx apps/api/src/seed-sponsor-slugs.ts
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const sponsorSchema = new Schema({ name: String, slug: String }, { strict: false });
const SponsorModel = model('Sponsor', sponsorSchema);

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-sponsor-slugs] Connected to MongoDB');

  const missing = await SponsorModel.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
  for (const sponsor of missing) {
    let slug = slugify(sponsor.get('name') || '') || `sponsor-${Date.now().toString(36)}`;
    if (await SponsorModel.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    sponsor.set('slug', slug);
    await sponsor.save();
    console.log(`[seed-sponsor-slugs] ${sponsor.get('name')} -> ${slug}`);
  }
  console.log(`[seed-sponsor-slugs] Backfilled ${missing.length} sponsor(s)`);

  await mongoose.disconnect();
  console.log('[seed-sponsor-slugs] Done ✅');
}

bootstrap().catch((err) => {
  console.error('[seed-sponsor-slugs] Failed:', err);
  process.exit(1);
});
