import type { Metadata } from 'next';
import { SquadRoster } from '../../views/SquadRoster';

export const metadata: Metadata = {
  title: 'Effectif Football | Union Sportive Monastirienne',
  description: 'Découvrez la liste officielle des joueurs de football de l’US Monastir : gardiens de but, défenseurs, milieux de terrain et attaquants.',
};

export default function FootballRosterPage() {
  return <SquadRoster sport="football" />;
}
