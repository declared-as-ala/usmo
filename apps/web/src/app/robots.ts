import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.usmonastir.tn').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/compte',
        '/checkout',
        '/panier',
        '/auth',
        '/api/internal',
        '/*?*utm_',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
