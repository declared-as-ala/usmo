import type { Metadata } from 'next';
import { OfficialCatalog } from '../../views/OfficialCatalog';

export const metadata: Metadata = {
  title: 'Boutique Officielle | Union Sportive Monastirienne',
  description: 'Maillots, articles et produits dérivés officiels de l’US Monastir. Réservation en boutique ou retrait en point relais.',
};

export default function BoutiquePageRoute() {
  return <OfficialCatalog />;
}
