import type { Metadata } from 'next';
import { Newsroom } from '../../views/Newsroom';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/actualites',
    fallbackTitle: 'Actualités & Communiqués Officiels | US Monastir',
    fallbackDescription:
      'Toute l’actualité officielle de l’US Monastir : football, basketball, communiqués, interviews et analyses.',
  });
}

export default function ActualitesPage() {
  return <Newsroom />;
}
