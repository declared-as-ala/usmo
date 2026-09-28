import React from 'react';
import type { Metadata } from 'next';
import { FanZone } from '../../views/FanZone';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/fanzone',
    fallbackTitle: 'Fan Zone US Monastir | Pronostics, Jeux & Espace Supporters',
    fallbackDescription:
      'Participez aux pronostics officiels USM, votez pour l’Homme du match et gagnez des cadeaux exclusifs en boutique.',
  });
}

export default function FanZonePageRoute() {
  return <FanZone />;
}
