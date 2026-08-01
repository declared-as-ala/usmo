/**
 * One-shot: wipe the boutique catalog and seed the 3 official 2025/26 jerseys
 * (home, away, third) using the real product photos supplied by the club.
 *
 * Must run inside the container (NestFactory + StorageService/MinIO need full DI):
 *   docker cp apps/api/seed-assets usm-api:/app/apps/api/seed-assets
 *   docker exec -w /app/apps/api usm-api node dist/seed-jerseys.js
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { Product } from './modules/products/product.schema';
import { StorageService } from './modules/storage/storage.service';

async function bootstrap() {
  console.log('[seed-jerseys] Starting...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const productModel = app.get<Model<Product>>('ProductModel');
  const storageService = app.get(StorageService);

  const uploadJerseyImage = async (filename: string, altText: string) => {
    const buffer = await readFile(path.resolve(__dirname, '../seed-assets/products', filename));
    const media = await storageService.uploadFile(
      buffer,
      filename,
      'image/jpeg',
      'products/seed',
      undefined,
      { altText, tags: ['seed', 'boutique', 'usm', 'jersey'] },
    );
    return media.largeUrl || media.url;
  };

  const [homeImage, awayImage, thirdImage] = await Promise.all([
    uploadJerseyImage('usm-jersey-home-2526.jpg', 'Maillot domicile officiel US Monastir 2025/26'),
    uploadJerseyImage('usm-jersey-away-2526.jpg', 'Maillot extérieur officiel US Monastir 2025/26'),
    uploadJerseyImage('usm-jersey-third-2526.jpg', 'Maillot third officiel US Monastir 2025/26'),
  ]);

  const deleted = await productModel.deleteMany({});
  console.log(`[seed-jerseys] Cleared ${deleted.deletedCount} existing products`);

  const products = [
    {
      name: 'US Monastir Official Home Jersey 2025/26',
      nameFr: 'Maillot Domicile Officiel US Monastir 2025/26',
      nameAr: 'قميص الاتحاد المنستيري الرسمي الأساسي 2025/26',
      slug: 'usm-official-home-jersey-2025-26',
      sku: 'USM-FB-HM-2526',
      description: 'Official home kit for the 2025/26 season, royal blue with the club crest.',
      descriptionFr: 'Maillot domicile officiel de la saison 2025/26, bleu royal rayé avec écusson du club.',
      descriptionAr: 'القميص الرسمي الأساسي لموسم 2025/26 باللون الأزرق الملكي مع شعار النادي.',
      coverImage: homeImage,
      images: [homeImage],
      price: 89000, // 89 TND in millimes
      category: 'jerseys',
      collections: ['football'],
      sport: 'football',
      season: '2025/26',
      badges: ['bestseller', 'official'],
      tags: ['Home', 'Bleu', 'Maillot', '2025', '2026'],
      status: 'published',
      isFeatured: true,
      lowStockThreshold: 10,
      variants: [
        { id: 'jh-v1', sku: 'USM-FB-HM-2526-S', size: 'S', color: 'Bleu', colorHex: '#0D63FF', stock: 15 },
        { id: 'jh-v2', sku: 'USM-FB-HM-2526-M', size: 'M', color: 'Bleu', colorHex: '#0D63FF', stock: 25 },
        { id: 'jh-v3', sku: 'USM-FB-HM-2526-L', size: 'L', color: 'Bleu', colorHex: '#0D63FF', stock: 25 },
        { id: 'jh-v4', sku: 'USM-FB-HM-2526-XL', size: 'XL', color: 'Bleu', colorHex: '#0D63FF', stock: 10 },
      ],
    },
    {
      name: 'US Monastir Official Away Jersey 2025/26',
      nameFr: 'Maillot Extérieur Officiel US Monastir 2025/26',
      nameAr: 'قميص الاتحاد المنستيري الرسمي الثاني 2025/26',
      slug: 'usm-official-away-jersey-2025-26',
      sku: 'USM-FB-AW-2526',
      description: 'Official away kit for the 2025/26 season, white with a blue central stripe.',
      descriptionFr: 'Maillot extérieur officiel de la saison 2025/26, blanc avec bande centrale bleue.',
      descriptionAr: 'القميص الرسمي الثاني لموسم 2025/26 باللون الأبيض مع خط أزرق في الوسط.',
      coverImage: awayImage,
      images: [awayImage],
      price: 89000,
      category: 'jerseys',
      collections: ['football'],
      sport: 'football',
      season: '2025/26',
      badges: ['official'],
      tags: ['Away', 'Blanc', 'Maillot', '2025', '2026'],
      status: 'published',
      isFeatured: true,
      lowStockThreshold: 10,
      variants: [
        { id: 'ja-v1', sku: 'USM-FB-AW-2526-S', size: 'S', color: 'Blanc', colorHex: '#F5F7FA', stock: 12 },
        { id: 'ja-v2', sku: 'USM-FB-AW-2526-M', size: 'M', color: 'Blanc', colorHex: '#F5F7FA', stock: 20 },
        { id: 'ja-v3', sku: 'USM-FB-AW-2526-L', size: 'L', color: 'Blanc', colorHex: '#F5F7FA', stock: 20 },
        { id: 'ja-v4', sku: 'USM-FB-AW-2526-XL', size: 'XL', color: 'Blanc', colorHex: '#F5F7FA', stock: 8 },
      ],
    },
    {
      name: 'US Monastir Official Third Jersey 2025/26',
      nameFr: 'Maillot Third Officiel US Monastir 2025/26',
      nameAr: 'قميص الاتحاد المنستيري الرسمي الثالث 2025/26',
      slug: 'usm-official-third-jersey-2025-26',
      sku: 'USM-FB-TH-2526',
      description: 'Limited edition third kit for the 2025/26 season, black with the club crest.',
      descriptionFr: 'Maillot third édition limitée de la saison 2025/26, noir avec écusson du club.',
      descriptionAr: 'القميص الرسمي الثالث بإصدار محدود لموسم 2025/26 باللون الأسود مع شعار النادي.',
      coverImage: thirdImage,
      images: [thirdImage],
      price: 89000,
      category: 'jerseys',
      collections: ['football', 'limited'],
      sport: 'football',
      season: '2025/26',
      badges: ['limited'],
      tags: ['Third', 'Noir', 'Maillot', '2025', '2026'],
      status: 'published',
      isFeatured: false,
      lowStockThreshold: 10,
      variants: [
        { id: 'jt-v1', sku: 'USM-FB-TH-2526-S', size: 'S', color: 'Noir', colorHex: '#0B0B0F', stock: 10 },
        { id: 'jt-v2', sku: 'USM-FB-TH-2526-M', size: 'M', color: 'Noir', colorHex: '#0B0B0F', stock: 18 },
        { id: 'jt-v3', sku: 'USM-FB-TH-2526-L', size: 'L', color: 'Noir', colorHex: '#0B0B0F', stock: 18 },
        { id: 'jt-v4', sku: 'USM-FB-TH-2526-XL', size: 'XL', color: 'Noir', colorHex: '#0B0B0F', stock: 6 },
      ],
    },
  ];

  await productModel.insertMany(products);
  console.log(`[seed-jerseys] Seeded ${products.length} jersey products`);

  await app.close();
  console.log('[seed-jerseys] Done ✅');
}

bootstrap().catch((err) => {
  console.error('[seed-jerseys] Failed:', err);
  process.exit(1);
});
