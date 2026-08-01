import { PlayerProfile } from '../../../../views/PlayerProfile';
import { fetchPlayerMetadata } from '../../../../lib/server-metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return fetchPlayerMetadata(slug, 'football');
}

export default async function FootballPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlayerProfile sport="football" slug={slug} />;
}
