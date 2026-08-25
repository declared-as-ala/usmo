import type { Metadata } from 'next';
import { ArticleDetail } from '../../../views/ArticleDetail';

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.SITE_URL;

async function fetchArticleBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/news/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return { title: 'Actualité | Union Sportive Monastirienne' };
  }

  const title = article.titleFr || article.title || 'US Monastir';
  const description = article.summaryFr || article.summary || "Actualité officielle de l'US Monastir";
  const image = article.image || `${SITE_URL}/logo.webp`;
  const url = `${SITE_URL}/actualites/${slug}`;

  return {
    title: `${title} | US Monastir`,
    description,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      siteName: 'Union Sportive Monastirienne',
      publishedTime: article.date,
      authors: [article.author || 'Rédaction USM'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleDetail slug={slug} />;
}

