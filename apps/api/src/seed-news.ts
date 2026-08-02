/**
 * One-shot: wipe the news collection and insert real, web-researched USM
 * articles from the past season (verified against multiple independent
 * sources — La Presse de Tunisie, WebManagerCenter, African Manager,
 * Tunisie Numerique, AllAfrica, ESPN Africa and bal.nba.com — not
 * fictional/placeholder content).
 *
 * No image URLs are hotlinked here — an admin attaches real photography
 * later via the Media Library, matching the convention set in
 * seed-legends.ts/seed-stadium.ts/seed-loyalty.ts.
 *
 * Run with: MONGODB_URI="mongodb://127.0.0.1:27017/usmo" npx tsx apps/api/src/seed-news.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const newsSchema = new Schema({
  title:      { type: String, required: true },
  titleFr:    { type: String, default: '' },
  titleAr:    { type: String, default: '' },
  summary:    { type: String, default: '' },
  summaryFr:  { type: String, default: '' },
  summaryAr:  { type: String, default: '' },
  content:    { type: String, default: '' },
  contentFr:  { type: String, default: '' },
  contentAr:  { type: String, default: '' },
  image:      { type: String, default: '' },
  category:   { type: String, default: 'Club' },
  categoryAr: { type: String, default: 'النادي' },
  date:       { type: String, default: () => new Date().toISOString().slice(0, 10) },
  readTime:   { type: String, default: '3 min' },
  official:   { type: Boolean, default: false },
  author:     { type: String, default: 'USM Media' },
  published:  { type: Boolean, default: true },
  featured:   { type: Boolean, default: false },
}, { timestamps: true });

const NewsModel = model('News', newsSchema);

const articles = [
  {
    title:     'US Monastir crowned Tunisian basketball champions for the 10th time',
    titleFr:   "L'US Monastir sacrée championne de Tunisie de basketball pour la 10e fois",
    titleAr:   'الاتحاد الرياضي المنستيري بطلاً لتونس في كرة السلة للمرة العاشرة',
    summary:   'US Monastir won game 3 of the Championnat Pro A super play-off finals 78-76 away at JS Kairouan to claim a 10th Tunisian basketball title.',
    summaryFr: "L'US Monastir a remporté le match 3 des finales du super play-off du Championnat Pro A 78-76 à l'extérieur face à la JS Kairouan, décrochant un 10e titre national.",
    summaryAr: 'حسم الاتحاد الرياضي المنستيري المباراة الثالثة من نهائي السوبر بلاي أوف لبطولة تونس المحترفة أ بفوزه 78-76 خارج الديار على الجمعية الرياضية القيروانية، محرزاً اللقب العاشر في تاريخه.',
    content:   'US Monastir Basketball completed a decisive super play-off finals series against JS Kairouan to be crowned Tunisian champions for the 10th time in the club’s history. After winning the first two games at home in Mzali Hall (78-75 and 71-69), US Monastir sealed the title away at Aziz Miled Hall in Kairouan with a 78-76 win in game 3. The title adds to previous championships won in 1998, 2000, 2005, 2019, 2020, 2021, 2022, 2023 and 2024, confirming the club’s status as the dominant force in Tunisian basketball over the past decade.',
    contentFr: "L'US Monastir Basketball a conclu une série de finales de super play-off décisive face à la JS Kairouan pour être sacrée championne de Tunisie pour la 10e fois de son histoire. Après avoir remporté les deux premiers matchs à domicile à la salle Mzali (78-75 et 71-69), l'US Monastir a scellé le titre à l'extérieur, à la salle Aziz Miled de Kairouan, avec une victoire 78-76 lors du match 3. Ce titre s'ajoute aux sacres de 1998, 2000, 2005, 2019, 2020, 2021, 2022, 2023 et 2024.",
    contentAr: 'أنهى فريق كرة السلة للاتحاد الرياضي المنستيري سلسلة نهائي السوبر بلاي أوف أمام الجمعية الرياضية القيروانية بالتتويج بلقب بطولة تونس للمرة العاشرة في تاريخ النادي. وبعد الفوز في المباراتين الأولى والثانية بقاعة مزالي بالمنستير (78-75 ثم 71-69)، حسم الاتحاد اللقب خارج الديار بقاعة عزيز ميلاد بالقيروان بفوزه 78-76 في المباراة الثالثة. ويضاف هذا اللقب إلى تتويجات 1998 و2000 و2005 و2019 و2020 و2021 و2022 و2023 و2024.',
    image:     '',
    category:  'Basketball',
    categoryAr:'كرة السلة',
    date:      '2026-04-05',
    readTime:  '4 min',
    official:  true,
    author:    'USM Media',
    published: true,
    featured:  true,
  },
  {
    title:     'Coupe de Tunisie: US Monastir knock out rivals Club Africain 1-0',
    titleFr:   "Coupe de Tunisie : L'US Monastir élimine le Club Africain 1-0",
    titleAr:   'كأس تونس: الاتحاد المنستيري يقصي النادي الإفريقي بهدف دون رد',
    summary:   'US Monastir eliminated Club Africain in the round of 16 of the Tunisian Cup, winning 1-0 to advance to the next round.',
    summaryFr: "L'US Monastir a éliminé le Club Africain en 16e de finale de la Coupe de Tunisie, s'imposant 1-0 pour se qualifier pour le tour suivant.",
    summaryAr: 'أقصى الاتحاد الرياضي المنستيري النادي الإفريقي من الدور السادس عشر لكأس تونس بفوزه بهدف دون مقابل ليتأهل إلى الدور الموالي.',
    content:   'US Monastir’s football team produced one of its best results of the season by eliminating Club Africain 1-0 in the round of 16 of the Coupe de Tunisie. The result was widely covered by the Tunisian sports press as a notable upset given Club Africain’s standing in the competition. US Monastir would go on to be eliminated in the round of 8 by Espérance Sportive de Zarzis on penalties, after a 1-1 draw following extra time.',
    contentFr: "L'équipe première de l'US Monastir a signé l'un de ses meilleurs résultats de la saison en éliminant le Club Africain 1-0 en 16e de finale de la Coupe de Tunisie. Ce résultat a été largement relayé par la presse sportive tunisienne. L'US Monastir sera ensuite éliminée en quart de finale par l'Espérance Sportive de Zarzis aux tirs au but, après un match nul 1-1 à l'issue de la prolongation.",
    contentAr: 'قدّم الفريق الأول لكرة القدم بالاتحاد الرياضي المنستيري واحدة من أفضل نتائجه هذا الموسم بإقصائه النادي الإفريقي بهدف دون رد في دور الستة عشر لكأس تونس. وتناولت الصحافة الرياضية التونسية هذه النتيجة على نطاق واسع. وودّع الاتحاد المنافسة لاحقاً في دور الثمانية أمام الأمل الرياضي بجرجيس بركلات الترجيح بعد التعادل 1-1 في الوقت الأصلي والإضافي.',
    image:     '',
    category:  'Football',
    categoryAr:'كرة القدم',
    date:      '2026-03-22',
    readTime:  '3 min',
    official:  false,
    author:    'USM Sports Desk',
    published: true,
    featured:  true,
  },
  {
    title:     'Montassar Louhichi appointed new head coach of the first football team',
    titleFr:   "Montassar Louhichi nommé nouvel entraîneur de l'équipe première",
    titleAr:   'منتصر الوهايشي مدرباً جديداً للفريق الأول لكرة القدم',
    summary:   'US Monastir announced the appointment of Montassar Louhichi as head coach of the first football team, succeeding Faouzi Benzarti ahead of the 2025/26 season.',
    summaryFr: "L'US Monastir a annoncé la nomination de Montassar Louhichi comme entraîneur de l'équipe première, en remplacement de Faouzi Benzarti, avant la saison 2025/26.",
    summaryAr: 'أعلن الاتحاد الرياضي المنستيري تعيين منتصر الوهايشي مدرباً للفريق الأول خلفاً لفوزي البنزرتي، قبيل انطلاق موسم 2025/2026.',
    content:   'Union Sportive Monastirienne announced the appointment of Montassar Louhichi as head coach of the men’s first football team ahead of the 2025/26 Ligue 1 season, succeeding Faouzi Benzarti. The change was reported by several Tunisian sports outlets, including La Presse de Tunisie and Tunisie-Foot, on 4 July 2025.',
    contentFr: "L'Union Sportive Monastirienne a annoncé la nomination de Montassar Louhichi au poste d'entraîneur de l'équipe première masculine avant la saison 2025/26 de Ligue 1, en remplacement de Faouzi Benzarti. Le changement a été rapporté par plusieurs médias sportifs tunisiens, dont La Presse de Tunisie et Tunisie-Foot, le 4 juillet 2025.",
    contentAr: 'أعلن الاتحاد الرياضي المنستيري تعيين منتصر الوهايشي مدرباً للفريق الأول للرجال قبيل انطلاق موسم الرابطة المحترفة الأولى 2025/2026، خلفاً لفوزي البنزرتي. وتناولت عدة منابر رياضية تونسية هذا التغيير يوم 4 جويلية 2025.',
    image:     '',
    category:  'Football',
    categoryAr:'كرة القدم',
    date:      '2025-07-04',
    readTime:  '2 min',
    official:  true,
    author:    'Club Media Relations Office',
    published: true,
    featured:  false,
  },
  {
    title:     'Fathi Abidi named new head coach, succeeding Tarek Jarraya',
    titleFr:   "Fathi Abidi nommé nouvel entraîneur, en remplacement de Tarek Jarraya",
    titleAr:   'فتحي العبيدي مدرباً جديداً خلفاً لطارق جراية',
    summary:   'US Monastir confirmed the appointment of Fathi Abidi as head coach of the first football team, taking over from Tarek Jarraya in mid-March 2026.',
    summaryFr: "L'US Monastir a confirmé la nomination de Fathi Abidi au poste d'entraîneur de l'équipe première, succédant à Tarek Jarraya à la mi-mars 2026.",
    summaryAr: 'أكد الاتحاد الرياضي المنستيري تعيين فتحي العبيدي مدرباً للفريق الأول لكرة القدم، خلفاً لطارق جراية في منتصف مارس 2026.',
    content:   'Union Sportive Monastirienne confirmed a further change on the technical bench during the 2025/26 season, appointing Fathi Abidi as head coach of the first football team in place of Tarek Jarraya, whose spell in charge ended in March 2026. The appointment was reported by Tunisie Numerique.',
    contentFr: "L'Union Sportive Monastirienne a confirmé un nouveau changement sur le banc technique au cours de la saison 2025/26, en nommant Fathi Abidi entraîneur de l'équipe première à la place de Tarek Jarraya, dont le passage à la tête de l'équipe a pris fin en mars 2026. La nomination a été rapportée par Tunisie Numérique.",
    contentAr: 'أكد الاتحاد الرياضي المنستيري تغييراً جديداً على مستوى الجهاز الفني خلال موسم 2025/2026، بتعيين فتحي العبيدي مدرباً للفريق الأول خلفاً لطارق جراية الذي انتهت مهمته في مارس 2026. وتناولت جريدة تونس الرقمية هذا التعيين.',
    image:     '',
    category:  'Football',
    categoryAr:'كرة القدم',
    date:      '2026-03-14',
    readTime:  '2 min',
    official:  true,
    author:    'Club Media Relations Office',
    published: true,
    featured:  false,
  },
  {
    title:     'US Monastir Basketball defeats Nigeria’s Rivers Hoopers 89-81 in the BAL',
    titleFr:   "Basketball Africa League : l'US Monastir bat les Rivers Hoopers du Nigeria 89-81",
    titleAr:   'دوري أبطال أفريقيا لكرة السلة: الاتحاد المنستيري يتغلب على ريفرز هوبرز النيجيري 89-81',
    summary:   'US Monastir defeated Nigeria’s Rivers Hoopers 89-81 in the 2025 Basketball Africa League season at the SunBet Arena in Pretoria, South Africa.',
    summaryFr: "L'US Monastir a battu les Rivers Hoopers du Nigeria 89-81 lors de la saison 2025 de la Basketball Africa League, à la SunBet Arena de Pretoria, en Afrique du Sud.",
    summaryAr: 'تغلب الاتحاد الرياضي المنستيري على فريق ريفرز هوبرز النيجيري 89-81 ضمن موسم 2025 من دوري أبطال أفريقيا لكرة السلة (BAL) في قاعة صن بت أرينا ببريتوريا، جنوب أفريقيا.',
    content:   'US Monastir Basketball, a former BAL champion (2022), defeated Nigeria’s Rivers Hoopers 89-81 in a 2025 Basketball Africa League fixture played at the SunBet Arena in Pretoria, South Africa, on 7 June 2025. The result was covered by BAL’s official website (bal.nba.com) as well as Nigerian sports outlets following Rivers Hoopers’ campaign.',
    contentFr: "L'US Monastir Basketball, ancien champion de la BAL (2022), a battu les Rivers Hoopers du Nigeria 89-81 lors d'une rencontre de la saison 2025 de la Basketball Africa League disputée à la SunBet Arena de Pretoria, en Afrique du Sud, le 7 juin 2025. Le résultat a été relayé par le site officiel de la BAL (bal.nba.com) ainsi que par des médias sportifs nigérians.",
    contentAr: 'تغلب فريق كرة السلة للاتحاد الرياضي المنستيري، البطل السابق لدوري أبطال أفريقيا (2022)، على فريق ريفرز هوبرز النيجيري 89-81 ضمن مباريات موسم 2025 من دوري أبطال أفريقيا لكرة السلة، وذلك في قاعة صن بت أرينا ببريتوريا بجنوب أفريقيا يوم 7 جوان 2025. وتناول الموقع الرسمي للدوري (bal.nba.com) هذه النتيجة إلى جانب منابر رياضية نيجيرية.',
    image:     '',
    category:  'Basketball',
    categoryAr:'كرة السلة',
    date:      '2025-06-07',
    readTime:  '3 min',
    official:  false,
    author:    'USM Basketball Editor',
    published: true,
    featured:  false,
  },
  {
    title:     'US Monastir reach the Tunisian Basketball Cup final, fall to Club Africain',
    titleFr:   "Coupe de Tunisie de basketball : l'US Monastir en finale, battue par le Club Africain",
    titleAr:   'كأس تونس لكرة السلة: الاتحاد المنستيري يبلغ النهائي ويخسر أمام النادي الإفريقي',
    summary:   'US Monastir reached the 2025/26 Tunisian Basketball Cup final after beating JS Kairouan 75-50 in the semi-final, before losing the final 67-50 to Club Africain.',
    summaryFr: "L'US Monastir a atteint la finale de la Coupe de Tunisie de basketball 2025/26 après avoir battu la JS Kairouan 75-50 en demi-finale, avant de s'incliner 67-50 en finale face au Club Africain.",
    summaryAr: 'بلغ الاتحاد الرياضي المنستيري نهائي كأس تونس لكرة السلة لموسم 2025/2026 بعد فوزه على الجمعية الرياضية القيروانية 75-50 في نصف النهائي، قبل أن يخسر النهائي 67-50 أمام النادي الإفريقي.',
    content:   'US Monastir Basketball reached the final of the 2025/26 Tunisian Basketball Cup after defeating JS Kairouan 75-50 in the semi-final. In the final, played on 9 May 2026 at the Radès multi-purpose hall, Club Africain won the trophy for the 8th time in its history with a 67-50 victory over US Monastir, extending its cup honours after previous titles in 1982, 1999, 2001, 2003, 2014, 2015 and 2024.',
    contentFr: "L'US Monastir Basketball a atteint la finale de la Coupe de Tunisie de basketball 2025/26 après avoir battu la JS Kairouan 75-50 en demi-finale. En finale, disputée le 9 mai 2026 à la salle omnisports de Radès, le Club Africain a remporté le trophée pour la 8e fois de son histoire en s'imposant 67-50 face à l'US Monastir.",
    contentAr: 'بلغ فريق كرة السلة للاتحاد الرياضي المنستيري نهائي كأس تونس لموسم 2025/2026 بعد تغلبه على الجمعية الرياضية القيروانية 75-50 في نصف النهائي. وفي النهائي الذي أُقيم يوم 9 ماي 2026 بالقاعة المتعددة الرياضات برادس، أحرز النادي الإفريقي اللقب للمرة الثامنة في تاريخه بفوزه 67-50 على الاتحاد الرياضي المنستيري.',
    image:     '',
    category:  'Basketball',
    categoryAr:'كرة السلة',
    date:      '2026-05-09',
    readTime:  '3 min',
    official:  false,
    author:    'USM Basketball Editor',
    published: true,
    featured:  false,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('[seed-news] Connected to MongoDB');

  const deleted = await NewsModel.deleteMany({});
  console.log(`[seed-news] Cleared ${deleted.deletedCount} existing articles`);

  const inserted = await NewsModel.insertMany(articles);
  console.log(`[seed-news] Inserted ${inserted.length} real USM articles:`);
  inserted.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));

  await mongoose.disconnect();
  console.log('[seed-news] Done ✅');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
