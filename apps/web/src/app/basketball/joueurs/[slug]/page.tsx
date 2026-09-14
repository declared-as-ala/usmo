import type { Metadata } from 'next';
import { PlayerProfile } from '../../../../views/PlayerProfile';
import { buildPageMetadata } from '../../../../lib/seo/buildMetadata';
import { buildPersonPlayerSchema } from '../../../../lib/seo/buildStructuredData';
import { StructuredDataScript } from '../../../../components/Seo/StructuredDataScript';

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchPlayer(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/players/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const player = await fetchPlayer(slug);

  const fallbackTitle = player
    ? `${player.name} — Basketball | US Monastir`
    : 'Joueur de Basketball | Union Sportive Monastirienne';
  const fallbackDescription = player
    ? player.bio || `Profil, statistiques et actualités de ${player.name}, joueur de basketball de l'US Monastir championne BAL.`
    : "Profil officiel du joueur de basketball de l'US Monastir.";

  return buildPageMetadata({
    path: `/basketball/joueurs/${slug}`,
    fallbackTitle,
    fallbackDescription,
    fallbackImage: player?.image,
    type: 'website',
  });
}

export default async function BasketballPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await fetchPlayer(slug);

  const structuredData = player
    ? buildPersonPlayerSchema({
        name: player.name,
        sport: 'basketball',
        position: player.position || 'Joueur',
        slug,
        image: player.image || '/logo.webp',
        number: player.number,
        nationality: player.nationality,
      })
    : null;

  return (
    <>
      {structuredData && <StructuredDataScript data={structuredData} />}
      <PlayerProfile sport="basketball" slug={slug} />
    </>
  );
}
