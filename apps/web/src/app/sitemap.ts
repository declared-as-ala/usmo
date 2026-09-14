import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.usmonastir.tn').replace(/\/+$/, '');
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const STATIC_FALLBACK_ROUTES = [
  '', 'football', 'basketball', 'matches', 'actualites', 'media',
  'boutique', 'histoire', 'palmares', 'legendes', 'stadium', 'telechargements',
  'sponsors', 'fanzone', 'contact', 'don', 'dons-donateurs',
  'conditions-utilisation', 'confidentialite', 'cookies',
];

interface SeoEntry {
  url: string;
  lastModified: string | Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Try to fetch from centralized SEO service
  try {
    const res = await fetch(`${API_URL}/seo/sitemap-entries`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const entries: SeoEntry[] = await res.json();
      if (Array.isArray(entries) && entries.length > 0) {
        return entries.map((e) => {
          const path = e.url.startsWith('/') ? e.url : `/${e.url}`;
          return {
            url: `${SITE_URL}${path}`,
            lastModified: new Date(e.lastModified),
            changeFrequency: e.changeFrequency || 'weekly',
            priority: e.priority || 0.7,
          };
        });
      }
    }
  } catch {
    // Fallback below
  }

  // 2. Safe Fallback
  return STATIC_FALLBACK_ROUTES.map((route) => ({
    url: `${SITE_URL}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.7,
  }));
}
