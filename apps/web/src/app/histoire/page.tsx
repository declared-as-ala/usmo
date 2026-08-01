import type { Metadata } from 'next';
import { Histoire } from '../../views/Histoire';

export const metadata: Metadata = {
  title: 'Histoire de l’US Monastir | Union Sportive Monastirienne',
  description: 'Depuis 1923, découvrez l’histoire de l’Union Sportive Monastirienne : fondation, valeurs, football, basketball et un siècle de fierté pour Monastir.',
};

export default function HistoirePage() {
  return <Histoire />;
}
