import type { Metadata } from 'next';
import { OfficialCatalog } from '../../views/OfficialCatalog';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';
import { buildBreadcrumbsSchema } from '../../lib/seo/buildStructuredData';
import { StructuredDataScript } from '../../components/Seo/StructuredDataScript';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/boutique',
    fallbackTitle: 'Boutique Officielle US Monastir | Maillots, Tenues & Accessoires',
    fallbackDescription:
      'Commandez les maillots officiels 2026/27, survêtements et produits dérivés de l’US Monastir. Livraison partout en Tunisie et retrait club.',
  });
}

export default function BoutiquePageRoute() {
  const breadcrumbs = buildBreadcrumbsSchema([
    { name: 'Accueil', item: '/' },
    { name: 'Boutique Officielle', item: '/boutique' },
  ]);

  return (
    <>
      <StructuredDataScript data={breadcrumbs} />
      <OfficialCatalog />
    </>
  );
}
