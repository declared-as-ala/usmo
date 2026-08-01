import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Palmares } from '../../views/Palmares';

export const metadata: Metadata = {
  title: 'Palmarès & Héritage | Union Sportive Monastirienne',
  description: 'Les titres, exploits et moments historiques de l’Union Sportive Monastirienne en football et basketball, dont le sacre continental BAL 2022.',
};

export default function PalmaresPage() {
  return (
    <Suspense fallback={null}>
      <Palmares />
    </Suspense>
  );
}
