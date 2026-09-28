import React from 'react';
import type { Metadata } from 'next';
import { StadiumGuide } from '../../views/StadiumGuide';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/stadium',
    fallbackTitle: 'Stade Mustapha Ben Jannet | Guide & Informations Pratiques',
    fallbackDescription:
      'Accès, tribunes, billetterie et historique du stade Mustapha Ben Jannet de Monastir.',
  });
}

export default function StadiumPageRoute() {
  return <StadiumGuide />;
}
