import React from 'react';
import type { Metadata } from 'next';
import { MediaGallery } from '../../views/MediaGallery';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/media',
    fallbackTitle: 'USM Media Hub | Galerie Photos & Vidéos Officielles',
    fallbackDescription:
      'Explorez la médiathèque officielle de l’US Monastir : reportages exclusifs, résumés vidéo des matchs et galeries photos.',
  });
}

export default function MediaPageRoute() {
  return <MediaGallery />;
}
