import type { Metadata } from 'next';
import { Histoire } from '../../views/Histoire';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/histoire',
    fallbackTitle: 'Histoire de l’US Monastir | 100 Ans de Légende & Fierté',
    fallbackDescription:
      'Depuis 1923, découvrez l’histoire de l’Union Sportive Monastirienne : fondation, valeurs, football, basketball et un siècle de fierté pour Monastir.',
  });
}

export default function HistoirePage() {
  return <Histoire />;
}
