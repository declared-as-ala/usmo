import type { Metadata } from 'next';
import { SquadRoster } from '../../views/SquadRoster';
import { buildPageMetadata } from '../../lib/seo/buildMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/football',
    fallbackTitle: 'Équipe Première Football | Union Sportive Monastirienne',
    fallbackDescription:
      'Découvrez l’effectif pro, les statistiques, le staff technique et les performances de l’équipe de football de l’USM.',
  });
}

export default function FootballRosterPage() {
  return <SquadRoster sport="football" />;
}
