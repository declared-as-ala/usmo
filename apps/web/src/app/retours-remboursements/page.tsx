import type { Metadata } from 'next';
import { LegalPage } from '../../views/LegalPage';

export const metadata: Metadata = {
  title: 'Retours & Remboursements | Union Sportive Monastirienne',
  description: 'Politique de retours et remboursements de la boutique officielle de l’Union Sportive Monastirienne (USM).',
};

export default function RetoursRemboursementsPage() {
  return <LegalPage pageKey="returns" fallbackTitle="Politique de Retours & Remboursements" />;
}
