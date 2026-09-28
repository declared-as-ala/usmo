import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Palmares } from '../../views/Palmares';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/palmares',
    fallbackTitle: 'Palmarès de l’US Monastir | Titres Football, Basketball & BAL',
    fallbackDescription:
      'Tous les trophées remportés par l’USM : Coupe de Tunisie, Supercoupe, Championnat de Basketball et sacre continental BAL.',
  });
}

export default function PalmaresPage() {
  return (
    <Suspense fallback={null}>
      <Palmares />
    </Suspense>
  );
}
