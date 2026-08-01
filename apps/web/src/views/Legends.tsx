'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { api } from '../lib/api-client';
import { Crown, Star, Trophy, Quote } from 'lucide-react';

interface LegendRow {
  _id: string; name: string; nameAr: string; sport: 'football' | 'basketball' | 'club';
  years: string; role: string; roleAr: string; achievement: string; achievementAr: string;
  bio: string; bioAr: string; image?: string;
}

type Tab = 'all' | 'football' | 'basketball' | 'club';

const TAB_LABELS: Record<Tab, string> = { all: 'Tous', football: 'Football', basketball: 'Basketball', club: 'Club' };

export const Legends: React.FC = () => {
  const [legends, setLegends] = useState<LegendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    api.getLegends().then((data) => setLegends(data || [])).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => (tab === 'all' ? legends : legends.filter((l) => l.sport === tab)),
    [legends, tab]
  );

  if (loading) {
    return (
      <div className="usm-premium-bg min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-usm-blue-primary border-usm-border rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="usm-premium-bg min-h-screen text-usm-blue-dark pb-20">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-usm-border">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-usm-blue-primary/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/40 bg-usm-blue-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-usm-blue-primary mb-5">
            <Crown size={14} /> Panthéon USM
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-black uppercase leading-[0.9] tracking-tight text-usm-blue-dark">
            Les <span className="text-usm-blue-primary">Légendes</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            Joueurs, capitaines et bâtisseurs qui ont marqué à jamais l’histoire de l’Union Sportive Monastirienne.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-10">

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-usm-border bg-usm-blue-soft p-2 w-fit mx-auto">
          {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`min-h-11 shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-usm-blue-primary ${
                tab === key ? 'bg-usm-blue-primary text-white shadow-md' : 'text-slate-600 hover:bg-usm-blue-soft'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-16">Aucune légende publiée pour ce filtre.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visible.map((legend) => (
              <article
                key={legend._id}
                className="group relative overflow-hidden rounded-3xl border border-usm-border bg-white shadow-[0_18px_45px_-32px_rgba(13,99,255,0.25)] transition duration-300 hover:-translate-y-1.5 hover:border-usm-blue-primary/40 hover:shadow-[0_28px_65px_-26px_rgba(13,99,255,0.4)]"
              >
                <div className="flex gap-5 p-6">
                  <div className="relative shrink-0 h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden bg-usm-blue-soft">
                    {legend.image ? (
                      <Image src={legend.image} alt={legend.name} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-usm-blue-primary/40"><Crown size={32} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide mb-2 ${
                      legend.sport === 'football' ? 'bg-usm-blue-primary/15 text-usm-blue-primary' : legend.sport === 'basketball' ? 'bg-orange-500/15 text-orange-500' : 'bg-usm-accent-gold/15 text-usm-accent-gold'
                    }`}>
                      {legend.sport === 'football' ? '⚽ Football' : legend.sport === 'basketball' ? '🏀 Basketball' : '🏛️ Club'}
                    </span>
                    <h3 className="text-base font-black text-usm-blue-dark leading-snug truncate">{legend.name}</h3>
                    <p className="text-xs font-bold text-usm-blue-primary uppercase tracking-wide mt-0.5">{legend.role}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{legend.years}</p>
                  </div>
                </div>
                {legend.achievement && (
                  <p className="mx-6 flex items-start gap-2 text-xs font-bold text-usm-blue-dark bg-usm-blue-soft rounded-xl px-3 py-2.5">
                    <Trophy size={14} className="text-usm-blue-primary shrink-0 mt-0.5" /> {legend.achievement}
                  </p>
                )}
                {legend.bio && (
                  <p className="relative px-6 pb-6 pt-4 text-xs text-slate-600 leading-relaxed border-t border-usm-border mt-4 flex gap-2">
                    <Quote size={14} className="text-usm-blue-primary/30 shrink-0 mt-0.5" /> {legend.bio}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {/* GOLD ACCENT BANNER */}
        <section className="usm-card rounded-2xl p-8 text-center flex flex-col items-center gap-3">
          <Star size={20} className="text-usm-accent-gold" />
          <p className="text-sm sm:text-base font-bold text-usm-blue-dark max-w-xl">
            Une légende se construit saison après saison — l’histoire continue de s’écrire avec chaque génération de joueurs.
          </p>
        </section>
      </div>
    </div>
  );
};
