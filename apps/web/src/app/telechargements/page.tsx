import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DownloadsCenter } from '../../views/DownloadsCenter';

export const metadata: Metadata = {
  title: 'Téléchargements | Union Sportive Monastirienne',
  description: 'Règlements officiels, formulaires d’adhésion, kit presse et documents utiles de l’Union Sportive Monastirienne.',
};

export default function DownloadsPage() {
  return (
    <Suspense fallback={null}>
      <DownloadsCenter />
    </Suspense>
  );
}
