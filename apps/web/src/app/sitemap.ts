import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001/api';

const STATIC_ROUTES = [
  '', 'football', 'basketball', 'matches', 'actualites', 'media',
  'boutique', 'histoire', 'palmares', 'legendes', 'stadium', 'telechargements',
  'sponsors', 'fanzone', 'contact', 'don', 'dons-donateurs', 'commande',
  'conditions-utilisation', 'confidentialite', 'cookies',
];

interface PlayerEntry { sport: string; slug: string; }
interface NewsEntry { slug?: string; updatedAt?: string; }
interface ProductEntry { slug?: string; }

async function safeFetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  const [players, newsRaw, productsRaw] = await Promise.all([
    safeFetchJson<PlayerEntry[]>('/players', []),
    safeFetchJson<NewsEntry[] | { news: NewsEntry[] }>('/news?limit=100&published=true', []),
    safeFetchJson<ProductEntry[] | { products: ProductEntry[] }>('/products?limit=200', []),
  ]);

  const playerEntries: MetadataRoute.Sitemap = (players || []).map((p) => ({
    url: `${SITE_URL}/${p.sport}/joueurs/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const news = Array.isArray(newsRaw) ? newsRaw : (newsRaw as unknown as { news: NewsEntry[] })?.news || [];
  const newsEntries: MetadataRoute.Sitemap = news
    .filter((n): n is Required<Pick<NewsEntry, 'slug'>> & NewsEntry => Boolean(n.slug))
    .map((n) => ({
      url: `${SITE_URL}/actualites/${n.slug}`,
      lastModified: n.updatedAt ? new Date(n.updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw as unknown as { products: ProductEntry[] })?.products || [];
  const productEntries: MetadataRoute.Sitemap = products
    .filter((p): p is Required<ProductEntry> => Boolean(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

  return [...staticEntries, ...playerEntries, ...newsEntries, ...productEntries];
}
