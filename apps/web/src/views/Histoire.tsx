'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api-client';
import { Logo } from '../components/Common/Logo';
import { PremiumHeroBackground } from '../components/Common/PremiumHeroBackground';
import {
  Trophy, Shield, Landmark, GraduationCap, Compass, Building2,
  Sparkles, Users2, Heart, Target, Flame, Award, ArrowRight, Crown, CalendarClock,
} from 'lucide-react';

interface HistoryContent {
  heroTitle: string; heroSubtitle: string; heroImage: string;
  cityIntro: string; foundationText: string; footballStory: string; basketballStory: string;
  values: string[]; evolutionFootball: string; evolutionBasketball: string;
}
interface TimelineEvent {
  _id: string; year: string; title: string; description: string;
  sport: 'club' | 'football' | 'basketball' | 'city'; isHighlighted: boolean;
}

const SPORT_BADGE: Record<TimelineEvent['sport'], { label: string; className: string }> = {
  club: { label: 'Club', className: 'bg-usm-blue-primary/15 text-usm-blue-primary border-usm-blue-primary/30' },
  football: { label: 'Football', className: 'bg-usm-blue-primary/15 text-usm-blue-light border-usm-blue-primary/30' },
  basketball: { label: 'Basketball', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  city: { label: 'Monastir', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

const VALUE_ICONS: Record<string, React.ElementType> = {
  'Persévérance': Flame,
  'Unité': Users2,
  'Ambition': Target,
  'Résilience': Shield,
  'Esprit de communauté': Heart,
  'Jeunesse': Sparkles,
  'Excellence': Award,
};

export const Histoire: React.FC = () => {
  const router = useRouter();
  const [content, setContent] = useState<HistoryContent | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [onThisDay, setOnThisDay] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getHistory(), api.getTimeline(), api.getOnThisDay()]).then(([hist, tl, otd]) => {
      if (hist.status === 'fulfilled') setContent(hist.value);
      if (tl.status === 'fulfilled') setTimeline(tl.value || []);
      if (otd.status === 'fulfilled') setOnThisDay(otd.value || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="usm-premium-bg min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-usm-blue-primary border-usm-border rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="usm-premium-bg min-h-screen flex items-center justify-center text-center px-4">
        <p className="text-sm text-slate-500">Contenu de la page Histoire indisponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="usm-premium-bg min-h-screen text-usm-blue-dark pb-20">

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-usm-blue-dark">
        <PremiumHeroBackground imageUrl={content.heroImage || '/fans.png'} focalPoint="center 35%" fit="cover" animate />
        <div className="absolute inset-0 bg-gradient-to-t from-usm-blue-dark via-usm-blue-dark/90 to-usm-blue-dark/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(13,99,255,0.28),transparent_55%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 sm:pt-36 sm:pb-20 w-full">
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-usm-blue-primary text-white font-black tracking-widest px-3 py-1 rounded-full uppercase mb-4">
            <Landmark size={11} /> Depuis 1923
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-wide leading-none mb-4">
            {content.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-white/75 max-w-2xl mb-8">{content.heroSubtitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mb-8">
            {[
              { label: 'Fondé en', value: '1923' },
              { label: 'Histoire', value: '100+ ans' },
              { label: 'Sections', value: 'Foot & Basket' },
              { label: 'Identité', value: 'Fierté de Monastir' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-3 py-2.5 bg-white/[.07] border border-white/15 backdrop-blur-sm">
                <p className="font-display font-black text-lg text-white">{s.value}</p>
                <p className="text-[9px] text-white/60 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#chronologie" className="usm-btn-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
              Explorer la chronologie
            </a>
            <button onClick={() => router.push('/palmares')} className="usm-btn-secondary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
              Voir le palmarès
            </button>
            <button onClick={() => router.push('/legendes')} className="usm-btn-secondary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Crown size={14} /> Légendes du club
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 mt-16">

        {/* ON THIS DAY */}
        {onThisDay.length > 0 && (
          <section className="usm-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <CalendarClock size={18} className="text-usm-blue-primary" />
              <h2 className="font-display font-black text-lg text-usm-blue-dark uppercase">Ce jour dans l’histoire</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {onThisDay.map((ev) => (
                <div key={ev._id} className="rounded-2xl bg-usm-blue-soft p-4">
                  <span className="font-display font-black text-usm-blue-primary text-sm">{ev.year}</span>
                  <h3 className="text-xs font-bold text-usm-blue-dark mt-1 mb-1">{ev.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{ev.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. MONASTIR CITY IDENTITY */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-usm-blue-primary font-bold uppercase">Ville de Monastir</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase mt-2 mb-4">Une cité historique et moderne</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{content.cityIntro}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Landmark, label: 'Ribat & Médina' },
              { icon: Compass, label: 'Marina' },
              { icon: GraduationCap, label: 'Université' },
              { icon: Building2, label: 'Économie & Tourisme' },
            ].map((c) => (
              <div key={c.label} className="usm-card rounded-2xl p-5 flex flex-col items-center text-center gap-2">
                <c.icon size={22} className="text-usm-blue-primary" />
                <span className="text-xs font-bold text-usm-blue-dark">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CLUB FOUNDATION */}
        <section className="usm-card rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-usm-blue-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="shrink-0 flex flex-col items-center relative">
            <Logo size={90} variant="color" />
            <span className="font-display font-black text-5xl text-usm-blue-primary mt-3">1923</span>
          </div>
          <div className="relative">
            <span className="text-[10px] tracking-[0.25em] text-usm-blue-primary font-bold uppercase">Fondation du club</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase mt-2 mb-4">Une institution née par décret royal</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{content.foundationText}</p>
          </div>
        </section>

        {/* 4. TIMELINE */}
        <section id="chronologie" className="scroll-mt-24">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.25em] text-usm-blue-primary font-bold uppercase">Chronologie</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase mt-2">Un siècle en dates clés</h2>
          </div>
          {timeline.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">Aucun événement de chronologie publié.</p>
          ) : (
            <div className="relative border-l border-usm-border pl-8 sm:pl-10 space-y-8 max-w-3xl mx-auto">
              {timeline.map((ev) => (
                <div key={ev._id} className="relative">
                  <span
                    className={`absolute -left-[41px] sm:-left-[49px] top-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      ev.isHighlighted ? 'bg-usm-blue-primary border-usm-blue-primary' : 'bg-usm-blue-soft border-usm-border'
                    }`}
                  >
                    {ev.isHighlighted && <Trophy size={10} className="text-usm-blue-dark" />}
                  </span>
                  <div className={`usm-card rounded-2xl p-5 ${ev.isHighlighted ? 'border-usm-blue-primary/40' : ''}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-display font-black text-usm-blue-primary text-sm">{ev.year}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${SPORT_BADGE[ev.sport].className}`}>
                        {SPORT_BADGE[ev.sport].label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-usm-blue-dark mb-1">{ev.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5 & 6. FOOTBALL / BASKETBALL STORY */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="usm-card rounded-3xl p-8 flex flex-col">
            <span className="inline-flex items-center gap-1.5 text-[9px] bg-usm-blue-primary/20 text-usm-blue-light font-bold uppercase px-2.5 py-1 rounded-full w-fit mb-4">
              ⚽ Football
            </span>
            <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-3">Une histoire de résilience</h2>
            <p className="text-sm text-slate-600 leading-relaxed flex-1">{content.footballStory}</p>
            <button
              onClick={() => router.push('/palmares?sport=football')}
              className="mt-6 text-xs font-bold text-usm-blue-primary uppercase flex items-center gap-1.5 hover:underline w-fit"
            >
              Voir le palmarès football <ArrowRight size={12} />
            </button>
          </div>
          <div className="usm-card rounded-3xl p-8 flex flex-col">
            <span className="inline-flex items-center gap-1.5 text-[9px] bg-orange-500/20 text-orange-400 font-bold uppercase px-2.5 py-1 rounded-full w-fit mb-4">
              🏀 Basketball
            </span>
            <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-3">L’excellence tunisienne et africaine</h2>
            <p className="text-sm text-slate-600 leading-relaxed flex-1">{content.basketballStory}</p>
            <button
              onClick={() => router.push('/palmares?sport=basketball')}
              className="mt-6 text-xs font-bold text-usm-blue-primary uppercase flex items-center gap-1.5 hover:underline w-fit"
            >
              Voir le palmarès basketball <ArrowRight size={12} />
            </button>
          </div>
        </section>

        {/* 7. CLUB VALUES */}
        <section>
          <div className="text-center mb-10">
            <span className="text-[10px] tracking-[0.25em] text-usm-blue-primary font-bold uppercase">Valeurs du club</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase mt-2">Ce qui fait l’identité de l’USM</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {content.values.map((v) => {
              const Icon = VALUE_ICONS[v] || Shield;
              return (
                <div key={v} className="usm-card rounded-2xl p-5 flex flex-col items-center text-center gap-2">
                  <Icon size={20} className="text-usm-blue-primary" />
                  <span className="text-xs font-bold text-usm-blue-dark">{v}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. EVOLUTION */}
        <section>
          <div className="text-center mb-10">
            <span className="text-[10px] tracking-[0.25em] text-usm-blue-primary font-bold uppercase">Aujourd’hui</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase mt-2">Un club en constante évolution</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="usm-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-usm-blue-light uppercase mb-2">⚽ Évolution Football</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{content.evolutionFootball}</p>
            </div>
            <div className="usm-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-orange-400 uppercase mb-2">🏀 Évolution Basketball</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{content.evolutionBasketball}</p>
            </div>
          </div>
          <div className="usm-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-sm font-bold text-usm-blue-dark">Devenir partenaire de l’histoire USM</p>
            <button
              onClick={() => router.push('/sponsors')}
              className="usm-btn-primary px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider shrink-0"
            >
              Découvrir les sponsors
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
