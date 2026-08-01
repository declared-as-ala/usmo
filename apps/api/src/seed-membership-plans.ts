import 'dotenv/config';
import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const membershipPlanSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  durationDays: { type: Number, required: true },
  benefits: { type: [String], default: [] },
  badge: { type: String },
  color: { type: String },
  isActive: { type: Boolean, default: true, index: true },
  displayOrder: { type: Number, default: 0 },
  memberDiscountPercent: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

const MembershipPlanModel = model('MembershipPlan', membershipPlanSchema, 'membershipplans');

const plans = [
  {
    name: 'Fan Premium',
    slug: 'fan-premium',
    description: 'Débloquez tout le contenu exclusif USM Media et profitez de réductions exclusives.',
    price: 50000, // 50 TND in millimes
    durationDays: 365,
    benefits: [
      'Carte de supporter numérique',
      'Accès illimité à USM Media Premium',
      'Participation aux votes de l\'Homme du Match',
      'Participation aux classements des supporters (leaderboard)',
      'Remise de 5% sur la Boutique Officielle',
    ],
    badge: 'premium',
    color: '#D4AF37', // Gold accent
    isActive: true,
    displayOrder: 1,
    memberDiscountPercent: 5,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[seed-membership-plans] Connected to MongoDB');

  // Upsert by slug (not destructive delete+insert) so existing membership
  // requests keep pointing at a valid planId instead of being orphaned.
  const slugs = plans.map((p) => p.slug);
  const removed = await MembershipPlanModel.deleteMany({ slug: { $nin: slugs } });
  console.log(`[seed-membership-plans] Removed ${removed.deletedCount} plan(s) no longer in the catalog`);

  for (const plan of plans) {
    const result = await MembershipPlanModel.findOneAndUpdate(
      { slug: plan.slug },
      { $set: plan },
      { upsert: true, new: true },
    );
    console.log(`  - ${result!.name} (${Math.round(result!.price / 1000)} TND, -${(result as any).memberDiscountPercent || 0}%)`);
  }

  console.log(`[seed-membership-plans] Synced ${plans.length} plan(s) successfully`);
  await mongoose.disconnect();
  console.log('[seed-membership-plans] Done ✅');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
