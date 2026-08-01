'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import { ArrowLeft, BarChart3, User, Loader2, ShieldAlert } from 'lucide-react';

interface PlayerDetail {
  _id: string;
  slug: string;
  sport: 'football' | 'basketball';
  name: string;
  nameAr: string;
  number: number;
  position: string;
  positionAr: string;
  nationality: string;
  nationalityAr: string;
  image: string;
  stats: Record<string, number | string>;
  bio: string;
  bioAr: string;
  height: string;
  weight: string;
  age: number | null;
}

export function PlayerProfile({ sport, slug }: { sport: 'football' | 'basketball'; slug: string }) {
  const { language } = useApp();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.getPlayerBySlug(slug)
      .then((data: PlayerDetail) => { if (!cancelled) setPlayer(data); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [slug]);

  const backHref = `/${sport}`;

  if (error) {
    return (
      <main className="min-h-[70vh] usm-premium-bg px-4 py-24 text-center text-usm-blue-dark">
        <ShieldAlert className="mx-auto text-usm-blue-primary" size={42} />
        <h1 className="mt-5 text-2xl font-black">{tr(language, 'Player not found', 'Joueur introuvable', 'اللاعب غير موجود')}</h1>
        <Link href={backHref} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-usm-blue-primary">
          <ArrowLeft size={16} /> {tr(language, 'Back to squad', "Retour à l'effectif", 'العودة للفريق')}
        </Link>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="min-h-screen usm-premium-bg px-4 py-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-usm-blue-primary" size={28} />
      </main>
    );
  }

  const name = language === 'ar' ? player.nameAr : player.name;
  const position = language === 'ar' ? player.positionAr : player.position;
  const nationality = language === 'ar' ? player.nationalityAr : player.nationality;
  const bio = language === 'ar' ? player.bioAr : player.bio;

  return (
    <main className="min-h-screen usm-premium-bg text-usm-blue-dark">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#5B6B82] hover:text-usm-blue-primary">
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {sport === 'football'
            ? tr(language, 'Football squad', 'Effectif football', 'فريق كرة القدم')
            : tr(language, 'Basketball squad', 'Effectif basketball', 'فريق كرة السلة')}
        </Link>

        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
          {/* Portrait */}
          <div className="relative overflow-hidden rounded-3xl border border-[#DDE8F8] bg-white shadow-sm">
            <div className="relative aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={player.image} alt={name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
              <div className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/85 border border-usm-blue-primary/30 font-mono text-lg font-black text-usm-blue-primary">
                #{player.number}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/25 bg-usm-blue-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-usm-blue-primary">
                {position}
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{name}</h1>
              <p className="mt-2 text-sm text-[#5B6B82]">{nationality}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: tr(language, 'Age', 'Âge', 'العمر'), value: player.age ? `${player.age}` : '—' },
                { label: tr(language, 'Height', 'Taille', 'الطول'), value: player.height || '—' },
                { label: tr(language, 'Weight', 'Poids', 'الوزن'), value: player.weight || '—' },
                { label: tr(language, 'Number', 'Numéro', 'الرقم'), value: `#${player.number}` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#DDE8F8] bg-white p-3 text-center">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#7A8AA0]">{item.label}</span>
                  <span className="mt-1 block font-mono text-sm font-black text-usm-blue-dark">{item.value}</span>
                </div>
              ))}
            </div>

            {bio && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-[#5B6B82]">
                  <User size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tr(language, 'Biography', 'Biographie', 'السيرة الذاتية')}</span>
                </div>
                <p className="text-sm leading-7 text-[#33455F]">{bio}</p>
              </div>
            )}

            {Object.keys(player.stats).length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-[#5B6B82]">
                  <BarChart3 size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tr(language, 'Season statistics', 'Statistiques de la saison', 'إحصائيات الموسم')}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {Object.entries(player.stats).map(([key, val]) => (
                    <div key={key} className="rounded-2xl border border-[#DDE8F8] bg-white p-3 text-center">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[#7A8AA0]">{key}</span>
                      <span className="mt-1 block font-mono text-base font-black text-usm-blue-primary">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
