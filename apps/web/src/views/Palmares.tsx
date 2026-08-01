'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../lib/api-client';
import { Trophy, Globe2, CalendarDays, ShieldCheck, MapPin, AlertTriangle, ArrowDown, Crown, Star } from 'lucide-react';

interface TrophyRow {
  _id: string; sport: 'football' | 'basketball'; competition: string;
  achievementType: string; titleCount: number; years: string; description: string;
  isFeatured: boolean; verified: boolean; sourceNote?: string;
}
interface SeasonRow {
  _id: string; sport: 'football' | 'basketball'; type: 'league' | 'continental';
  season: string; competition?: string; leaguePosition?: string;
  nationalCompetitions?: string; internationalCompetitions?: string;
  stageReached?: string; notableOpponents?: string; achievementSummary?: string;
}

type Tab = 'all' | 'football' | 'basketball' | 'africa' | 'seasons';

const TAB_LABELS: Record<Tab, string> = {
  all: 'Tout', football: 'Football', basketball: 'Basketball', africa: 'Afrique', seasons: 'Saisons',
};

export const Palmares: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSport = searchParams.get('sport');
  const [tab, setTab] = useState<Tab>(initialSport === 'football' || initialSport === 'basketball' ? initialSport : 'all');

  const [trophies, setTrophies] = useState<TrophyRow[]>([]);
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [pageContent, setPageContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getTrophies(), api.getSeasonPerformance(), api.getPalmaresPage()]).then(([tr, se, pc]) => {
      if (tr.status === 'fulfilled') setTrophies(tr.value || []);
      if (se.status === 'fulfilled') setSeasons(se.value || []);
      if (pc.status === 'fulfilled') setPageContent(pc.value);
      setLoading(false);
    });
  }, []);

  const footballTrophies = useMemo(() => trophies.filter((t) => t.sport === 'football'), [trophies]);
  const basketballTrophies = useMemo(() => trophies.filter((t) => t.sport === 'basketball'), [trophies]);
  const footballLeague = useMemo(() => seasons.filter((s) => s.sport === 'football' && s.type === 'league'), [seasons]);
  const footballContinental = useMemo(() => seasons.filter((s) => s.sport === 'football' && s.type === 'continental'), [seasons]);
  const basketballSeasons = useMemo(() => seasons.filter((s) => s.sport === 'basketball'), [seasons]);

  const footballTitleCount = footballTrophies.filter((t) => t.achievementType === 'Winner' || t.achievementType === 'Champion').reduce((a, t) => a + t.titleCount, 0);
  const basketballTitleCount = basketballTrophies.filter((t) => t.achievementType === 'Winner' || t.achievementType === 'Champion').reduce((a, t) => a + t.titleCount, 0);
  const africanAppearances = footballContinental.length;
  const balChampion = basketballTrophies.some((t) => t.competition.includes('BAL') && t.achievementType === 'Champion');

  const visibleTrophies = tab === 'all' ? trophies : tab === 'football' ? footballTrophies : tab === 'basketball' ? basketballTrophies : [];

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
      <section className="relative min-h-[72vh] overflow-hidden border-b border-usm-border">
        <Image
          src={pageContent?.heroImage || '/heritage/trophy-museum.png'}
          alt="Collection de trophées dans le musée de l'US Monastir"
          fill
          priority
          sizes="100vw"
          unoptimized={Boolean(pageContent?.heroImage)}
          className="object-cover object-center brightness-110 contrast-110 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/55 to-transparent" />
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-usm-blue-primary/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-end px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pb-20">
          <div className="max-w-2xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/40 bg-usm-blue-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-usm-blue-primary backdrop-blur-md"><Crown size={14} /> {pageContent?.heroBadge || 'Salle des trophées'}</span>
            <h1 className="font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-usm-blue-dark sm:text-7xl lg:text-8xl">
              {(() => {
                const title = pageContent?.heroTitle?.trim() || 'Notre Palmarès';
                const words = title.split(' ');
                const last = words.pop();
                return words.length > 0 ? <>{words.join(' ')}<br /><span className="text-usm-blue-primary">{last}</span></> : <span className="text-usm-blue-primary">{last}</span>;
              })()}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-700">
              {pageContent?.heroSubtitle?.trim() || 'Chaque coupe raconte un combat. Chaque titre porte la fierté de Monastir, de la Tunisie jusqu’au sommet du continent.'}
            </p>
            <a href="#collection" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-usm-blue-dark border border-usm-border transition hover:bg-usm-blue-primary hover:text-white hover:border-usm-blue-primary focus:outline-none focus:ring-2 focus:ring-usm-blue-primary focus:ring-offset-2">
              {pageContent?.heroCtaText?.trim() || 'Explorer la collection'} <ArrowDown size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-8 grid max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {[[footballTitleCount, 'Titres football'], [basketballTitleCount, 'Titres basketball'], [africanAppearances, 'Campagnes africaines'], [balChampion ? '2022' : '—', 'Champion BAL']].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-usm-border bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6"><p className="font-display text-3xl font-black text-usm-blue-primary sm:text-4xl">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p></div>
        ))}
      </section>

      <div id="collection" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-16">

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-usm-border bg-usm-blue-soft p-2">
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

        {/* TROPHY GRID (all / football / basketball) */}
        {(tab === 'all' || tab === 'football' || tab === 'basketball') && (
          <section>
            {visibleTrophies.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">Aucun trophée publié pour ce filtre.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTrophies.map((trophy) => (
                  <article
                    key={trophy._id}
                    className={`group relative overflow-hidden rounded-3xl border bg-white p-7 shadow-[0_18px_45px_-32px_rgba(13,99,255,0.25)] transition duration-300 hover:-translate-y-1.5 ${
                      trophy.isFeatured ? 'border-usm-blue-primary/50 shadow-[0_22px_55px_-28px_rgba(13,99,255,0.35)]' : 'border-usm-border hover:border-usm-blue-primary/40'
                    } hover:shadow-[0_28px_65px_-26px_rgba(13,99,255,0.4)]`}
                  >
                    <span className={`absolute inset-x-0 top-0 h-1 ${trophy.sport === 'football' ? 'bg-usm-blue-primary' : 'bg-orange-500'}`} />
                    {trophy.isFeatured && (
                      <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-usm-blue-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-usm-blue-primary">
                        <Star size={11} className="fill-usm-blue-primary" /> Phare
                      </span>
                    )}
                    {!trophy.verified && (
                      <span title={trophy.sourceNote} className="absolute top-4 right-4 text-amber-500">
                        <AlertTriangle size={14} />
                      </span>
                    )}
                    <div className="pointer-events-none absolute -right-8 -top-4 text-usm-blue-dark/[0.04] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"><Trophy size={150} /></div>
                    <div className="relative flex items-center justify-between gap-2 mb-8 mt-1">
                      <span className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        trophy.sport === 'football' ? 'bg-usm-blue-primary/15 text-usm-blue-primary' : 'bg-orange-500/15 text-orange-500'
                      }`}>
                        <Trophy size={21} />
                      </span>
                      <span className="rounded-full border border-usm-border bg-white px-3 py-1.5 text-[9px] font-bold uppercase text-[#5B6B82] tracking-wide">
                        {trophy.sport === 'football' ? 'Football' : 'Basketball'}
                      </span>
                    </div>
                    <p className="relative font-display text-5xl font-black text-usm-blue-dark/10">{String(trophy.titleCount).padStart(2, '0')}</p>
                    <h3 className="relative -mt-2 text-lg font-black text-usm-blue-dark mb-2 leading-snug">{trophy.competition}</h3>
                    <p className="relative text-xs text-usm-blue-primary font-black uppercase mb-3 tracking-wider">
                      {trophy.achievementType} {trophy.titleCount > 1 ? `× ${trophy.titleCount}` : ''}
                    </p>
                    <p className="relative inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7A8AA0] mb-3">
                      <CalendarDays size={12} className="text-usm-blue-primary/60" /> {trophy.years}
                    </p>
                    {trophy.description && <p className="relative text-sm text-[#5B6B82] leading-6 border-t border-usm-border pt-4">{trophy.description}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FOOTBALL SEASON TABLE */}
        {(tab === 'football' || tab === 'seasons') && (
          <section>
            <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-5 flex items-center gap-2">
              <CalendarDays size={18} className="text-usm-blue-primary" /> Football — 5 dernières saisons
            </h2>
            <div className="usm-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-usm-blue-soft text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Saison</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Faits marquants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {footballLeague.map((row) => (
                      <tr key={row._id} className={row.leaguePosition?.includes('2e') || row.leaguePosition?.includes('3e') ? 'bg-usm-blue-primary/5' : ''}>
                        <td className="px-4 py-3 font-bold text-usm-blue-dark whitespace-nowrap">{row.season}</td>
                        <td className="px-4 py-3 text-usm-blue-primary font-bold whitespace-nowrap">{row.leaguePosition}</td>
                        <td className="px-4 py-3 text-slate-600">{row.achievementSummary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* AFRICAN COMPETITIONS (football) */}
        {(tab === 'africa' || tab === 'seasons') && (
          <section>
            <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-5 flex items-center gap-2">
              <Globe2 size={18} className="text-usm-blue-primary" /> Compétitions africaines — Football
            </h2>
            <div className="usm-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-usm-blue-soft text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Saison</th>
                      <th className="px-4 py-3">Compétition</th>
                      <th className="px-4 py-3">Stade atteint</th>
                      <th className="px-4 py-3">Adversaires notables</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {footballContinental.map((row) => (
                      <tr key={row._id}>
                        <td className="px-4 py-3 font-bold text-usm-blue-dark whitespace-nowrap">{row.season}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.competition}</td>
                        <td className="px-4 py-3 text-usm-blue-primary font-bold whitespace-nowrap">{row.stageReached}</td>
                        <td className="px-4 py-3 text-slate-500">{row.notableOpponents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* BASKETBALL SEASON TABLE */}
        {(tab === 'basketball' || tab === 'seasons') && (
          <section>
            <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-orange-400" /> Basketball — Performance par saison
            </h2>
            <div className="usm-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-usm-blue-soft text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Saison</th>
                      <th className="px-4 py-3">National</th>
                      <th className="px-4 py-3">International</th>
                      <th className="px-4 py-3">Résumé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {basketballSeasons.map((row) => (
                      <tr key={row._id} className={row.internationalCompetitions?.includes('Champion') ? 'bg-usm-blue-primary/10' : ''}>
                        <td className="px-4 py-3 font-bold text-usm-blue-dark whitespace-nowrap">{row.season}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.nationalCompetitions}</td>
                        <td className={`px-4 py-3 font-bold whitespace-nowrap ${row.internationalCompetitions?.includes('Champion') ? 'text-usm-blue-primary' : 'text-slate-600'}`}>
                          {row.internationalCompetitions}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{row.achievementSummary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* SPONSOR CTA */}
        <section className="usm-card rounded-2xl p-8 text-center">
          <MapPin size={20} className="text-usm-blue-primary mx-auto mb-3" />
          <p className="text-sm sm:text-base font-bold text-usm-blue-dark mb-5 max-w-xl mx-auto">
            Associez votre marque à un club centenaire, champion national et africain.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => router.push('/sponsors')} className="usm-btn-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
              Devenir partenaire
            </button>
            <button onClick={() => router.push('/sponsors')} className="usm-btn-secondary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
              Découvrir les sponsors
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
