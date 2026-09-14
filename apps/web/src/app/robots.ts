import type { MetadataRoute } from 'next';
import { getCanonicalSiteUrl } from '@/lib/seo/publicUrl';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getCanonicalSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/compte',
          '/checkout',
          '/panier',
          '/auth',
          '/api/',
          '/*?*utm_',
          '/*?*fbclid',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Claude-Web',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'CCBot',
          'Bytespider',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llm.txt',
          '/llms-full.txt',
          '/.well-known/llms.txt',
          '/actualites',
          '/football',
          '/basketball',
          '/matches',
          '/boutique',
          '/histoire',
          '/palmares',
          '/legendes',
          '/stadium',
          '/sponsors',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/compte',
          '/checkout',
          '/panier',
          '/auth',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

