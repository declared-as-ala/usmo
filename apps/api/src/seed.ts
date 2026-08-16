import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './modules/users/user.schema';
import { Category } from './modules/categories/category.schema';
import { Collection } from './modules/collections/collection.schema';
import { Product } from './modules/products/product.schema';
import { DeliveryZone } from './modules/cart/delivery-zone.schema';
import { PickupPoint } from './modules/cart/pickup-point.schema';
import { Sponsor } from './modules/sponsors/sponsor.schema';
import { News } from './modules/news/news.schema';
import { StorageService } from './modules/storage/storage.service';

async function bootstrap() {
  console.log('[USM SEEDER] Starting comprehensive database seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const categoryModel = app.get<Model<Category>>('CategoryModel');
  const collectionModel = app.get<Model<Collection>>('CollectionModel');
  const productModel = app.get<Model<Product>>('ProductModel');
  const deliveryZoneModel = app.get<Model<DeliveryZone>>('DeliveryZoneModel');
  const pickupPointModel = app.get<Model<PickupPoint>>('PickupPointModel');
  const sponsorModel = app.get<Model<Sponsor>>('SponsorModel');
  const newsModel = app.get<Model<News>>('NewsModel');
  const storageService = app.get(StorageService);

  // 1. Seed Super Admin
  const adminEmail = 'admin@usmonastir.com.tn';
  const existingAdmin = await usersService.findOneByEmail(adminEmail);
  if (!existingAdmin) {
    console.log(`[USM SEEDER] Creating default Super Admin account (${adminEmail})...`);
    await usersService.create({
      name: 'Super Admin',
      email: adminEmail,
      password: 'adminpassword123',
      role: 'SUPER_ADMIN',
      customPermissions: ['*'],
      status: 'Active',
    });
    console.log('[USM SEEDER] Super Admin account created successfully.');
  } else {
    existingAdmin.role = 'SUPER_ADMIN';
    existingAdmin.customPermissions = ['*'];
    await existingAdmin.save();
    console.log('[USM SEEDER] Super Admin account updated.');
  }

  // 2. Seed Categories (upsert — never delete existing ones)
  console.log('[USM SEEDER] Seeding categories...');
  const categories = [
    { name: 'Jerseys', nameFr: 'Maillots', nameAr: 'قمصان', slug: 'jerseys', icon: '👕', displayOrder: 1, active: true },
    { name: 'Hoodies', nameFr: 'Sweats', nameAr: 'سترات', slug: 'hoodies', icon: '🧥', displayOrder: 2, active: true },
    { name: 'Caps', nameFr: 'Casquettes', nameAr: 'قبعات', slug: 'caps', icon: '🧢', displayOrder: 3, active: true },
    { name: 'Accessories', nameFr: 'Accessoires', nameAr: 'إكسسوارات', slug: 'accessories', icon: '🎒', displayOrder: 4, active: true },
  ];
  for (const cat of categories) {
    await categoryModel.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  console.log(`[USM SEEDER] Upserted ${categories.length} categories.`);

  // 3. Seed Collections (upsert — never delete existing ones)
  console.log('[USM SEEDER] Seeding collections...');
  const collections = [
    { name: 'Football', nameFr: 'Collection Foot', nameAr: 'تشكيلة كرة القدم', slug: 'football', displayOrder: 1, active: true },
    { name: 'Basketball', nameFr: 'Collection Basket', nameAr: 'تشكيلة كرة السلة', slug: 'basketball', displayOrder: 2, active: true },
    { name: 'Matchday', nameFr: 'Jour de Match', nameAr: 'يوم المباراة', slug: 'matchday', displayOrder: 3, active: true },
    { name: 'Limited Edition', nameFr: 'Édition Limitée', nameAr: 'إصدار محدود', slug: 'limited', displayOrder: 4, active: true },
    { name: 'Kids', nameFr: 'Enfants', nameAr: 'أطفال', slug: 'kids', displayOrder: 5, active: true },
  ];
  for (const col of collections) {
    await collectionModel.findOneAndUpdate({ slug: col.slug }, col, { upsert: true, new: true });
  }
  console.log(`[USM SEEDER] Upserted ${collections.length} collections.`);

  // 4. Seed Products
  console.log('[USM SEEDER] Seeding products...');
  const uploadSeedProductImage = async (filename: string, altText: string) => {
    const buffer = await readFile(path.resolve(__dirname, '../seed-assets/products', filename));
    const media = await storageService.uploadFile(
      buffer,
      filename,
      'image/png',
      'products/seed',
      undefined,
      { altText, tags: ['seed', 'boutique', 'usm'] },
    );
    return media.largeUrl || media.url;
  };
  const [jerseyImage, hoodieImage, scarfImage] = await Promise.all([
    uploadSeedProductImage('usm-home-jersey.png', 'Maillot domicile officiel bleu US Monastir'),
    uploadSeedProductImage('usm-bal-hoodie.png', 'Sweat bleu marine hommage aux champions US Monastir'),
    uploadSeedProductImage('usm-supporter-scarf.png', 'Écharpe supporter bleue, blanche et dorée US Monastir'),
  ]);
  await productModel.deleteMany({});
  const products = [
    {
      name: 'US Monastir Official Home Jersey 2025/26',
      nameFr: 'Maillot Domicile Officiel US Monastir 2025/26',
      nameAr: 'قميص الاتحاد المنستيري الرسمي الأساسي 2025/26',
      slug: 'usm-official-home-jersey-2025-26',
      sku: 'USM-FB-HM-2526',
      description: 'High-performance official home kit, featuring royal blue colorways and advanced aeroready tech.',
      descriptionFr: 'Maillot domicile officiel haute performance, coloris bleu royal et technologie Aeroready avancée.',
      descriptionAr: 'القميص الرسمي الأساسي عالي الأداء باللون الأزرق الملكي وشعار النادي الفاخر بتقنية التهوية الفائقة.',
      coverImage: jerseyImage,
      images: [jerseyImage],
      price: 85000, // 85 TND in millimes
      category: 'jerseys',
      collections: ['football'],
      sport: 'football',
      season: '2025/26',
      badges: ['bestseller', 'official'],
      tags: ['Home', 'Blue', 'Jersey', '2025', '2026'],
      status: 'published',
      isFeatured: true,
      lowStockThreshold: 10,
      variants: [
        { id: 'p1-v1', sku: 'USM-FB-HM-2526-S', size: 'S', color: 'Bleu', colorHex: '#0D63FF', stock: 15 },
        { id: 'p1-v2', sku: 'USM-FB-HM-2526-M', size: 'M', color: 'Bleu', colorHex: '#0D63FF', stock: 25 },
        { id: 'p1-v3', sku: 'USM-FB-HM-2526-L', size: 'L', color: 'Bleu', colorHex: '#0D63FF', stock: 35 },
        { id: 'p1-v4', sku: 'USM-FB-HM-2526-XL', size: 'XL', color: 'Bleu', colorHex: '#0D63FF', stock: 10 }
      ]
    },
    {
      name: 'US Monastir BAL Champions Tribute Hoodie',
      nameFr: 'Sweat Hommage aux Champions BAL US Monastir',
      nameAr: 'سترة تكريم أبطال إفريقيا لكرة السلة 2022',
      slug: 'usm-bal-champions-tribute-hoodie',
      sku: 'USM-BB-BAL-HD',
      description: 'Premium limited edition hoodie celebrating our historic 2022 BAL championship victory in Kigali.',
      descriptionFr: 'Sweat premium en édition limitée célébrant notre victoire historique au championnat BAL 2022 à Kigali.',
      descriptionAr: 'سترة قطنية مريحة بإصدار محدود تحتفي بالفوز التاريخي باللقب الأفريقي لكرة السلة في كيجالي 2022.',
      coverImage: hoodieImage,
      images: [hoodieImage],
      price: 110000, // 110 TND in millimes
      oldPrice: 139000,
      category: 'hoodies',
      collections: ['limited', 'basketball'],
      sport: 'basketball',
      season: '2025/26',
      badges: ['limited', 'lowStock'],
      tags: ['BAL', 'Kigali', 'Champions', 'Hoodie'],
      status: 'published',
      isFeatured: true,
      lowStockThreshold: 5,
      variants: [
        { id: 'p2-v1', sku: 'USM-BB-BAL-HD-M', size: 'M', color: 'Bleu Marine', colorHex: '#06152B', stock: 3 },
        { id: 'p2-v2', sku: 'USM-BB-BAL-HD-L', size: 'L', color: 'Bleu Marine', colorHex: '#06152B', stock: 5 }
      ]
    },
    {
      name: 'USM Official Ultras Supporter Scarf',
      nameFr: 'Écharpe Officielle des Ultras USM',
      nameAr: 'وشاح مشجعي الاتحاد المنستيري الرسمي',
      slug: 'usm-official-ultras-supporter-scarf',
      sku: 'USM-ACC-SCF',
      description: 'Vibrant woven supporter scarf featuring "One City, One Heart, One Club" motto.',
      descriptionFr: 'Écharpe tissée aux couleurs du club, ornée de la devise « Une Ville, Un Cœur, Un Club ».',
      descriptionAr: 'وشاح منسوج عالي الجودة للمشجعين يحمل شعار "مدينة واحدة، قلب واحد، نادي واحد".',
      coverImage: scarfImage,
      images: [scarfImage],
      price: 30000,
      category: 'accessories',
      collections: ['matchday'],
      sport: 'club',
      season: '2025/26',
      badges: ['bestseller'],
      tags: ['Scarf', 'Ultras', 'Matchday'],
      status: 'published',
      isFeatured: false,
      lowStockThreshold: 10,
      variants: [
        { id: 'p3-v1', sku: 'USM-ACC-SCF-OS', size: 'Unique', color: 'Bleu', colorHex: '#0D63FF', stock: 120 }
      ]
    }
  ];
  await productModel.insertMany(products);
  console.log(`[USM SEEDER] Seeded ${products.length} products with variants.`);

  // 5. Seed Delivery Zones
  console.log('[USM SEEDER] Seeding delivery zones...');
  await deliveryZoneModel.deleteMany({});
  const zones = [
    { name: 'Monastir Ville', nameFr: 'Monastir Ville', nameAr: 'المنستير المدينة', price: 4000, active: true },
    { name: 'Sahel Region (Sousse, Mahdia)', nameFr: 'Région du Sahel (Sousse, Mahdia)', nameAr: 'جهة الساحل (سوسة، المهدية)', price: 6000, active: true },
    { name: 'Grand Tunis', nameFr: 'Grand Tunis', nameAr: 'تونس الكبرى', price: 7000, active: true },
    { name: 'Sfax / Center', nameFr: 'Sfax / Centre', nameAr: 'صفاقس / الوسط', price: 8000, active: true },
    { name: 'North & West Governorates', nameFr: 'Gouvernorats du Nord & Ouest', nameAr: 'ولايات الشمال والغرب', price: 9000, active: true },
    { name: 'South Governorates', nameFr: 'Gouvernorats du Sud', nameAr: 'ولايات الجنوب', price: 10000, active: true },
  ];
  await deliveryZoneModel.insertMany(zones);
  console.log(`[USM SEEDER] Seeded ${zones.length} delivery zones.`);

  // 6. Seed Pickup Points
  console.log('[USM SEEDER] Seeding pickup points...');
  await pickupPointModel.deleteMany({});
  const points = [
    {
      name: 'Megastore Ben Jannet (Stade)',
      nameFr: 'Mégastore Ben Jannet (Stade)',
      nameAr: 'ميغاستور بن جنات (الملعب)',
      address: 'Mustapha Ben Jannet Stadium Complex, Avenue Ibn El Jazzar, Monastir 5000',
      addressFr: 'Complexe du Stade Mustapha Ben Jannet, Avenue Ibn El Jazzar, Monastir 5000',
      addressAr: 'مركب ملعب مصطفى بن جنات، شارع ابن الجزار، المنستير 5000',
      active: true,
    },
    {
      name: 'Boutique Officielle Centre-Ville',
      nameFr: 'Boutique Officielle Centre-Ville',
      nameAr: 'المغازة الرسمية وسط المدينة',
      address: 'Avenue Habib Bourguiba, Monastir 5000',
      addressFr: 'Avenue Habib Bourguiba, Monastir 5000',
      addressAr: 'شارع الحبيب بورقيبة، المنستير 5000',
      active: true,
    },
  ];
  await pickupPointModel.insertMany(points);
  console.log(`[USM SEEDER] Seeded ${points.length} pickup points.`);

  // 7. Seed Sponsors
  console.log('[USM SEEDER] Seeding sponsors...');
  await sponsorModel.deleteMany({});
  const sponsors = [
    {
      name: 'Ooredoo',
      category: 'Main',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Ooredoo_logo_2017.svg',
      story: "Ooredoo est le sponsor principal, moteur de la digitalisation technologique et du stade pour les supporters de l'USM.",
      storyFr: "Ooredoo est le sponsor principal, moteur de la digitalisation technologique et du stade pour les supporters de l'USM.",
      storyAr: 'تعتبر أوريدو الشريك التكنولوجي والراعي الرئيسي للاتحاد، وتدعم التحول الرقمي ومبادرات الجماهير.',
      offer: 'Get 15% discount in Ooredoo city stores presenting your USM digital supporter card.',
      offerFr: 'Obtenez 15% de réduction dans les boutiques Ooredoo en présentant votre carte de supporter numérique USM.',
      offerAr: 'احصل على خصم 15٪ في مغازات أوريدو عند الاستظهار ببطاقة المشجع الرقمية للاتحاد.',
      link: 'https://www.ooredoo.tn',
      metrics: { impressions: 145000, clicks: 12400, ctr: 8.5 },
    },
    {
      name: 'Délice Danone',
      category: 'Official',
      logo: '',
      story: "Partenaire depuis 2018 pour garantir une nutrition premium et le développement des jeunes à l'Académie USM.",
      storyFr: "Partenaire depuis 2018 pour garantir une nutrition premium et le développement des jeunes à l'Académie USM.",
      storyAr: 'شريك النادي منذ 2018 لدعم التغذية السليمة وبرامج التكوين الأساسي للشباب في الأكاديمية.',
      offer: 'Free nutrition guidebook access in the Youth Academy portal for all USM family members.',
      offerFr: "Guide nutritionnel gratuit accessible sur le portail de l'Académie pour toute la famille USM.",
      offerAr: 'دليل تغذية مجاني في بوابة أكاديمية النادي لجميع المنخرطين والمحبين.',
      link: 'https://www.delice.tn',
      metrics: { impressions: 98000, clicks: 5600, ctr: 5.7 },
    },
    {
      name: 'Tunisair',
      category: 'Official',
      logo: 'https://upload.wikimedia.org/wikipedia/en/9/97/Tunisair_logo.svg',
      story: "Les ailes officielles de l'US Monastir, transportant nos champions de basketball à travers les compétitions continentales.",
      storyFr: "Les ailes officielles de l'US Monastir, transportant nos champions de basketball à travers les compétitions continentales.",
      storyAr: 'الناقل الرسمي لبعثات الاتحاد المنستيري، تحلق بأبطالنا في مختلف البطولات القارية والإفريقية.',
      offer: 'Double fly points on flights booked to Kigali during BAL Tournament weeks.',
      offerFr: 'Points de fidélité doublés sur les vols vers Kigali durant les semaines du tournoi BAL.',
      offerAr: 'نقاط مضاعفة على الرحلات المتجهة إلى كيجالي خلال أسابيع منافسات الدوري الإفريقي.',
      link: 'https://www.tunisair.com',
      metrics: { impressions: 72000, clicks: 3200, ctr: 4.4 },
    },
    {
      name: 'Macron',
      category: 'Technical',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Macron_logo_horizontal_2025.svg',
      story: 'Macron fournit les tenues et équipements haute performance pour les sections Football et Basketball de USM.',
      storyFr: 'Macron fournit les tenues et équipements haute performance pour les sections Football et Basketball de USM.',
      storyAr: 'تزود ماكرون فرق كرة القدم وكرة السلة للاتحاد بأحدث الأزياء والمعدات الرياضية عالية الأداء.',
      offer: 'Get 10% off on official kits at the USM Boutique using code USM1923.',
      offerFr: 'Obtenez 10% de réduction sur les tenues officielles à la Boutique USM avec le code USM1923.',
      offerAr: 'احصل على خصم 10٪ على الأقمصة الرسمية في مغازة الاتحاد باستخدام الرمز USM1923.',
      link: 'https://www.macron.com',
      metrics: { impressions: 120000, clicks: 8900, ctr: 7.4 },
    },
    {
      name: 'BIAT',
      category: 'Official',
      logo: '',
      story: "La BIAT est le partenaire financier principal de l'USM, soutenant les infrastructures du club et les programmes sportifs locaux.",
      storyFr: "La BIAT est le partenaire financier principal de l'USM, soutenant les infrastructures du club et les programmes sportifs locaux.",
      storyAr: 'بنك بيات هو الشريك المالي الرئيسي للاتحاد، حيث يدعم البنية التحتية للنادي والبرامج الرياضية المحلية.',
      offer: 'Exclusive USM branded debit cards with special banking privileges for club members.',
      offerFr: 'Cartes bancaires exclusives aux couleurs USM avec des avantages bancaires spéciaux pour les membres du club.',
      offerAr: 'بطاقات بنكية حصرية تحمل شعار الاتحاد مع امتيازات مالية خاصة لأعضاء النادي.',
      link: 'https://www.biat.com.tn',
      metrics: { impressions: 85000, clicks: 4200, ctr: 4.9 },
    },
    {
      name: 'Sabrine',
      category: 'Official',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Eau_minerale_Sabrine_Tunisie.png',
      story: "Sabrine est le fournisseur officiel d'eau minérale, veillant à l'hydratation de nos athlètes dans toutes les sections.",
      storyFr: "Sabrine est le fournisseur officiel d'eau minérale, veillant à l'hydratation de nos athlètes dans toutes les sections.",
      storyAr: 'صبرين هي المزود الرسمي للمياه المعدنية للاتحاد، وتضمن الحفاظ على رطوبة رياضيينا في جميع الفروع.',
      offer: 'Sabrine hydration guide and special eco-friendly water bottles available at the official store.',
      offerFr: "Guide d'hydratation Sabrine et bouteilles éco-responsables disponibles à la boutique officielle.",
      offerAr: 'دليل ترطيب صبرين وقارورات مياه صديقة للبيئة متوفرة مجانًا في المغازة الرسمية.',
      link: 'https://www.sabrine.com.tn',
      metrics: { impressions: 65000, clicks: 2300, ctr: 3.5 },
    },
  ];
  await sponsorModel.insertMany(sponsors);
  console.log(`[USM SEEDER] Seeded ${sponsors.length} sponsors.`);

  // 8. Seed News Articles (only if collection is empty)
  console.log('[USM SEEDER] Seeding news articles...');
  const existingNewsCount = await newsModel.countDocuments();
  if (existingNewsCount === 0) {
    const newsArticles = [
      {
        title: 'US Monastir clinches crucial 2-1 victory over Club Africain',
        titleAr: 'الاتحاد المنستيري ينتزع فوزاً ثميناً من النادي الإفريقي 2-1',
        titleFr: "L'US Monastir s'impose avec autorité 2-1 face au Club Africain",
        summary: 'A breathtaking performance led by Moses Orkuma guided USM to solid points away in Rades.',
        summaryAr: 'أداء بطولي بقيادة موسى أوركوما يمنح الاتحاد ثلاث نقاط ثمينة خارج الديار في رادس.',
        summaryFr: 'Une superbe performance de Moses Orkuma offre une victoire capitale en déplacement à Radès.',
        content: 'US Monastir displayed tactical discipline and elite efficiency in a classic Ligue 1 fixture against Club Africain. Adem Alimi opened the score in the 14th minute after a precise delivery from Ifia. Although Kingsley Eduwo equalized in the second half, Moses Orkuma sealed the victory with a 30-meter screamer in the 78th minute. The win cements USM\'s position near the top of the standings.',
        contentAr: 'قدم الاتحاد الرياضي المنستيري أداءً تكتيكياً رفيعاً وفاعلية هجومية كبيرة في مباراة كلاسيكية بالرابطة الأولى ضد النادي الإفريقي. افتتح آدم العلمي التسجيل في الدقيقة 14 بعد تمريرة دقيقة من عيفية. ورغم تعادل كينغسلاي إيدو للنادي الإفريقي في الشوط الثاني، حسم موسى أوركوما اللقاء بقذيفة صاروخية من مسافة 30 متراً في الدقيقة 78. هذا الفوز يثبت أقدام الاتحاد في صدارة الترتيب.',
        contentFr: "L'US Monastir a fait preuve d'une discipline tactique exemplaire et d'une efficacité de premier ordre dans ce classique de la Ligue 1 face au Club Africain. Adem Alimi a débloqué la situation dès la 14e minute sur un centre millimétré de Firas Ifia. Malgré l'égalisation de Kingsley Eduwo en seconde période, c'est Moses Orkuma qui a scellé le match d'une frappe surpuissante de 30 mètres à la 78e minute.",
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        category: 'Football',
        categoryAr: 'كرة القدم',
        date: '2026-07-06',
        readTime: '4 min',
        official: true,
        author: 'Club Media Relations Office',
        published: true,
        featured: true,
      },
      {
        title: 'Basketball: Monastir finishes intense preparation ahead of PlayOffs',
        titleAr: 'كرة السلة: الاتحاد ينهي تحضيرات مكثفة استعداداً لمرحلة التتويج',
        titleFr: 'Basket: L\'USM peaufine sa préparation avant les PlayOffs',
        summary: 'Miodrag Perisic outlines tactical changes to maintain high offensive efficiency.',
        summaryAr: 'المدرب ميودراغ بيريسيتش يضع اللمسات الأخيرة للتغييرات التكتيكية للحفاظ على الفاعلية الهجومية.',
        summaryFr: "Le coach Miodrag Perisic prépare des ajustements tactiques pour maintenir l'efficacité offensive.",
        content: 'Ahead of the highly anticipated match against Club Africain, head coach Perisic spoke to the media about squad mental focus and physical fitness. Our goal is simple - defend the title with everything we have, said legend Radhouane Slimane.',
        contentAr: 'قبل المواجهة المنتظرة ضد النادي الإفريقي، تحدث المدرب الأول بيريسيتش لوسائل الإعلام عن التركيز الذهني والجاهزية البدنية للفريق.',
        contentFr: "Avant le grand choc contre le Club Africain, l'entraîneur principal Perisic s'est confié aux médias sur l'état d'esprit et de forme de l'équipe.",
        image: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=80',
        category: 'Basketball',
        categoryAr: 'كرة السلة',
        date: '2026-07-05',
        readTime: '3 min',
        official: false,
        author: 'USM Media Basketball Editor',
        published: true,
        featured: false,
      },
      {
        title: 'Official Announcement: Partnership renewal with Ooredoo Tunisia',
        titleAr: 'بلاغ رسمي: تجديد اتفاقية الشراكة مع أوريدو تونس',
        titleFr: 'Annonce Officielle: Renouvellement du partenariat avec Ooredoo Tunisie',
        summary: 'The club extends partnership securing advanced digital sponsorships and academy funding.',
        summaryAr: 'إدارة النادي تمدد الشراكة وتضمن تمويل أكاديميات الشباب وتطوير البنية الرقمية للمشجعين.',
        summaryFr: "Le club prolonge son partenariat stratégique garantissant le financement de l'académie et du digital.",
        content: 'Union Sportive Monastirienne is thrilled to announce a three-year extension of its sponsorship agreement with Ooredoo Tunisia. This renewal will focus on fan engagement portals, live match day activations, and supporting the elite Youth Academy.',
        contentAr: 'يسر الاتحاد الرياضي المنستيري الإعلان عن تجديد عقد الرعاية مع أوريدو تونس لثلاثة مواسم إضافية.',
        contentFr: "L'Union Sportive Monastirienne est ravie d'annoncer la prolongation pour trois ans de son accord de sponsoring avec Ooredoo Tunisie.",
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
        category: 'Announcements',
        categoryAr: 'بلاغات رسمية',
        date: '2026-07-04',
        readTime: '5 min',
        official: true,
        author: 'Presidential Press Office',
        published: true,
        featured: false,
      },
      {
        title: 'USM Academy: New Youth Development Season Kicks Off',
        titleAr: 'أكاديمية الاتحاد: انطلاق موسم التكوين الجديد للشباب',
        titleFr: "Académie USM: Le nouveau programme de développement jeunes est lancé",
        summary: 'The USM Academy opens registrations for its 2025-26 season with expanded programs across football and basketball.',
        summaryAr: 'أكاديمية الاتحاد تفتح التسجيلات لموسم 2025-26 مع توسيع برامج التكوين في كرة القدم وكرة السلة.',
        summaryFr: "L'Académie USM ouvre les inscriptions pour la saison 2025-26 avec des programmes élargis en football et basket.",
        content: 'Union Sportive Monastirienne is proud to announce the opening of its 2025-26 youth development season. This year, the Academy will welcome over 200 young athletes from the Monastir region and beyond, offering elite coaching, academic support, and professional pathways.',
        contentAr: 'يعلن الاتحاد الرياضي المنستيري بفخر عن انطلاق موسم التكوين الشبابي 2025-26. ستستقبل الأكاديمية هذا العام أكثر من 200 موهبة شابة من منطقة المنستير وما حولها.',
        contentFr: "L'Union Sportive Monastirienne est fière d'annoncer l'ouverture de sa saison de développement jeunes 2025-26. Cette année, l'Académie accueillera plus de 200 jeunes athlètes.",
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        category: 'Academy',
        categoryAr: 'الأكاديمية',
        date: '2026-07-02',
        readTime: '3 min',
        official: true,
        author: 'USM Academy Director',
        published: true,
        featured: false,
      },
      {
        title: 'Record crowd fills Stade Mustapha Ben Jannet for the Monastir derby night',
        titleAr: 'حشد قياسي يملأ مدرجات ملعب مصطفى بن جنات في ليلة ديربي المنستير',
        titleFr: "Affluence record au Stade Mustapha Ben Jannet pour la soirée du derby monastirien",
        summary: 'Over 15,000 supporters packed the stadium in a wave of blue and gold, the biggest home crowd of the season.',
        summaryAr: 'أكثر من 15 ألف مشجع ملأوا المدرجات بالأزرق والذهبي، في أكبر حضور جماهيري هذا الموسم.',
        summaryFr: "Plus de 15 000 supporters ont envahi les gradins dans une marée bleue et or, la plus grande affluence de la saison.",
        content: 'The atmosphere at Stade Mustapha Ben Jannet reached fever pitch as more than 15,000 USM supporters turned out for the season\'s marquee fixture. Ultras choreographed a stadium-wide tifo before kickoff, and the Fan Zone activations outside the ground drew families and children hours before the match. Club president praised the supporters\' section for representing the identity of Monastir on and off the pitch.',
        contentAr: 'بلغ الحماس ذروته في ملعب مصطفى بن جنات مع حضور أكثر من 15 ألف مشجع للاتحاد في أبرز مواجهة هذا الموسم. نظم الأنصار تيفو ضخم قبل صافرة الانطلاق، بينما جذبت فعاليات فان زون خارج الملعب العائلات والأطفال قبل ساعات من المباراة.',
        contentFr: "L'ambiance au Stade Mustapha Ben Jannet a atteint son paroxysme avec plus de 15 000 supporters de l'USM présents pour l'affiche de la saison. Les ultras ont orchestré un tifo géant avant le coup d'envoi, tandis que les animations de la Fan Zone à l'extérieur du stade ont attiré familles et enfants dès les premières heures.",
        image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
        category: 'Club',
        categoryAr: 'النادي',
        date: '2026-07-08',
        readTime: '3 min',
        official: true,
        author: 'Club Media Relations Office',
        published: true,
        featured: true,
      },
    ];
    await newsModel.insertMany(newsArticles);
    console.log(`[USM SEEDER] Seeded ${newsArticles.length} news articles.`);
  } else {
    console.log(`[USM SEEDER] News collection already has ${existingNewsCount} articles. Skipping seed.`);
  }

  await app.close();
  console.log('[USM SEEDER] Comprehensive database seeding complete.');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[USM SEEDER] Seeding failed:', err);
  process.exit(1);
});
