'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import { ArrowLeft, BarChart3, User, Loader2, ShieldAlert, Sparkles, Award, Calendar, Activity } from 'lucide-react';

interface PlayerDetail {
  _id: string;
  slug: string;
  sport: 'football' | 'basketball';
  name: string;
  displayName?: string;
  nameAr?: string;
  number: number;
  position: string;
  secondaryPosition?: string;
  positionAr?: string;
  nationality: string;
  nationalityAr?: string;
  image: string;
  stats?: Record<string, number | string>;
  bio?: string;
  bioAr?: string;
  height?: string;
  weight?: string;
  age?: number | null;
  preferredFoot?: string;
  season?: string;
  club?: {
    joinedAt?: string;
    contractEndAt?: string;
    previousClub?: string;
    isCaptain?: boolean;
    isViceCaptain?: boolean;
  };
}

export function PlayerProfile({ sport, slug }: { sport: 'football' | 'basketball'; slug: string }) {
  const { language } = useApp();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.getPlayerBySlug(slug)
      .then((data: PlayerDetail) => {
        if (!cancelled) {
          setPlayer(data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  const backHref = `/${sport}`;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#071328] px-4 py-24 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-usm-teal-accent mb-3" size={36} />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Chargement de la fiche athlète…</p>
      </main>
    );
  }

  if (error || !player) {
    return (
      <main className="min-h-[70vh] bg-white px-4 py-24 text-center text-usm-blue-dark">
        <ShieldAlert className="mx-auto text-usm-blue-primary" size={42} />
        <h1 className="mt-5 text-2xl font-black">{tr(language, 'Player not found', 'Joueur introuvable', 'اللاعب غير موجود')}</h1>
        <p className="mt-2 text-xs text-slate-500">Ce profil n’existe pas ou a été archivé.</p>
        <Link href={backHref} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-usm-blue-primary hover:underline">
          <ArrowLeft size={16} /> {tr(language, 'Back to squad', "Retour à l'effectif", 'العودة للفريق')}
        </Link>
      </main>
    );
  }

  const playerName = language === 'ar' && player.nameAr ? player.nameAr : player.displayName || player.name;
  const position = language === 'ar' && player.positionAr ? player.positionAr : player.position;
  const nationality = language === 'ar' && player.nationalityAr ? player.nationalityAr : player.nationality;
  const bio = language === 'ar' && player.bioAr ? player.bioAr : player.bio;

  return (
    <main className="min-h-screen bg-usm-blue-soft/30 text-usm-blue-dark pb-24">
      {/* Header Banner Lockup */}
      <section className="relative overflow-hidden bg-[#071328] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-[#071328]/90 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-usm-teal-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} /> {tr(language, 'Back to squad', "Retour à l'effectif", 'العودة للفريق')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Player Portrait Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-[3/4] w-full max-w-sm rounded-3xl overflow-hidden bg-slate-900 border-2 border-white/10 shadow-2xl">
                {player.image ? (
                  <img
                    src={player.image}
                    alt={player.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-600">
                    <User size={64} />
                    <span className="text-xs uppercase font-bold tracking-widest text-slate-500 mt-3">US Monastir</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-[#071328]/90 border border-white/10 flex items-center justify-center font-mono font-black text-lg text-white shadow-lg">
                  #{player.number}
                </div>
                {player.club?.isCaptain && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-lg">
                    Capitaine
                  </div>
                )}
              </div>
            </div>

            {/* Right: Player Key Identity Details */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-usm-teal-accent/15 text-usm-teal-accent border border-usm-teal-accent/30">
                <Sparkles size={12} /> {sport === 'football' ? 'Football' : 'Basketball'} · {player.season || '2026-2027'}
              </span>

              <h1 className="mt-3 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
                {playerName}
              </h1>

              <div className="mt-2 text-base font-bold text-usm-teal-accent uppercase tracking-wider">
                {position} {player.secondaryPosition ? `· ${player.secondaryPosition}` : ''}
              </div>

              {bio && (
                <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {bio}
                </p>
              )}

              {/* Physical Attributes Strip */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nationalité</span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">{nationality}</span>
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Taille</span>
                  <span className="text-xs font-bold text-white mt-1 block">{player.height || '—'}</span>
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Poids</span>
                  <span className="text-xs font-bold text-white mt-1 block">{player.weight || '—'}</span>
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Âge</span>
                  <span className="text-xs font-bold text-white mt-1 block">{player.age ? `${player.age} ans` : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {player.stats && Object.keys(player.stats).length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="bg-white rounded-3xl border border-usm-border p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <BarChart3 className="text-usm-blue-primary" size={20} />
              <h2 className="text-base font-bold uppercase tracking-wider text-usm-blue-dark">
                Statistiques Officielles 2026-2027
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(player.stats).map(([k, v]) => (
                <div key={k} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block truncate">
                    {k}
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-display text-usm-blue-dark mt-1 block">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
