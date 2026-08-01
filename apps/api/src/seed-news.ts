/**
 * One-shot: wipe news collection and insert 5 curated USM articles.
 * Run with: npx tsx apps/api/src/seed-news.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Schema, model, Document } from 'mongoose';

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
  image:      { type: String, required: true },
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
    title:     'USM Monastir crowned champions of Tunisia for the 4th consecutive season',
    titleFr:   "L'USM Monastir sacré champion de Tunisie pour la 4e saison consécutive",
    titleAr:   'الاتحاد الرياضي المنستيري يتوّج بلقب البطولة التونسية للمرة الرابعة على التوالي',
    summary:   'Union Sportive Monastirienne clinched the Tunisian Ligue 1 title once again, capping a dominant season under head coach Khaled Ben Yahia.',
    summaryFr: "L'USM Monastir a remporté le titre de la Ligue 1 tunisienne pour la 4e fois consécutive, couronnant une saison dominante sous la direction de Khaled Ben Yahia.",
    summaryAr: 'حقق الاتحاد الرياضي المنستيري لقب الرابطة المحترفة الأولى للمرة الرابعة توالياً، في موسم استثنائي بقيادة المدرب خالد بن يحيى.',
    content:   'Union Sportive Monastirienne completed an historic quadruple title run in Tunisian football by securing the Ligue 1 Professionnelle championship. The decisive win against Espérance Sportive de Tunis at the Mustapha Ben Jannet Stadium brought thousands of supporters into the streets of Monastir in a night of pure joy. Key performers this season included Moses Orkuma, Adem Alimi, and goalkeeper Sadok Yeddes, whose consistency proved decisive. Club president Zouhaier Jaziri praised the entire technical staff and called this victory "the greatest in the club\'s modern history."',
    contentFr: "L'Union Sportive Monastirienne a complété un quadruplé historique en football tunisien en s'adjugeant le titre de la Ligue 1 Professionnelle. La victoire décisive face à l'Espérance Sportive de Tunis au stade Mustapha Ben Jannet a fait descendre des milliers de supporters dans les rues de Monastir. Moses Orkuma, Adem Alimi et le gardien Sadok Yeddes ont brillé tout au long de la saison.",
    contentAr: 'أتم الاتحاد الرياضي المنستيري رباعية تاريخية في الكرة التونسية بفوزه بلقب الرابطة المحترفة الأولى. جاءت الفوزة الحاسمة على الترجي الرياضي التونسي في ملعب مصطفى بن جنات لتُفجّر فرحة جماهيرية عارمة في شوارع المنستير. برز في هذا الموسم موسى أوركوما، وآدم العلمي، والحارس صدوق يدّاس.',
    image:     'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    category:  'Football',
    categoryAr:'كرة القدم',
    date:      '2026-07-10',
    readTime:  '5 min',
    official:  true,
    author:    'Club Media Relations Office',
    published: true,
    featured:  true,
  },
  {
    title:     'Moses Orkuma: Man of the Match and top scorer of the season with 22 goals',
    titleFr:   'Moses Orkuma : Homme du match et meilleur buteur de la saison avec 22 buts',
    titleAr:   'موسى أوركوما: رجل المباراة وهداف الموسم بـ 22 هدفاً',
    summary:   'Nigerian striker Moses Orkuma delivered another world-class performance to seal USM\'s title win, finishing as the league\'s top scorer.',
    summaryFr: "L'attaquant nigérian Moses Orkuma a livré une nouvelle performance de classe mondiale pour sceller le titre de l'USM, terminant meilleur buteur du championnat.",
    summaryAr: 'قدّم المهاجم النيجيري موسى أوركوما أداءً استثنائياً آخر لإحكام قبضة الاتحاد على اللقب، وتوّج هداف الدوري في الموسم.',
    content:   'Moses Orkuma has been the defining player of USM Monastir\'s title-winning campaign. The 26-year-old Nigerian striker scored 22 goals and provided 9 assists across all competitions, a tally that places him among the elite strikers in African club football. "I am grateful to the club, the fans, and my teammates who make every goal possible," said Orkuma in his post-match interview. He is now being linked with several European clubs, though USM officials are confident of retaining their star.',
    contentFr: "Moses Orkuma a été le joueur emblématique de la campagne championne de l'USM Monastir. L'attaquant nigérian de 26 ans a inscrit 22 buts et délivré 9 passes décisives toutes compétitions confondues. « Je suis reconnaissant envers le club, les fans et mes coéquipiers », a déclaré Orkuma en interview d'après-match.",
    contentAr: 'كان موسى أوركوما اللاعب المحوري في مسيرة الاتحاد الرياضي المنستيري نحو اللقب. سجل المهاجم النيجيري البالغ 26 عاماً 22 هدفاً وصنع 9 أخرى في مختلف المسابقات. قال أوركوما في تصريح بعد المباراة: "أنا ممتن للنادي والجماهير وزملائي الذين يجعلون كل هدف ممكناً."',
    image:     'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=1200&q=80',
    category:  'Football',
    categoryAr:'كرة القدم',
    date:      '2026-07-08',
    readTime:  '4 min',
    official:  false,
    author:    'USM Sports Desk',
    published: true,
    featured:  true,
  },
  {
    title:     'USM Basketball beats Club Africain 87-72 to reach the national PlayOff finals',
    titleFr:   "Le basket USM bat le Club Africain 87-72 et rejoint les finales nationales des PlayOffs",
    titleAr:   'كرة سلة الاتحاد تتخطى النادي الإفريقي 87-72 وتبلغ نهائي بطولة التتويج',
    summary:   'A dominant display from Radhouane Slimane and Khalil Ben Abdallah sends USM Basketball into the national PlayOff finals for the sixth year running.',
    summaryFr: "Une performance dominante de Radhouane Slimane et Khalil Ben Abdallah envoie l'USM basket en finale nationale des PlayOffs pour la sixième année consécutive.",
    summaryAr: 'أداء مسيطر من رضوان سليمان وخليل بن عبد الله يقود كرة سلة الاتحاد إلى نهائي البطولة الوطنية للمرة السادسة توالياً.',
    content:   'USM Monastir Basketball delivered a commanding playoff semifinal victory over Club Africain, 87 to 72, at the Salle Omnisports of Monastir. Club legend Radhouane Slimane top-scored with 23 points while young star Khalil Ben Abdallah added 18. The team now faces Étoile Sportive du Sahel in what promises to be an epic national final. Head coach Miodrag Perisic praised his squad\'s defensive intensity, noting that "this team has the hunger and the talent to win it all again."',
    contentFr: "L'USM Monastir Basketball a livré une victoire autoritaire en demi-finale des playoffs face au Club Africain, 87 à 72, à la salle omnisports de Monastir. La légende du club Radhouane Slimane a été le meilleur marqueur avec 23 points, tandis que le jeune espoir Khalil Ben Abdallah en ajoutait 18.",
    contentAr: 'قدّم فريق كرة السلة للاتحاد الرياضي المنستيري عرضاً مسيطراً في نصف نهائي بطولة التتويج على حساب النادي الإفريقي 87-72 بقاعة الألعاب المتعددة بالمنستير. تصدّر رضوان سليمان قائمة المسجلين بـ 23 نقطة، وأضاف خليل بن عبد الله 18 نقطة.',
    image:     'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    category:  'Basketball',
    categoryAr:'كرة السلة',
    date:      '2026-07-06',
    readTime:  '3 min',
    official:  false,
    author:    'USM Basketball Editor',
    published: true,
    featured:  false,
  },
  {
    title:     'USM Academy: 12 youth players called up to Tunisian national age-group teams',
    titleFr:   "Académie USM : 12 jeunes joueurs convoqués dans les équipes nationales tunisiennes des jeunes",
    titleAr:   'أكاديمية الاتحاد: 12 لاعباً شاباً في تشكيلات المنتخبات التونسية للفئات السنية',
    summary:   'The USM Academy continues to prove it is the premier youth development institution in Tunisian sport, with 12 players earning national call-ups across U15, U17, and U20 levels.',
    summaryFr: "L'académie USM confirme son statut de premier centre de formation du sport tunisien avec 12 joueurs convoqués dans les sélections nationales des U15, U17 et U20.",
    summaryAr: 'تواصل أكاديمية الاتحاد الرياضي المنستيري إثبات ريادتها في التكوين الرياضي التونسي، إذ نالت 12 موهبة شابة استدعاءات في المنتخبات الوطنية لفئات الأواسط والأشبال والشبان.',
    content:   'The USM Academy proudly announces that 12 of its players have received call-ups to Tunisian national youth teams for the upcoming CAF Youth Championship qualifiers. Players span three age groups: U15, U17, and U20. Academy director Sami Karoui said: "This is the result of years of hard work by our coaching staff and the dedication of these young athletes. We are building the Tunisian national team of tomorrow, right here in Monastir." The club has invested heavily in state-of-the-art training facilities and sports science support since 2022.',
    contentFr: "L'académie USM annonce fièrement que 12 de ses joueurs ont reçu des convocations dans les équipes nationales tunisiennes des jeunes pour les prochaines qualifications du championnat des jeunes de la CAF. Le directeur de l'académie, Sami Karoui, a déclaré : « C'est le résultat d'années de travail acharné de notre staff technique. »",
    contentAr: 'تُعلن أكاديمية الاتحاد الرياضي المنستيري بفخر عن استدعاء 12 من لاعبيها في المنتخبات التونسية الشبانية استعداداً للتصفيات المؤهلة لبطولة الشباب الأفريقية. قال مدير الأكاديمية سامي قروي: "هذا ثمرة سنوات من العمل المتواصل لطاقمنا التقني ومثابرة هؤلاء الشباب الموهوبين."',
    image:     'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    category:  'Academy',
    categoryAr:'الأكاديمية',
    date:      '2026-07-04',
    readTime:  '4 min',
    official:  true,
    author:    'USM Academy Director Office',
    published: true,
    featured:  false,
  },
  {
    title:     'Club Official Statement: New 3-year partnership with Ooredoo Tunisia signed',
    titleFr:   'Communiqué officiel du club : Nouveau partenariat de 3 ans signé avec Ooredoo Tunisie',
    titleAr:   'بيان رسمي للنادي: توقيع شراكة جديدة لثلاث سنوات مع أوريدو تونس',
    summary:   'USM Monastir and Ooredoo Tunisia have signed an extended three-year partnership agreement, reinforcing digital fan experiences, stadium connectivity, and academy support.',
    summaryFr: "L'USM Monastir et Ooredoo Tunisie ont signé un accord de partenariat étendu de trois ans, renforçant les expériences fans numériques, la connectivité du stade et le soutien à l'académie.",
    summaryAr: 'وقّع الاتحاد الرياضي المنستيري وأوريدو تونس اتفاقية شراكة ممتدة لثلاثة مواسم، تعزيزاً للتجربة الرقمية لجمهور النادي والتغطية الشبكية بالملعب ودعم الأكاديمية.',
    content:   'Union Sportive Monastirienne is pleased to announce the signing of a renewed and expanded three-year partnership agreement with Ooredoo Tunisia, a global telecommunications leader. Under the agreement, Ooredoo will serve as an Official Platinum Sponsor of the club across all sporting disciplines — football, basketball, and the youth academy. Key deliverables include 5G stadium connectivity at the Mustapha Ben Jannet Arena, a dedicated USM Fan App powered by Ooredoo networks, live match streaming packages for international supporters, and scholarship funding for 20 Academy athletes annually. Club President Zouhaier Jaziri stated: "Ooredoo is more than a sponsor — they are a genuine strategic partner who shares our vision of making USM a digital-first sports institution in Africa."',
    contentFr: "L'Union Sportive Monastirienne est heureuse d'annoncer la signature d'un accord de partenariat renouvelé et élargi de trois ans avec Ooredoo Tunisie. Dans le cadre de cet accord, Ooredoo sera Sponsor Platine Officiel du club dans toutes les disciplines sportives. Les points clés comprennent la connectivité 5G au stade Mustapha Ben Jannet, une application Fan USM dédiée, et le financement de bourses pour 20 athlètes de l'académie par an.",
    contentAr: 'يسعد الاتحاد الرياضي المنستيري الإعلان عن توقيع اتفاقية شراكة متجددة وموسّعة لثلاثة مواسم مع أوريدو تونس. بموجب هذه الاتفاقية، تكون أوريدو الراعي البلاتيني الرسمي للنادي في جميع الرياضات. وتشمل الشراكة تغطية 5G في ملعب مصطفى بن جنات، وإطلاق تطبيق مشجعي الاتحاد، وتمويل منح دراسية لـ 20 رياضياً من الأكاديمية سنوياً.',
    image:     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80',
    category:  'Announcements',
    categoryAr:'بلاغات رسمية',
    date:      '2026-07-01',
    readTime:  '5 min',
    official:  true,
    author:    'Presidential Press Office',
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
  console.log(`[seed-news] Inserted ${inserted.length} USM articles:`);
  inserted.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));

  await mongoose.disconnect();
  console.log('[seed-news] Done ✅');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
