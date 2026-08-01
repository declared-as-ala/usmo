import type { Metadata } from 'next';
import { LegalPage } from '../../views/LegalPage';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation | Union Sportive Monastirienne',
  description: 'Conditions d’utilisation du site officiel de l’Union Sportive Monastirienne (USM).',
};

export default function ConditionsUtilisationPage() {
  return <LegalPage pageKey="terms" fallbackTitle="Conditions d’utilisation" />;
}
