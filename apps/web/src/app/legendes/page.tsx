import type { Metadata } from 'next';
import { Legends } from '../../views/Legends';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/legendes',
    fallbackTitle: 'Légendes de l’US Monastir | Joueurs & Figures Historiques',
    fallbackDescription:
      'Hommage aux joueurs et entraîneurs emblématiques qui ont marqué l’histoire de l’Union Sportive Monastirienne.',
  });
}

export default function LegendsPage() {
  return <Legends />;
}
