/**
 * One-shot: wipe and seed the Badge and Reward catalogs.
 * Run with: npx tsx apps/api/src/seed-loyalty.ts
 *
 * No image URLs are hotlinked here — admins attach real visuals later via the
 * Media Library, matching the convention set in seed-heritage.ts / seed-legends.ts.
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

const badgeSchema = new Schema({
  key: { type: String, unique: true },
  name: String, nameAr: String,
  description: String, descriptionAr: String,
  icon: String,
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const rewardSchema = new Schema({
  title: String, titleAr: String,
  description: String, descriptionAr: String,
  pointsCost: Number,
  stock: { type: Number, default: null },
  image: String,
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const BadgeModel = model('Badge', badgeSchema);
const RewardModel = model('Reward', rewardSchema);

const badges = [
  {
    key: 'welcome',
    name: 'Bienvenue',
    nameAr: 'مرحباً بك',
    description: 'A rejoint la communauté des supporters USM en créant un compte.',
    descriptionAr: 'انضم إلى مجتمع أنصار الاتحاد الرياضي المنستيري بإنشاء حساب.',
    icon: 'Sparkles',
    displayOrder: 1,
  },
  {
    key: 'first-vote',
    name: 'Premier Vote',
    nameAr: 'أول تصويت',
    description: 'A participé à son premier sondage officiel du club.',
    descriptionAr: 'شارك في أول استطلاع رأي رسمي للنادي.',
    icon: 'Vote',
    displayOrder: 2,
  },
  {
    key: 'first-prediction',
    name: 'Pronostiqueur',
    nameAr: 'متنبئ',
    description: 'A pronostiqué le score de son premier match.',
    descriptionAr: 'توقع نتيجة أول مباراة له.',
    icon: 'Target',
    displayOrder: 3,
  },
  {
    key: 'first-order',
    name: 'Client Officiel',
    nameAr: 'عميل رسمي',
    description: 'A passé sa première commande sur la boutique officielle.',
    descriptionAr: 'قام بأول طلبية في المتجر الرسمي.',
    icon: 'ShoppingBag',
    displayOrder: 4,
  },
  {
    key: 'donor',
    name: 'Bienfaiteur',
    nameAr: 'متبرع',
    description: 'A soutenu le club par un don confirmé.',
    descriptionAr: 'دعم النادي من خلال تبرع مؤكد.',
    icon: 'Heart',
    displayOrder: 5,
  },
  {
    key: 'member',
    name: 'Membre Actif',
    nameAr: 'عضو نشط',
    description: 'Détient un abonnement membre actif au club.',
    descriptionAr: 'يمتلك اشتراك عضوية نشط في النادي.',
    icon: 'IdCard',
    displayOrder: 6,
  },
];

const rewards = [
  {
    title: 'Fond d\'écran numérique USM',
    titleAr: 'خلفية رقمية للاتحاد الرياضي المنستيري',
    description: 'Un pack de fonds d\'écran exclusifs aux couleurs du club, envoyé par email.',
    descriptionAr: 'مجموعة خلفيات حصرية بألوان النادي، ترسل عبر البريد الإلكتروني.',
    pointsCost: 100,
    stock: null,
    displayOrder: 1,
  },
  {
    title: 'Message vidéo personnalisé du club',
    titleAr: 'رسالة فيديو شخصية من النادي',
    description: 'Une mention spéciale sur les réseaux officiels du club pour votre soutien.',
    descriptionAr: 'إشارة خاصة على المنصات الرسمية للنادي تقديراً لدعمكم.',
    pointsCost: 500,
    stock: 20,
    displayOrder: 2,
  },
  {
    title: 'Écharpe officielle USM',
    titleAr: 'وشاح رسمي للاتحاد الرياضي المنستيري',
    description: 'Une écharpe collector du club, à retirer à la boutique officielle.',
    descriptionAr: 'وشاح تذكاري للنادي، يمكن استلامه من المتجر الرسمي.',
    pointsCost: 1500,
    stock: 10,
    displayOrder: 3,
  },
];

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-loyalty] Connected to MongoDB');

  const badgesDeleted = await BadgeModel.deleteMany({});
  console.log(`[seed-loyalty] Cleared ${badgesDeleted.deletedCount} existing badges`);
  const badgesInserted = await BadgeModel.insertMany(badges);
  console.log(`[seed-loyalty] Inserted ${badgesInserted.length} badges`);

  const rewardsDeleted = await RewardModel.deleteMany({});
  console.log(`[seed-loyalty] Cleared ${rewardsDeleted.deletedCount} existing rewards`);
  const rewardsInserted = await RewardModel.insertMany(rewards);
  console.log(`[seed-loyalty] Inserted ${rewardsInserted.length} rewards`);

  await mongoose.disconnect();
  console.log('[seed-loyalty] Done ✅');
}

bootstrap().catch((err) => {
  console.error('[seed-loyalty] Failed:', err);
  process.exit(1);
});
