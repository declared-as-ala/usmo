import { PlayerProfile } from '../../../../views/PlayerProfile';
import { fetchPlayerMetadata } from '../../../../lib/server-metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return fetchPlayerMetadata(slug, 'basketball');
}

export default async function BasketballPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlayerProfile sport="basketball" slug={slug} />;
}
