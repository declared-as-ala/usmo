import type { Metadata } from 'next';
import { SquadRoster } from '../../views/SquadRoster';

export const metadata: Metadata = {
  title: 'Effectif Basketball | Union Sportive Monastirienne',
  description: 'Découvrez la liste officielle des joueurs de basketball de l’US Monastir : meneurs, arrières, ailiers et pivots.',
};

export default function BasketballRosterPage() {
  return <SquadRoster sport="basketball" />;
}
