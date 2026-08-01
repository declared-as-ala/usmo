/**
 * One-shot: wipe and seed StadiumPage and Venue collections.
 * Run with: npx tsx apps/api/src/seed-stadium.ts
 *
 * No image URLs are hotlinked here — admins attach real photos later via the
 * Media Library on each record, matching the convention set in seed-heritage.ts.
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

const safetyRuleSchema = new Schema({ title: String, description: String }, { _id: false });

const stadiumPageSchema = new Schema({
  key: { type: String, unique: true, default: 'stadium' },
  heroTitle: String, heroSubtitle: String, heroImage: String,
  safetyIntro: String,
  safetyRules: [safetyRuleSchema],
  status: { type: String, default: 'published' },
}, { timestamps: true });

const venueSchema = new Schema({
  name: String, nameAr: String,
  sport: { type: String, enum: ['football', 'basketball', 'other'], default: 'other' },
  description: String, descriptionAr: String, image: String,
  capacity: Number, gates: String, address: String, addressAr: String,
  directions: String, directionsAr: String, services: [String],
  displayOrder: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
}, { timestamps: true });

const StadiumPageModel = model('StadiumPage', stadiumPageSchema);
const VenueModel = model('Venue', venueSchema);

const stadiumContent = {
  key: 'stadium',
  heroTitle: 'Stades & Salles USM',
  heroSubtitle: 'Accès, capacité, protocoles de sécurité et itinéraires pour les enceintes du club.',
  heroImage: '',
  safetyIntro: 'Ces protocoles s’appliquent à toutes les rencontres à domicile de l’US Monastir, football comme basketball.',
  safetyRules: [
    { title: 'Contrôles de sécurité', description: 'Tous les supporters sont contrôlés par les coordinateurs de sécurité du stade aux points d’accès. Pyrotechnie, lasers et bouteilles en verre sont interdits.' },
    { title: 'Ouverture des portes', description: 'Les portes ouvrent exactement 2 heures avant le coup d’envoi. Il est conseillé d’arriver tôt pour éviter l’affluence aux guichets.' },
    { title: 'Assistance & secours', description: 'Des postes de secours sont présents aux Portes A et D du stade, et à l’Entrée 2 de la salle de basketball. N’hésitez pas à solliciter un steward.' },
  ],
};

const venues = [
  {
    name: 'Stade Mustapha Ben Jannet',
    nameAr: 'ملعب مصطفى بن جنات',
    sport: 'football',
    description: 'La forteresse historique du club, nommée en hommage au pionnier administratif Mustapha Ben Jannet.',
    descriptionAr: 'الحصن التاريخي للنادي، يحمل اسم الرائد الإداري مصطفى بن جنات تخليداً لذكراه.',
    capacity: 20000,
    gates: 'Portes A, B, C, D',
    address: 'Avenue Ibn El Jazzar, Monastir 5000',
    addressAr: 'شارع ابن الجزار، المنستير 5000',
    directions: 'Parking disponible à la Porte B pour les VIP et à la Porte C pour les supporters.',
    directionsAr: 'يتوفر موقف سيارات عند البوابة ب لكبار الزوار وعند البوابة ج لبقية الأنصار.',
    services: ['Parking VIP', 'Guichets', 'Postes de secours'],
    displayOrder: 1,
  },
  {
    name: 'Salle Mohamed-Mzali',
    nameAr: 'قاعة محمد مزالي',
    sport: 'basketball',
    description: 'Notre arène intérieure dominante, siège de multiples titres nationaux et triomphes africains.',
    descriptionAr: 'قاعتنا المغطاة المهيمنة، احتضنت العديد من الألقاب الوطنية والانتصارات الإفريقية.',
    capacity: 5000,
    gates: 'Entrée principale',
    address: 'Complexe Olympique de Monastir',
    addressAr: 'المجمع الأولمبي بالمنستير',
    directions: 'Lignes de bus directes depuis l’aéroport international Habib Bourguiba de Monastir et les gares centrales.',
    directionsAr: 'خطوط حافلات مباشرة من مطار الحبيب بورقيبة الدولي بالمنستير ومن المحطات المركزية.',
    services: ['VIP Lounges', 'Media Desk'],
    displayOrder: 2,
  },
];

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-stadium] Connected to MongoDB');

  await StadiumPageModel.deleteMany({});
  await StadiumPageModel.create(stadiumContent);
  console.log('[seed-stadium] Stadium page content seeded');

  const deleted = await VenueModel.deleteMany({});
  console.log(`[seed-stadium] Cleared ${deleted.deletedCount} existing venues`);
  const inserted = await VenueModel.insertMany(venues);
  console.log(`[seed-stadium] Inserted ${inserted.length} venues`);

  await mongoose.disconnect();
  console.log('[seed-stadium] Done ✅');
}

bootstrap().catch((err) => {
  console.error('[seed-stadium] Failed:', err);
  process.exit(1);
});
