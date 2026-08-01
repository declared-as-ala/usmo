import type { Metadata } from 'next';
import { Newsroom } from '../../views/Newsroom';

export const metadata: Metadata = {
  title: 'Actualités USM | Union Sportive Monastirienne',
  description: 'Toute l’actualité officielle de l’US Monastir : football, basketball, communiqués, interviews et analyses.',
};

export default function ActualitesPage() {
  return <Newsroom />;
}
