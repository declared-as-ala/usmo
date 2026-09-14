import type { Metadata } from 'next';
import { ArticleDetail } from '../../../views/ArticleDetail';
import { buildPageMetadata } from '../../../lib/seo/buildMetadata';
import { buildNewsArticleSchema } from '../../../lib/seo/buildStructuredData';
import { StructuredDataScript } from '../../../components/Seo/StructuredDataScript';

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  const fallbackTitle = article
    ? `${article.titleFr || article.title} | Actualités US Monastir`
    : 'Actualité | Union Sportive Monastirienne';
  const fallbackDescription = article
    ? article.summaryFr || article.summary || "Actualité officielle de l'US Monastir"
    : "Actualités officielles de l'Union Sportive Monastirienne.";

  return buildPageMetadata({
    path: `/actualites/${slug}`,
    fallbackTitle,
    fallbackDescription,
    fallbackImage: article?.image,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  const structuredData = article
    ? buildNewsArticleSchema({
        headline: article.titleFr || article.title,
        description: article.summaryFr || article.summary || '',
        slug,
        image: article.image || '/logo.webp',
        datePublished: article.date || article.createdAt,
        authorName: article.author,
      })
    : null;

  return (
    <>
      {structuredData && <StructuredDataScript data={structuredData} />}
      <ArticleDetail slug={slug} />
    </>
  );
}
