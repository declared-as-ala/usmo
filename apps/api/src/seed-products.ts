import 'dotenv/config';
import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const productVariantSchema = new Schema({
  id: { type: String, required: true },
  sku: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number }
});

const productSchema = new Schema({
  name: { type: String, required: true },
  nameFr: { type: String },
  nameAr: { type: String },
  slug: { type: String, required: true, unique: true, index: true },
  sku: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  descriptionFr: { type: String },
  descriptionAr: { type: String },
  coverImage: { type: String, required: true },
  images: { type: [String], default: [] },
  price: { type: Number, required: true }, // stored in millimes
  oldPrice: { type: Number },
  category: { type: String, required: true, index: true },
  collections: { type: [String], default: [], index: true },
  sport: { type: String, required: true, default: 'club', index: true },
  season: { type: String, required: true },
  variants: { type: [productVariantSchema], default: [] },
  badges: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  status: { type: String, required: true, default: 'published', index: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

const ProductModel = model('Product', productSchema, 'products');

const productsData = [
  {
    name: 'US Monastir Official Home Jersey 2025/26',
    nameFr: 'Maillot Domicile Officiel US Monastir 2025/26',
    nameAr: 'قميص الاتحاد المنستيري الرسمي الأساسي 2025/26',
    slug: 'us-monastir-official-home-jersey-2025-26',
    sku: 'USM-FB-HM-2526',
    description: 'High-performance official home kit, featuring royal blue colorways and advanced aeroready tech.',
    descriptionFr: 'Maillot domicile officiel haute performance, coloris bleu royal et technologie Aeroready avancée.',
    descriptionAr: 'القميص الرسمي الأساسي عالي الأداء باللون الأزرق الملكي وشعار النادي الفاخر بتقنية التهوية الفائقة.',
    coverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80'],
    price: 85000,
    category: 'Jerseys',
    collections: ['football', 'matchday'],
    sport: 'football',
    season: '2025/2026',
    badges: ['bestseller', 'official'],
    tags: ['home', 'jersey', 'football', 'official'],
    status: 'published',
    isFeatured: true,
    variants: [
      { id: 'v1_s', sku: 'USM-FB-HM-2526-S', size: 'S', color: 'USM Blue', colorHex: '#0D63FF', stock: 15 },
      { id: 'v1_m', sku: 'USM-FB-HM-2526-M', size: 'M', color: 'USM Blue', colorHex: '#0D63FF', stock: 20 },
      { id: 'v1_l', sku: 'USM-FB-HM-2526-L', size: 'L', color: 'USM Blue', colorHex: '#0D63FF', stock: 25 },
      { id: 'v1_xl', sku: 'USM-FB-HM-2526-XL', size: 'XL', color: 'USM Blue', colorHex: '#0D63FF', stock: 10 },
      { id: 'v1_xxl', sku: 'USM-FB-HM-2526-XXL', size: 'XXL', color: 'USM Blue', colorHex: '#0D63FF', stock: 5 }
    ]
  },
  {
    name: 'US Monastir Official Away Jersey 2025/26',
    nameFr: 'Maillot Extérieur Officiel US Monastir 2025/26',
    nameAr: 'قميص الاتحاد المنستيري الرسمي الاحتياطي 2025/26',
    slug: 'us-monastir-official-away-jersey-2025-26',
    sku: 'USM-FB-AW-2526',
    description: 'Crisp away-day kit in ivory white with navy trims, engineered for hot Tunisian matchdays.',
    descriptionFr: 'Maillot extérieur blanc ivoire aux liserés bleu marine, conçu pour les journées chaudes de Tunisie.',
    descriptionAr: 'قميص احتياطي أنيق بلون أبيض عاجي وحواف كحلية، مصمم لأجواء المباريات الحارة في تونس.',
    coverImage: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80'],
    price: 85000,
    category: 'Jerseys',
    collections: ['football'],
    sport: 'football',
    season: '2025/2026',
    badges: ['new'],
    tags: ['away', 'jersey', 'football', 'white'],
    status: 'published',
    isFeatured: false,
    variants: [
      { id: 'v2_s', sku: 'USM-FB-AW-2526-S', size: 'S', color: 'White', colorHex: '#F5F7FA', stock: 12 },
      { id: 'v2_m', sku: 'USM-FB-AW-2526-M', size: 'M', color: 'White', colorHex: '#F5F7FA', stock: 18 },
      { id: 'v2_l', sku: 'USM-FB-AW-2526-L', size: 'L', color: 'White', colorHex: '#F5F7FA', stock: 15 },
      { id: 'v2_xl', sku: 'USM-FB-AW-2526-XL', size: 'XL', color: 'White', colorHex: '#F5F7FA', stock: 8 }
    ]
  },
  {
    name: 'US Monastir BAL Champions Tribute Hoodie',
    nameFr: 'Sweat Hommage aux Champions BAL US Monastir',
    nameAr: 'سترة تكريم أبطال إفريقيا لكرة السلة 2022',
    slug: 'us-monastir-bal-champions-tribute-hoodie',
    sku: 'USM-BB-BAL-HD',
    description: 'Premium limited edition hoodie celebrating our historic 2022 BAL championship victory in Kigali.',
    descriptionFr: 'Sweat premium en édition limitée célébrant notre victoire historique au championnat BAL 2022 à Kigali.',
    descriptionAr: 'سترة قطنية مريحة بإصدار محدود تحتفي بالفوز التاريخي باللقب الأفريقي لكرة السلة في كيجالي 2022.',
    coverImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
    price: 110000,
    oldPrice: 139000,
    category: 'Hoodies',
    collections: ['limited', 'basketball'],
    sport: 'basketball',
    season: '2022',
    badges: ['limited', 'lowStock'],
    tags: ['hoodie', 'basketball', 'bal', 'champions'],
    status: 'published',
    isFeatured: true,
    variants: [
      { id: 'v3_m', sku: 'USM-BB-BAL-HD-M', size: 'M', color: 'Navy', colorHex: '#06152B', stock: 2 },
      { id: 'v3_l', sku: 'USM-BB-BAL-HD-L', size: 'L', color: 'Navy', colorHex: '#06152B', stock: 3 },
      { id: 'v3_xl', sku: 'USM-BB-BAL-HD-XL', size: 'XL', color: 'Navy', colorHex: '#06152B', stock: 1 }
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
    coverImage: 'https://images.unsplash.com/photo-1641520592277-5d81a1284a16?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
    price: 30000,
    category: 'Accessories',
    collections: ['matchday'],
    sport: 'club',
    season: '2025/2026',
    badges: ['bestseller'],
    tags: ['scarf', 'ultras', 'fan', 'accessory'],
    status: 'published',
    isFeatured: true,
    variants: [
      { id: 'v4_os', sku: 'USM-ACC-SCF-OS', size: 'One Size', color: 'USM Blue', colorHex: '#0D63FF', stock: 150 }
    ]
  },
  {
    name: 'US Monastir Basketball Home Jersey',
    nameFr: 'Maillot Domicile Basketball US Monastir',
    nameAr: 'قميص كرة السلة الرسمي الأساسي للاتحاد',
    slug: 'us-monastir-basketball-home-jersey',
    sku: 'USM-BB-HM-01',
    description: 'Lightweight mesh basketball jersey worn by the BAL champions on home playoff nights.',
    descriptionFr: 'Maillot de basketball léger en mesh, porté par les champions du BAL lors des soirées de playoffs à domicile.',
    descriptionAr: 'قميص كرة سلة خفيف من الشبك الرياضي يرتديه أبطال الدوري الإفريقي في مباريات الديار.',
    coverImage: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1710945261882-a94b3f31b15e?auto=format&fit=crop&w=800&q=80'],
    price: 95000,
    category: 'Jerseys',
    collections: ['basketball'],
    sport: 'basketball',
    season: '2025/2026',
    badges: ['official'],
    tags: ['jersey', 'basketball', 'bal', 'mesh'],
    status: 'published',
    isFeatured: false,
    variants: [
      { id: 'v5_s', sku: 'USM-BB-HM-01-S', size: 'S', color: 'USM Blue', colorHex: '#0D63FF', stock: 10 },
      { id: 'v5_m', sku: 'USM-BB-HM-01-M', size: 'M', color: 'USM Blue', colorHex: '#0D63FF', stock: 15 },
      { id: 'v5_l', sku: 'USM-BB-HM-01-L', size: 'L', color: 'USM Blue', colorHex: '#0D63FF', stock: 12 },
      { id: 'v5_xl', sku: 'USM-BB-HM-01-XL', size: 'XL', color: 'USM Blue', colorHex: '#0D63FF', stock: 8 }
    ]
  },
  {
    name: 'Blue Ribat Supporter Cap',
    nameFr: 'Casquette Supporter « Ribat Bleu »',
    nameAr: 'قبعة مشجعي الاتحاد "الرباط الأزرق"',
    slug: 'blue-ribat-supporter-cap',
    sku: 'USM-ACC-CAP',
    description: 'Adjustable sport cap featuring the official club emblem embroidered in premium stitching.',
    descriptionFr: 'Casquette de sport ajustable, écusson officiel du club brodé avec une finition premium.',
    descriptionAr: 'قبعة رياضية قابلة للتعديل تحمل شعار النادي مطرزاً بجودة عالية.',
    coverImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    price: 35000,
    category: 'Caps',
    collections: ['accessories'],
    sport: 'club',
    season: '2025/2026',
    badges: ['soldOut'],
    tags: ['cap', 'hat', 'accessory', 'ribat'],
    status: 'published',
    isFeatured: false,
    variants: [
      { id: 'v6_os', sku: 'USM-ACC-CAP-OS', size: 'One Size', color: 'Navy', colorHex: '#06152B', stock: 0 }
    ]
  }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[seed-products] Connected to MongoDB');

  const deleted = await ProductModel.deleteMany({});
  console.log(`[seed-products] Cleared ${deleted.deletedCount} old products`);

  const inserted = await ProductModel.insertMany(productsData);
  console.log(`[seed-products] Inserted ${inserted.length} products successfully`);
  inserted.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} (${p.sku} - ${p.price / 1000} TND)`));

  await mongoose.disconnect();
  console.log('[seed-products] Done ✅');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
