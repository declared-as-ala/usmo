import React from 'react';
import type { Metadata } from 'next';
import { SponsorHub } from '../../views/SponsorHub';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/sponsors',
    fallbackTitle: 'Partenaires & Sponsors Officiels | US Monastir',
    fallbackDescription:
      'Découvrez les partenaires majeurs, officiels et institutionnels qui soutiennent l’Union Sportive Monastirienne.',
  });
}

export default function SponsorsPageRoute() {
  return <SponsorHub />;
}
