import type { Metadata } from 'next';
import { LegalPage } from '../../views/LegalPage';

export const metadata: Metadata = {
  title: 'Politique de cookies | Union Sportive Monastirienne',
  description: 'Politique de cookies du site officiel de l’Union Sportive Monastirienne (USM).',
};

export default function CookiesPage() {
  return <LegalPage pageKey="cookies" fallbackTitle="Politique de cookies" />;
}
