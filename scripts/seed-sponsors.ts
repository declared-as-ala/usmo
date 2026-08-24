import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';
import fs from 'fs';
import path from 'path';
import * as Minio from 'minio';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://missaouiala7_db_user:ipYjeuoZ3xJdQdSk@cluster0.er5ikuz.mongodb.net/usmo';

const sponsorSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true, index: true },
    shortName: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Main', 'Official', 'Technical', 'Media', 'Academy', 'Partner', 'Institutional'],
      default: 'Official',
    },
    sponsorType: { type: String, default: 'OFFICIAL' },
    sportScope: { type: String, enum: ['CLUB', 'FOOTBALL', 'BASKETBALL', 'BOTH'], default: 'CLUB' },
    logo: { type: String, default: '' },
    primaryLogo: { type: String, default: '' },
    lightLogo: { type: String, default: '' },
    darkLogo: { type: String, default: '' },
    monochromeLogo: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    description: { type: String, default: '' },
    story: { type: String, default: '' },
    storyFr: { type: String, default: '' },
    storyAr: { type: String, default: '' },
    offer: { type: String, default: '' },
    offerFr: { type: String, default: '' },
    offerAr: { type: String, default: '' },
    link: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: true },
    showOnSponsorsPage: { type: Boolean, default: true },
    sourceType: { type: String, enum: ['PDF_IMPORT', 'MANUAL'], default: 'PDF_IMPORT' },
    sourceFile: { type: String, default: '' },
    sourcePage: { type: Number, default: null },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const SponsorModel = mongoose.models.Sponsor || model('Sponsor', sponsorSchema);

const SPONSORS_DATA = [
  {
    name: 'GAT',
    slug: 'gat',
    shortName: 'GAT',
    category: 'Official',
    sponsorType: 'OFFICIAL',
    sportScope: 'CLUB',
    logo: '/sponsors/gat/logo.webp',
    primaryLogo: '/sponsors/gat/logo.webp',
    lightLogo: '/sponsors/gat/logo.webp',
    darkLogo: '/sponsors/gat/logo-dark.webp',
    thumbnail: '/sponsors/gat/thumbnail.webp',
    story: 'Partenaire officiel engagé aux côtés de l’Union Sportive Monastirienne.',
    storyFr: 'Partenaire officiel engagé aux côtés de l’Union Sportive Monastirienne.',
    storyAr: 'شريك رسمي ملتزم بدعم الاتحاد الرياضي المنستيري.',
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    showOnHomepage: true,
    showOnSponsorsPage: true,
    sourceType: 'PDF_IMPORT',
    sourceFile: 'logo GAT , Maestro , Saida , Biat.pdf',
    sourcePage: 1,
  },
  {
    name: 'BIAT',
    slug: 'biat',
    shortName: 'BIAT',
    category: 'Main',
    sponsorType: 'MAIN',
    sportScope: 'CLUB',
    logo: '/sponsors/biat/logo.webp',
    primaryLogo: '/sponsors/biat/logo.webp',
    lightLogo: '/sponsors/biat/logo.webp',
    darkLogo: '/sponsors/biat/logo-dark.webp',
    thumbnail: '/sponsors/biat/thumbnail.webp',
    story: 'Partenaire institutionnel majeur accompagnant les succès nationaux et continentaux de l’USM.',
    storyFr: 'Partenaire institutionnel majeur accompagnant les succès nationaux et continentaux de l’USM.',
    storyAr: 'شريك رئيسي يرافق إنجازات وتألق الاتحاد الرياضي المنستيري.',
    displayOrder: 2,
    isActive: true,
    isFeatured: true,
    showOnHomepage: true,
    showOnSponsorsPage: true,
    sourceType: 'PDF_IMPORT',
    sourceFile: 'logo GAT , Maestro , Saida , Biat.pdf',
    sourcePage: 2,
  },
  {
    name: 'Maestro',
    slug: 'maestro',
    shortName: 'Maestro',
    category: 'Official',
    sponsorType: 'OFFICIAL',
    sportScope: 'CLUB',
    logo: '/sponsors/maestro/logo.webp',
    primaryLogo: '/sponsors/maestro/logo.webp',
    lightLogo: '/sponsors/maestro/logo.webp',
    darkLogo: '/sponsors/maestro/logo-dark.webp',
    thumbnail: '/sponsors/maestro/thumbnail.webp',
    story: 'Partenaire officiel soutenant le développement sportif et la passion des supporters.',
    storyFr: 'Partenaire officiel soutenant le développement sportif et la passion des supporters.',
    storyAr: 'شريك رسمي يدعم التطوير الرياضي وشغف الجماهير العريضة.',
    displayOrder: 3,
    isActive: true,
    isFeatured: true,
    showOnHomepage: true,
    showOnSponsorsPage: true,
    sourceType: 'PDF_IMPORT',
    sourceFile: 'logo GAT , Maestro , Saida , Biat.pdf',
    sourcePage: 3,
  },
  {
    name: 'Saida',
    slug: 'saida',
    shortName: 'Saida',
    category: 'Official',
    sponsorType: 'OFFICIAL',
    sportScope: 'CLUB',
    logo: '/sponsors/saida/logo.webp',
    primaryLogo: '/sponsors/saida/logo.webp',
    lightLogo: '/sponsors/saida/logo.webp',
    darkLogo: '/sponsors/saida/logo-dark.webp',
    thumbnail: '/sponsors/saida/thumbnail.webp',
    story: 'Partenaire officiel ancré dans le paysage sportif tunisien aux côtés du club.',
    storyFr: 'Partenaire officiel ancré dans le paysage sportif tunisien aux côtés du club.',
    storyAr: 'شريك رسمي متجذر في المشهد الرياضي التونسي إلى جانب النادي.',
    displayOrder: 4,
    isActive: true,
    isFeatured: true,
    showOnHomepage: true,
    showOnSponsorsPage: true,
    sourceType: 'PDF_IMPORT',
    sourceFile: 'logo GAT , Maestro , Saida , Biat.pdf',
    sourcePage: 4,
  },
];

async function syncMinIO() {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = parseInt(process.env.MINIO_PORT || '9000', 10);
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin123';
  const bucket = process.env.MINIO_BUCKET || 'usm-media';

  try {
    const minioClient = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    const bucketExists = await minioClient.bucketExists(bucket).catch(() => false);
    if (!bucketExists) {
      console.log(`MinIO bucket "${bucket}" not found or unreachable. Local static assets will be served directly.`);
      return;
    }

    console.log(`MinIO connected. Syncing sponsor assets to bucket "${bucket}"...`);
    const sponsorsDir = path.resolve(__dirname, '../apps/web/public/sponsors');

    for (const sponsor of SPONSORS_DATA) {
      const slugDir = path.join(sponsorsDir, sponsor.slug);
      if (!fs.existsSync(slugDir)) continue;

      const files = fs.readdirSync(slugDir);
      for (const file of files) {
        const filePath = path.join(slugDir, file);
        const objectKey = `sponsors/${sponsor.slug}/${file}`;
        const fileStream = fs.createReadStream(filePath);
        const stat = fs.statSync(filePath);

        await minioClient.putObject(bucket, objectKey, fileStream, stat.size, {
          'Content-Type': file.endsWith('.png') ? 'image/png' : 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
        });
        console.log(`Uploaded MinIO object: ${objectKey}`);
      }
    }
  } catch (err: any) {
    console.log(`MinIO optional sync skipped (${err.message}). Local public assets are available at /sponsors/...`);
  }
}

async function seedSponsors() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB!');

  console.log('Seeding official sponsors extracted from PDF...');

  for (const s of SPONSORS_DATA) {
    const result = await SponsorModel.findOneAndUpdate(
      { slug: s.slug },
      { $set: s },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`✓ Upserted Sponsor: [${result.name}] (slug: "${result.slug}", page: ${result.sourcePage})`);
  }

  // Also sync to MinIO if server is active
  await syncMinIO();

  console.log('\nSponsor seed completed successfully!');
  await mongoose.disconnect();
}

seedSponsors().catch((err) => {
  console.error('Failed to seed sponsors:', err);
  process.exit(1);
});
