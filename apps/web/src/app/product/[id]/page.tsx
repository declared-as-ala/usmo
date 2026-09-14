import type { Metadata } from 'next';
import { ProductDetail } from '../../../views/ProductDetail';
import { buildPageMetadata } from '../../../lib/seo/buildMetadata';
import { buildProductSchema } from '../../../lib/seo/buildStructuredData';
import { StructuredDataScript } from '../../../components/Seo/StructuredDataScript';

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductBySlug(id);

  const fallbackTitle = product
    ? `${product.nameFr || product.name} | Boutique Officielle US Monastir`
    : 'Boutique Officielle | Union Sportive Monastirienne';
  const fallbackDesc = product
    ? (product.descriptionFr || product.description || '').replace(/<[^>]*>/g, '').slice(0, 160)
    : 'Achetez les produits et maillots officiels de l’Union Sportive Monastirienne.';

  return buildPageMetadata({
    path: `/product/${id}`,
    fallbackTitle,
    fallbackDescription: fallbackDesc,
    fallbackImage: product?.coverImage,
    type: 'website',
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProductBySlug(id);

  const structuredData = product
    ? buildProductSchema({
        name: product.nameFr || product.name,
        description: (product.descriptionFr || product.description || '').replace(/<[^>]*>/g, '').slice(0, 300),
        slug: product.slug || id,
        image: product.coverImage || '/logo.webp',
        sku: product.sku || id,
        price: product.price || 0,
        inStock: product.stockStatus === 'IN_STOCK',
        category: product.category,
      })
    : null;

  return (
    <>
      {structuredData && <StructuredDataScript data={structuredData} />}
      <ProductDetail key={id} productId={id} />
    </>
  );
}
