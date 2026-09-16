import type { Metadata } from 'next';
import { LegalPage } from '../../views/LegalPage';

export const metadata: Metadata = {
  title: 'Annulation de Commande | Union Sportive Monastirienne',
  description: 'Politique d’annulation de commande de la boutique officielle de l’Union Sportive Monastirienne (USM).',
};

export default function AnnulationCommandePage() {
  return <LegalPage pageKey="cancellation" fallbackTitle="Politique d’Annulation de Commande" />;
}
