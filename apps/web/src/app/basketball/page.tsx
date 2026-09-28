import type { Metadata } from 'next';
import { SquadRoster } from '../../views/SquadRoster';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/basketball',
    fallbackTitle: 'Section Basketball | US Monastir Championne BAL & Pro A',
    fallbackDescription:
      'L’équipe légendaire de basket de l’USM : effectif, palmarès Basketball Africa League (BAL), calendrier et effectif.',
  });
}

export default function BasketballRosterPage() {
  return <SquadRoster sport="basketball" />;
}
