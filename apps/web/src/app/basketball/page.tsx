import type { Metadata } from 'next';
import { BasketballStandingsView } from '../../views/BasketballStandingsView';

export const metadata: Metadata = {
  title: 'Classement Basketball Pro A | Union Sportive Monastirienne',
  description: 'Consultez le classement officiel de l’US Monastir Basketball pour la saison 2026-2027 en Ligue Pro A.',
};

export default function BasketballRosterPage() {
  return <BasketballStandingsView />;
}
