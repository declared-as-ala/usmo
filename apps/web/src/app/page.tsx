import React from 'react';
import type { Metadata } from 'next';
import { Home } from '../views/Home';
import { buildPageMetadata } from '../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    fallbackTitle: 'Union Sportive Monastirienne | Site Officiel',
    fallbackDescription:
      "Bienvenue sur la plateforme officielle de l'Union Sportive Monastirienne (USM). Suivez le football, le basketball, le Match Center en direct et la boutique du club.",
  });
}

export default function HomeRoute() {
  return <Home />;
}
