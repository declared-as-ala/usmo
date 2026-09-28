import React from 'react';
import type { Metadata } from 'next';
import { MatchCenter } from '../../views/MatchCenter';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/matchs',
    fallbackTitle: 'Match Center US Monastir | Calendrier, Résultats & Classement',
    fallbackDescription:
      'Calendrier des rencontres, scores en direct, feuilles de match et classement officiel en Ligue 1 tunisienne et basketball Pro A.',
  });
}

export default function MatchsPageRoute() {
  return <MatchCenter />;
}
