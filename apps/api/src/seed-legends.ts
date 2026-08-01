/**
 * One-shot: wipe and seed the Legend collection.
 * Run with: npx tsx apps/api/src/seed-legends.ts
 *
 * No image URLs are hotlinked here — admins attach real photos later via the
 * Media Library on each record, matching the convention set in seed-heritage.ts.
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

const legendSchema = new Schema({
  name: String, nameAr: String,
  sport: { type: String, enum: ['football', 'basketball', 'club'], default: 'club' },
  years: String, role: String, roleAr: String,
  achievement: String, achievementAr: String,
  bio: String, bioAr: String,
  image: String,
  displayOrder: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
}, { timestamps: true });

const LegendModel = model('Legend', legendSchema);

const legends = [
  {
    name: 'Radhouane Slimane',
    nameAr: 'رضوان سليمان',
    sport: 'basketball',
    years: '2019 - Présent',
    role: 'Légende du basketball / Capitaine',
    roleAr: 'أسطورة كرة السلة / القائد',
    achievement: '1x Champion BAL, 5x Champion de Tunisie Pro A',
    achievementAr: 'بطل أفريقيا BAL، 5 مرات بطل تونس للبطولة المحترفة',
    bio: 'L’un des joueurs tunisiens les plus titrés de sa génération. Son expérience et son leadership ont été déterminants dans le triomphe historique du BAL 2022 au Rwanda.',
    bioAr: 'من أكثر اللاعبين تتويجاً في تاريخ كرة السلة التونسية. كانت خبرته وقيادته عاملًا حاسمًا في التتويج التاريخي باللقب الأفريقي BAL سنة 2022 برواندا.',
    displayOrder: 1,
  },
  {
    name: 'Mustapha Ben Jannet',
    nameAr: 'مصطفى بن جنات',
    sport: 'club',
    years: '1940s - 1950s',
    role: 'Fondateur du club / Administrateur historique',
    roleAr: 'مؤسس النادي / إداري تاريخي',
    achievement: 'Symbole de la résistance du club, nom officiel du stade',
    achievementAr: 'رمز مقاومة النادي وحامل اسم الملعب الرسمي للفريق',
    bio: 'Une figure fondatrice de l’histoire du club, qui s’est battu pour l’institutionnalisation du sport à Monastir durant la période coloniale. Le stade principal de football porte son nom en hommage.',
    bioAr: 'شخصية بارزة في تاريخ النادي، كافح من أجل تنظيم وهيكلة الرياضة في مدينة المنستير في حقبة الاستعمار. يحمل ملعب كرة القدم الرئيسي اسمه تخليداً لذكراه.',
    displayOrder: 2,
  },
];

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-legends] Connected to MongoDB');

  const deleted = await LegendModel.deleteMany({});
  console.log(`[seed-legends] Cleared ${deleted.deletedCount} existing legends`);

  const inserted = await LegendModel.insertMany(legends);
  console.log(`[seed-legends] Inserted ${inserted.length} legends`);

  await mongoose.disconnect();
  console.log('[seed-legends] Done ✅');
}

bootstrap().catch((err) => {
  console.error('[seed-legends] Failed:', err);
  process.exit(1);
});
