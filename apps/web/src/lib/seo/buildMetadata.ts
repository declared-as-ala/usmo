import type { Metadata } from 'next';
import { getPublicAbsoluteUrl, getCanonicalSiteUrl } from './publicUrl';

interface BuildMetadataOptions {
  path: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SITE_URL = getCanonicalSiteUrl();

export async function buildPageMetadata(options: BuildMetadataOptions): Promise<Metadata> {
  const cleanPath = options.path.split('?')[0];

  let serverSeo: any = null;
  try {
    const res = await fetch(`${API_BASE}/seo/metadata?path=${encodeURIComponent(cleanPath)}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      serverSeo = await res.json();
    }
  } catch {
    // Graceful fallback to provided options
  }

  const title = serverSeo?.title || options.fallbackTitle || 'Union Sportive Monastirienne';
  const description = serverSeo?.description || options.fallbackDescription || "Portail officiel de l'Union Sportive Monastirienne (USM).";
  const canonical = serverSeo?.canonical || `${SITE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  const socialImage = getPublicAbsoluteUrl(serverSeo?.openGraph?.image || options.fallbackImage);
  const siteName = serverSeo?.openGraph?.siteName || 'Union Sportive Monastirienne';
  const robots = serverSeo?.robots || { index: true, follow: true };

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: options.keywords || [
      'US Monastir',
      'Union Sportive Monastirienne',
      'USM',
      'Monastir Football',
      'Monastir Basketball',
      'Ligue 1 Tunisie',
    ],
    alternates: {
      canonical,
    },
    robots: {
      index: robots.index !== false,
      follow: robots.follow !== false,
      googleBot: {
        index: robots.index !== false,
        follow: robots.follow !== false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: serverSeo?.openGraph?.title || title,
      description: serverSeo?.openGraph?.description || description,
      url: canonical,
      siteName,
      type: (options.type || serverSeo?.openGraph?.type || 'website') as any,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: serverSeo?.openGraph?.imageAlt || title,
        },
      ],
      locale: 'fr_FR',
    },
    twitter: {
      card: (serverSeo?.twitter?.card || 'summary_large_image') as any,
      title: serverSeo?.twitter?.title || title,
      description: serverSeo?.twitter?.description || description,
      images: [socialImage],
      creator: serverSeo?.settings?.twitterHandle || '@USMonastir',
      site: serverSeo?.settings?.twitterHandle || '@USMonastir',
    },
  };
}
