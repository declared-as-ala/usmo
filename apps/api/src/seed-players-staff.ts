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
  { name: 'Moez Ben Cherifia', nameAr: 'معز بن شريفية', number: 1, position: 'Goalkeeper', positionAr: 'حارس مرمى', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/moez_ben_cherifia.png', stats: { Matches: 28, Cleansheets: 10, Saves: 71 }, bio: 'Commanding goalkeeper and bedrock of USM defensive solidity. Known for spectacular reflex saves and precise distribution.', bioAr: 'حارس مرمى راسخ وركيزة المتانة الدفاعية للاتحاد. يُعرف بتصديات انعكاسية مذهلة وتوزيع دقيق.', height: '187 cm', weight: '83 kg', age: 30 },
  { name: 'Chiheb Salhi', nameAr: 'شهاب الصالحي', number: 4, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/chiheb_salhi.png', stats: { Tackles: 45, Blocks: 22, Goals: 2 }, bio: 'A defensive wall with unmatched aerial ability and tactical intelligence.', bioAr: 'جدار دفاعي قوي يتميز بقدرات هوائية لا تضاهى وذكاء تكتيكي ممتاز.', height: '186 cm', weight: '80 kg', age: 28 },
  { name: 'Bilel Ifa', nameAr: 'بلال عيفية', number: 5, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/bilel_ifa.png', stats: { Tackles: 38, Blocks: 18, Interceptions: 29 }, bio: 'Tenacious centre-back who organises the backline with authority and reads the game superbly.', bioAr: 'مدافع وسطي شرس ينظم الخط الدفاعي بسلطة ويقرأ اللعبة بشكل رائع.', height: '183 cm', weight: '78 kg', age: 26 },
  { name: 'Firas Ghouma', nameAr: 'فراس غومة', number: 3, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/firas_ghouma.png', stats: { Assists: 4, Crosses: 52, Tackles: 31 }, bio: 'Attack-minded left-back who excels in overlapping runs and dangerous crossing into the box.', bioAr: 'ظهير أيسر هجومي يبرع في الجري المتداخل والتمريرات العرضية الخطيرة داخل المنطقة.', height: '178 cm', weight: '74 kg', age: 25 },
  { name: 'Moses Orkuma', nameAr: 'موسى أوركوما', number: 8, position: 'Midfielder', positionAr: 'متوسط ميدان', nationality: 'Nigerian', nationalityAr: 'نيجيري', image: '/moses_orkuma.png', stats: { Assists: 5, KeyPasses: 34, Interceptions: 41 }, bio: 'Dynamic central midfielder who provides physical presence and box-to-box energy.', bioAr: 'لاعب وسط ديناميكي يمنح الفريق حضوراً بدنياً قوياً ويمتاز باللعب من صندوق إلى صندوق.', height: '180 cm', weight: '76 kg', age: 30 },
  { name: 'Firas Ifia', nameAr: 'فراس عيفية', number: 10, position: 'Midfielder', positionAr: 'متوسط ميدان', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/firas_ifia.png', stats: { Goals: 4, Assists: 8, KeyPasses: 45 }, bio: 'Creative playmaker and set-piece specialist who dictates the offensive tempo.', bioAr: 'صانع ألعاب مبتكر ومتخصص في الكرات الثابتة، يتحكم في إيقاع هجوم الفريق.', height: '178 cm', weight: '72 kg', age: 26 },
  { name: 'Wajdi Ben Othmane', nameAr: 'وجدي بن عثمان', number: 6, position: 'Midfielder', positionAr: 'متوسط ميدان', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93?auto=format&fit=crop&w=400&q=80', stats: { Tackles: 55, Recoveries: 48, Goals: 1 }, bio: 'Tireless defensive midfielder who shields the backline and wins crucial possession battles.', bioAr: 'لاعب وسط دفاعي لا يكل يحمي الخط الخلفي ويكسب مواجهات الاستحواذ الحاسمة.', height: '182 cm', weight: '79 kg', age: 27 },
  { name: 'Adem Alimi', nameAr: 'آدم العلمي', number: 11, position: 'Forward', positionAr: 'مهاجم', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=400&q=80', stats: { Goals: 12, Assists: 6, Matches: 22 }, bio: 'Fast-paced winger with incredible dribbling skills and lethal finishing under pressure.', bioAr: 'جناح سريع يتميز بمهارات مراوغة رائعة وإنهاء قاتل للهجمات تحت الضغط.', height: '175 cm', weight: '68 kg', age: 23 },
  { name: 'Yan Mbe', nameAr: 'يان مبي', number: 9, position: 'Forward', positionAr: 'مهاجم', nationality: 'Cameroonian', nationalityAr: 'كاميروني', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80', stats: { Goals: 9, Assists: 3, Shots: 42 }, bio: 'Powerful centre-forward with exceptional hold-up play, aerial dominance and clinical finishing.', bioAr: 'مهاجم أمامي قوي يتميز بالتحكم في الكرة وإدارة الظهر وقوته الجوية وإنهاء احترافي.', height: '186 cm', weight: '84 kg', age: 28 },
  { name: 'Nizar Jelassi', nameAr: 'نزار الجلاصي', number: 7, position: 'Forward', positionAr: 'مهاجم', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80', stats: { Goals: 7, Assists: 9, Dribbles: 38 }, bio: 'Electric right winger with explosive pace, technical dribbling flair, and key-pass creativity.', bioAr: 'جناح أيمن متفجر بسرعة خارقة وبراعة تقنية في المراوغة وإبداع في التمريرات المفتاحية.', height: '173 cm', weight: '67 kg', age: 24 },
  { name: 'Khalil Ben Youssef', nameAr: 'خليل بن يوسف', number: 2, position: 'Defender', positionAr: 'مدافع', nationality: 'Tunisian', nationalityAr: 'تونسي', image: 'https://images.unsplash.com/photo-1431324155629-1a6edd1d1534?auto=format&fit=crop&w=400&q=80', stats: { Tackles: 34, Assists: 2, Clearances: 41 }, bio: 'Reliable right-back with excellent defensive positioning and stamina for high-tempo pressing.', bioAr: 'ظهير أيمن موثوق بتموضع دفاعي ممتاز وقدرة على الضغط العالي طوال المباراة.', height: '179 cm', weight: '75 kg', age: 22 },
].map((p) => ({ ...p, sport: 'football' as const }));

const basketballPlayers = [
  { name: 'Radhouane Slimane', nameAr: 'رضوان سليمان', number: 12, position: 'Forward-C', positionAr: 'جناح / ارتكاز', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/radhouane_slimane.png', stats: { PPG: '14.5', RPG: '6.8', APG: '2.4' }, bio: 'Living legend of Tunisian basketball. Guided USM to its BAL 2022 victory with clutch scoring and inspirational leadership.', bioAr: 'أسطورة حية في كرة السلة التونسية. قاد الاتحاد المنستيري للتتويج بالدوري الإفريقي 2022.', height: '205 cm', weight: '102 kg', age: 44 },
  { name: 'Makrem Ben Romdhane', nameAr: 'مكرم بن رمضان', number: 4, position: 'Guard', positionAr: 'لاعب خلفي', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/makrem_ben_romdhane.png', stats: { PPG: '15.2', APG: '5.6', '3P%': '39%' }, bio: 'Elite playmaking guard and one of the most decorated Tunisian players. Multiple national champion and BAL 2022 finals hero.', bioAr: 'لاعب خلفي متميز وأحد أكثر اللاعبين التونسيين تتويجاً. بطل متعدد المرات وأبرز نجوم نهائي الدوري الإفريقي 2022.', height: '187 cm', weight: '86 kg', age: 40 },
  { name: 'Firas Lahyani', nameAr: 'فراس لحياني', number: 15, position: 'Forward', positionAr: 'لاعب جناح', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/firas_lahyani.png', stats: { PPG: '12.8', RPG: '8.2', BPG: '1.9' }, bio: 'Known as the "Air Tunisia" for his incredible dunking and dominant blocking ability.', bioAr: 'الملقب بـ "طيران تونس" لقفزاته الرائعة وقدراته الدفاعية الخارقة في حائط الصد.', height: '201 cm', weight: '94 kg', age: 33 },
  { name: 'Mourad El Mabrouk', nameAr: 'مراد المبروك', number: 7, position: 'Guard', positionAr: 'لاعب خلفي', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/mourad_el_mabrouk.png', stats: { PPG: '11.2', APG: '4.1', '3P%': '42%' }, bio: 'Lethal three-pointer specialist who stretches defensive lines with highly consistent long-range shooting.', bioAr: 'قناص ثلاثيات قاتل يساهم في فك تكتل الدفاعات بفضل رمياته الدقيقة من بعيد.', height: '189 cm', weight: '84 kg', age: 36 },
  { name: 'Ater Majok', nameAr: 'أتير ماجوك', number: 13, position: 'Center', positionAr: 'لاعب ارتكاز', nationality: 'South Sudanese-Australian', nationalityAr: 'جنوب سوداني / أسترالي', image: '/ater_majok.png', stats: { RPG: '10.5', BPG: '3.1', PPG: '9.2' }, bio: 'BAL 2022 Defensive Player of the Year. An elite rim protector and rebound champion.', bioAr: 'أفضل مدافع في الدوري الإفريقي لكرة السلة 2022. حامي سلة محترف وبطل المتابعات.', height: '210 cm', weight: '105 kg', age: 38 },
  { name: 'Mehdi Cherif Ouaret', nameAr: 'مهدي شريف وارت', number: 21, position: 'Center', positionAr: 'لاعب ارتكاز', nationality: 'Algerian', nationalityAr: 'جزائري', image: '/mehdi_cherif_ouaret.png', stats: { PPG: '13.4', RPG: '9.1', FG: '58%' }, bio: 'Dominant post presence and two-way force who energises USM inside with elite efficiency.', bioAr: 'هيمنة داخلية على ملعب كرة السلة وقوة ثنائية الاتجاه تنشّط الاتحاد بكفاءة عالية.', height: '208 cm', weight: '108 kg', age: 32 },
  { name: 'Skander Ben Romdhane', nameAr: 'إسكندر بن رمضان', number: 11, position: 'Forward', positionAr: 'لاعب جناح', nationality: 'Tunisian', nationalityAr: 'تونسي', image: '/skander_ben_romdhane.png', stats: { PPG: '10.6', RPG: '5.3', STL: '1.8' }, bio: 'Versatile forward with excellent defensive instincts and ability to score from multiple positions.', bioAr: 'جناح متعدد الاستخدامات بغريزة دفاعية ممتازة وقدرة على التسجيل من مواقع متعددة.', height: '197 cm', weight: '89 kg', age: 28 },
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
