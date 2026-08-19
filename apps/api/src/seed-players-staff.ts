/**
 * One-shot: migrate the football/basketball roster and technical staff from
 * apps/web/src/data/mockData.ts (client-only mock state) into real MongoDB
 * collections served by PlayersModule / StaffModule.
 * Run with: npx tsx apps/api/src/seed-players-staff.ts
 *
 * Image paths are carried over unchanged from the existing mock data (a mix of
 * local /public files already present in apps/web/public and a few pre-existing
 * Unsplash placeholders) — no new URLs are invented here.
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

const playerSchema = new Schema({
  slug: { type: String, unique: true, required: true },
  sport: { type: String, enum: ['football', 'basketball'], required: true },
  name: String, nameAr: String, number: Number,
  position: String, positionAr: String,
  nationality: String, nationalityAr: String,
  image: String, stats: Object,
  bio: String, bioAr: String,
  height: String, weight: String, age: Number,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const staffSchema = new Schema({
  slug: { type: String, unique: true, required: true },
  sport: { type: String, enum: ['football', 'basketball', null], default: null },
  name: String, nameAr: String,
  role: String, roleAr: String,
  image: String, bio: String, bioAr: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const PlayerModel = model('Player', playerSchema);
const StaffModel = model('StaffMember', staffSchema);

const footballPlayers = [
  { name: 'Moez Ben Cherifia', nameAr: 'معز بن شريفية', number: 1, position: 'Goalkeeper', positionAr: 'حارس مرمى', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/moez_ben_cherifia.png', stats: { '2026/27': 'Titulaire', Matches: 2, Cleansheets: 1 }, bio: 'Hardi gardien et pilier de la défense de l’US Monastir pour la saison 2026-2027. Reconnu pour ses réflexes décisifs.', bioAr: 'حارس مرمى راسخ وركيزة المتانة الدفاعية للاتحاد لموسم 2026-2027.', height: '187 cm', weight: '83 kg', age: 30 },
  { name: 'Chiheb Salhi', nameAr: 'شهاب الصالحي', number: 4, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/chiheb_salhi.png', stats: { '2026/27': 'Défenseur', Tackles: 8, Blocks: 4 }, bio: 'Mur défensif et cadre de la charnière centrale usmiste pour l’exercice 2026-2027.', bioAr: 'جدار دفاعي قوي يتميز بقدرات هوائية متميزة للموسم الكروي 2026-2027.', height: '186 cm', weight: '80 kg', age: 28 },
  { name: 'Bilel Ifa', nameAr: 'بلال عيفية', number: 5, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/bilel_ifa.png', stats: { '2026/27': 'Défenseur', Tackles: 7, Interceptions: 5 }, bio: 'Défenseur central d’expérience dirigeant le bloc bleu et blanc en 2026-2027.', bioAr: 'مدافع وسطي يملك خبرة كبيرة لقيادة الخط الخلفي للاتحاد في موسم 2026-2027.', height: '183 cm', weight: '78 kg', age: 26 },
  { name: 'Firas Ghouma', nameAr: 'فراس غومة', number: 3, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/firas_ghouma.png', stats: { '2026/27': 'Latéral', Assists: 1, Crosses: 9 }, bio: 'Arrière latéral gauche porté vers l’attaque pour la campagne 2026-2027.', bioAr: 'ظهير أيسر هجومي متميز للموسم الرياضي 2026-2027.', height: '178 cm', weight: '74 kg', age: 25 },
  { name: 'Moses Orkuma', nameAr: 'موسى أوركوما', number: 8, position: 'Midfielder', positionAr: 'متوسط ميدان', nationality: 'Nigerian', nationalityAr: 'نيجيري', image: '/moses_orkuma.png', stats: { '2026/27': 'Milieu', Passes: 84, KeyPasses: 6 }, bio: 'Milieu box-to-box apportant impact physique et volume de jeu en 2026-2027.', bioAr: 'لاعب وسط ديناميكي يمنح الفريق حضوراً بدنياً في موسم 2026-2027.', height: '180 cm', weight: '76 kg', age: 30 },
  { name: 'Firas Ifia', nameAr: 'فراس عيفية', number: 10, position: 'Midfielder', positionAr: 'متوسط ميدان', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/firas_ifia.png', stats: { '2026/27': 'N°10', Goals: 1, Assists: 2 }, bio: 'Meneur de jeu et chef d’orchestre du milieu monastirien pour la saison 2026-2027.', bioAr: 'صانع ألعاب الفريق وموجه الهجمات لموسم 2026-2027.', height: '178 cm', weight: '72 kg', age: 26 },
  { name: 'Wajdi Ben Othmane', nameAr: 'وجدي بن عثمان', number: 6, position: 'Midfielder', positionAr: 'متوسط ميدان', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93?auto=format&fit=crop&w=400&q=80', stats: { '2026/27': 'Milieu Def', Tackles: 10, Recoveries: 12 }, bio: 'Récupérateur infatigable protégeant l’arrière-garde de l’USM en 2026-2027.', bioAr: 'لاعب وسط دفاعي يحمي الخط الخلفي في الموسم الكروي 2026-2027.', height: '182 cm', weight: '79 kg', age: 27 },
  { name: 'Adem Alimi', nameAr: 'آدم العلمي', number: 11, position: 'Forward', positionAr: 'مهاجم', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=400&q=80', stats: { '2026/27': 'Attaquant', Goals: 2, Shots: 6 }, bio: 'Ailier percutant et buteur clé de l’attaque monastirienne en 2026-2027.', bioAr: 'جناح هجومي حاسم في التشكيلة الرسمية لموسم 2026-2027.', height: '175 cm', weight: '68 kg', age: 23 },
  { name: 'Yan Mbe', nameAr: 'يان مبي', number: 9, position: 'Forward', positionAr: 'مهاجم', nationality: 'Cameroonian', nationalityAr: 'كاميروني', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80', stats: { '2026/27': 'Avant-centre', Goals: 1, Assists: 1 }, bio: 'Avant-centre puissant et finisseur attitré de l’USM pour la saison 2026-2027.', bioAr: 'مهاجم صريح يقود خط هجوم الاتحاد في موسم 2026-2027.', height: '186 cm', weight: '84 kg', age: 28 },
  { name: 'Nizar Jelassi', nameAr: 'نزار الجلاصي', number: 7, position: 'Forward', positionAr: 'مهاجم', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80', stats: { '2026/27': 'Ailier', Goals: 1, Dribbles: 8 }, bio: 'Ailier rapide et déstabilisateur sur le flanc droit pour l’exercice 2026-2027.', bioAr: 'جناح سريع يربك الدفاعات في saison 2026-2027.', height: '173 cm', weight: '67 kg', age: 24 },
  { name: 'Khalil Ben Youssef', nameAr: 'خليل بن يوسف', number: 2, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1431324155629-1a6edd1d1534?auto=format&fit=crop&w=400&q=80', stats: { '2026/27': 'Latéral', Tackles: 6, Clearances: 7 }, bio: 'Latéral droit rigoureux engagé sous les couleurs bleu et blanc en 2026-2027.', bioAr: 'ظهير أيمن متوازن في التشكيلة الأساسية 2026-2027.', height: '179 cm', weight: '75 kg', age: 22 },
].map((p) => ({ ...p, sport: 'football' as const }));

const basketballPlayers = [
  { name: 'Radhouane Slimane', nameAr: 'رضوان سليمان', number: 12, position: 'Forward-C', positionAr: 'جناح / ارتكاز', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/radhouane_slimane.png', stats: { '2026/27': 'Capitaine', PPG: '15.1', RPG: '7.2' }, bio: 'Légende vivante et capitaine emblématique de l’USM Basketball pour la saison 2026-2027.', bioAr: 'أسطورة حية وقائد فريق كرة السلة لموسم 2026-2027.', height: '205 cm', weight: '102 kg', age: 44 },
  { name: 'Makrem Ben Romdhane', nameAr: 'مكرم بن رمضان', number: 4, position: 'Guard', positionAr: 'لاعب خلفي', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/makrem_ben_romdhane.png', stats: { '2026/27': 'Meneur', PPG: '16.0', APG: '6.1' }, bio: 'Meneur d’élite et leader du jeu monastirien engagé pour la campagne Pro A 2026-2027.', bioAr: 'لاعب خلفي متميز يقود اللعب الهجومي لموسم 2026-2027.', height: '187 cm', weight: '86 kg', age: 40 },
  { name: 'Firas Lahyani', nameAr: 'فراس لحياني', number: 15, position: 'Forward', positionAr: 'لاعب جناح', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/firas_lahyani.png', stats: { '2026/27': 'Ailier', PPG: '13.4', RPG: '8.5' }, bio: 'Surnommé "Air Tunisia", athlète spectaculaire au contre et au dunk pour l’exercice 2026-2027.', bioAr: 'الملقب بـ "طيران تونس" في التشكيلة الأساسية 2026-2027.', height: '201 cm', weight: '94 kg', age: 33 },
  { name: 'Mourad El Mabrouk', nameAr: 'مراد المبروك', number: 7, position: 'Guard', positionAr: 'لاعب خلفي', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/mourad_el_mabrouk.png', stats: { '2026/27': 'Shooter', PPG: '12.0', '3P%': '44%' }, bio: 'Shooteur longue distance d’élite étirant les défenses adverses en 2026-2027.', bioAr: 'قناص الثلاثيات للاتحاد المنستيري في موسم 2026-2027.', height: '189 cm', weight: '84 kg', age: 36 },
  { name: 'Ater Majok', nameAr: 'أتير ماجوك', number: 13, position: 'Center', positionAr: 'لاعب ارتكاز', nationality: 'South Sudanese-Australian', nationalityAr: 'جنوب سوداني / أسترالي', image: '/ater_majok.png', stats: { '2026/27': 'Pivot', RPG: '11.0', BPG: '3.3' }, bio: 'Protecteur du cercle d’élite et bouncer de la raquette usmiste en 2026-2027.', bioAr: 'أفضل مدافع وحامي السلة في الموسم الرياضي 2026-2027.', height: '210 cm', weight: '105 kg', age: 38 },
  { name: 'Mehdi Cherif Ouaret', nameAr: 'مهدي شريف وارت', number: 21, position: 'Center', positionAr: 'لاعب ارتكاز', nationality: 'Algerian', nationalityAr: 'جزائري', image: '/mehdi_cherif_ouaret.png', stats: { '2026/27': 'Pivot', PPG: '14.0', RPG: '9.4' }, bio: 'Force intérieure dominante apportant puissance et réussite sous le panneau en 2026-2027.', bioAr: 'لاعب ارتكاز قوي يفرض هيمنته في موسم 2026-2027.', height: '208 cm', weight: '108 kg', age: 32 },
  { name: 'Skander Ben Romdhane', nameAr: 'إسكندر بن رمضان', number: 11, position: 'Forward', positionAr: 'لاعب جناح', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/skander_ben_romdhane.png', stats: { '2026/27': 'Ailier', PPG: '11.2', RPG: '5.8' }, bio: 'Ailier polyvalent précieux en transition et au rebond pour la saison 2026-2027.', bioAr: 'جناح متعدد الاستخدامات في تشكيلة موسم 2026-2027.', height: '197 cm', weight: '89 kg', age: 28 },
].map((p) => ({ ...p, sport: 'basketball' as const }));

const staff = [
  { name: 'Lassaad Chabbi', nameAr: 'لسعد الشابي', role: 'Football Head Coach', roleAr: 'مدرب كرة قدم أول', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', sport: 'football' as const },
  { name: 'Miodrag Perisic', nameAr: 'ميودراغ بيريسيتش', role: 'Basketball Head Coach', roleAr: 'مدرب كرة سلة أول', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', sport: 'basketball' as const },
  { name: 'Anis Chaabane', nameAr: 'أنيس شعبان', role: 'Assistant Coach', roleAr: 'مدرب مساعد', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', sport: 'football' as const },
  { name: 'Dr. Riadh El Bez', nameAr: 'د. رياض البز', role: 'Team Chief Medical Doctor', roleAr: 'طبيب الفريق الرئيسي', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', sport: null },
];

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('Connected to', uri);

  await PlayerModel.deleteMany({});
  await StaffModel.deleteMany({});

  const seenSlugs = new Set<string>();
  const withSlug = <T extends { name: string }>(items: T[]) =>
    items.map((item) => {
      let slug = slugify(item.name);
      while (seenSlugs.has(slug)) slug = `${slug}-2`;
      seenSlugs.add(slug);
      return { ...item, slug };
    });

  const players = withSlug([...footballPlayers, ...basketballPlayers]);
  await PlayerModel.insertMany(players);
  console.log(`Seeded ${players.length} players`);

  seenSlugs.clear();
  const staffWithSlug = withSlug(staff);
  await StaffModel.insertMany(staffWithSlug);
  console.log(`Seeded ${staffWithSlug.length} staff members`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
