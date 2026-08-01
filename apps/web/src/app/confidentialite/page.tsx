import type { Metadata } from 'next';
import { LegalPage } from '../../views/LegalPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Union Sportive Monastirienne',
  description: 'Politique de confidentialité du site officiel de l’Union Sportive Monastirienne (USM).',
};

export default function ConfidentialitePage() {
  return <LegalPage pageKey="privacy" fallbackTitle="Politique de confidentialité" />;
}
