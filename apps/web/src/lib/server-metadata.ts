import type { Metadata } from 'next';

const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001/api';

export async function fetchPlayerMetadata(slug: string, sport: 'football' | 'basketball'): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/players/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('not found');
    const player = await res.json();
    const sportLabel = sport === 'football' ? 'Football' : 'Basketball';
    return {
      title: `${player.name} | ${sportLabel} US Monastir`,
      description: player.bio || `Profil de ${player.name}, joueur ${sportLabel === 'Football' ? 'de football' : 'de basketball'} de l'US Monastir.`,
      openGraph: player.image ? { images: [{ url: player.image }] } : undefined,
    };
  } catch {
    return { title: 'Joueur | US Monastir' };
  }
}
