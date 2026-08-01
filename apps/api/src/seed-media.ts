import 'dotenv/config';
import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const mediaItemSchema = new Schema({
  title: { type: String, required: true },
  titleFr: { type: String },
  titleAr: { type: String },
  description: { type: String, required: true },
  descriptionFr: { type: String },
  descriptionAr: { type: String },
  type: { type: String, required: true, enum: ['album', 'video'], index: true },
  accessLevel: { type: String, required: true, enum: ['public', 'fan', 'premium'], default: 'public', index: true },
  coverImage: { type: String, required: true },
  videoUrl: { type: String },
  teaserUrl: { type: String },
  photos: { type: [String], default: [] },
  teaserPhotos: { type: [String], default: [] },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

const MediaModel = model('MediaItem', mediaItemSchema, 'mediaitems');

const mediaData = [
  {
    title: 'USM vs ES Tunis',
    titleFr: 'USM vs ES Tunis',
    titleAr: 'الاتحاد ضد الترجي الرياضي',
    description: 'Relive the high-intensity Tunisian Ligue 1 derby match at Ben Jannet. Highlights of the goals, saves, and fans choreography.',
    descriptionFr: 'Revivez le derby palpitant de la Ligue 1 tunisienne au stade Ben Jannet. Retours en images sur les buts, arrêts et tifo.',
    descriptionAr: 'أبرز لقطات دربي الرابطة المحترفة الأولى المثير ضد الترجي في ملعب مصطفى بن جنات. احتفالات الأهداف وتيفو الجماهير.',
    type: 'album',
    accessLevel: 'public',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1489985548304-9b8192760145?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80'
    ],
    teaserPhotos: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'
    ],
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Entraînement équipe première',
    titleFr: 'Entraînement équipe première',
    titleAr: 'تمارين الفريق الأول',
    description: 'First team tactical and athletic training sessions ahead of the upcoming league fixtures.',
    descriptionFr: 'Séance d’entraînement tactique et physique de l’équipe première avant les prochaines rencontres.',
    descriptionAr: 'حصة تدريبية تكتيكية وبدنية للفريق الأول استعداداً للمباريات القادمة.',
    type: 'album',
    accessLevel: 'fan',
    coverImage: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80',
    photos: [
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80'
    ],
    teaserPhotos: [
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80'
    ],
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'Coulisses matchday (Vestiaires)',
    titleFr: 'Coulisses matchday (Vestiaires)',
    titleAr: 'كواليس يوم المباراة (حجرات الملابس)',
    description: 'Behind the scenes locker room setup, player arrivals, and intimate pre-match moments.',
    descriptionFr: 'Dans les coulisses du vestiaire, arrivée des joueurs et moments intimes avant match.',
    descriptionAr: 'تحت غطاء الكواليس: تحضيرات حجرة الملابس، وصول اللاعبين واللحظات الخاصة قبل انطلاق اللقاء.',
    type: 'album',
    accessLevel: 'premium',
    coverImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
    photos: [
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80'
    ],
    teaserPhotos: [
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80'
    ],
    displayOrder: 3,
    isActive: true
  },
  {
    title: 'Résumé du match: USM vs ES Tunis',
    titleFr: 'Résumé du match: USM vs ES Tunis',
    titleAr: 'ملخص المباراة: الاتحاد ضد الترجي الرياضي',
    description: 'Watch all goals and highlights of the Ligue Professionnelle 1 derby between Union Sportive Monastirienne and Espérance Sportive de Tunis at Mustapha Ben Jannet Stadium.',
    descriptionFr: 'Regardez tous les buts et actions marquantes du derby de Ligue Professionnelle 1 opposant l’Union Sportive Monastirienne à l’Espérance Sportive de Tunis.',
    descriptionAr: 'شاهد أهداف ولقطات مباراة دربي الرابطة المحترفة الأولى لكرة القدم بين الاتحاد الرياضي المنستيري والترجي الرياضي التونسي في ملعب بن جنات.',
    type: 'video',
    accessLevel: 'public',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    teaserUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    displayOrder: 4,
    isActive: true
  },
  {
    title: 'Conférence de presse après-match: Coach Lassaad Chabbi',
    titleFr: 'Conférence de presse après-match: Coach Lassaad Chabbi',
    titleAr: 'المؤتمر الصحفي بعد اللقاء: تصريح المدرب لسعد الشابي',
    description: 'Post-match press room briefings and declarations from Football head coach Lassaad Chabbi commenting on tactical discipline.',
    descriptionFr: 'Déclarations et analyses du vestiaire de l’entraîneur Lassaad Chabbi après la rencontre décisive face à l’EST.',
    descriptionAr: 'المؤتمر الصحفي للمدرب لسعد الشابي بعد نهاية اللقاء للحديث عن الانضباط التكتيكي والأداء البطولي للاعبي الاتحاد.',
    type: 'video',
    accessLevel: 'fan',
    coverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    teaserUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    displayOrder: 5,
    isActive: true
  },
  {
    title: 'Inside Matchday: Dans les coulisses du vestiaire',
    titleFr: 'Inside Matchday: Dans les coulisses du vestiaire',
    titleAr: 'كواليس يوم المباراة: داخل حجرات الملابس',
    description: 'Step inside the locker room, feel the pre-match tension, and live the emotional final speech of the captain before entering Mustapha Ben Jannet turf.',
    descriptionFr: 'Pénétrez dans les vestiaires, ressentez la tension d’avant-match et vivez le discours final du capitaine.',
    descriptionAr: 'خطوة داخل كواليس حجرة الملابس: استمع لخطاب القائد الحماسي قبل الدخول إلى أرضية ملعب مصطفى بن جنات.',
    type: 'video',
    accessLevel: 'premium',
    coverImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    teaserUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    displayOrder: 6,
    isActive: true
  }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[seed-media] Connected to MongoDB');

  const deleted = await MediaModel.deleteMany({});
  console.log(`[seed-media] Cleared ${deleted.deletedCount} existing media items`);

  const inserted = await MediaModel.insertMany(mediaData);
  console.log(`[seed-media] Inserted ${inserted.length} media items successfully`);
  inserted.forEach((m, i) => console.log(`  ${i + 1}. ${m.title} (${m.type} - ${m.accessLevel})`));

  await mongoose.disconnect();
  console.log('[seed-media] Done ✅');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
