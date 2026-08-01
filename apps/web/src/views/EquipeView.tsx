'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import {
  Shield, Search,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

type Sport = 'football' | 'basketball';

interface RosterPlayer {
  _id: string;
  slug: string;
  sport: Sport;
  name: string;
  nameAr: string;
  number: number;
  position: string;
  positionAr: string;
  nationality: string;
  nationalityAr: string;
  image: string;
  stats: Record<string, number | string>;
}

const SPORT_BG: Record<Sport, string> = {
  football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80',
  basketball: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1400&q=80',
};

const SPORT_LOGO: Record<Sport, string> = {
  football: '/logo.webp',
  basketball: '/logoUSM_BASKETBALL_Vector-1-removebg-preview.png',
};

export const EquipeView: React.FC = () => {
  const { language } = useApp();
  const [sport, setSport] = useState<Sport>('football');
  const [allPlayers, setAllPlayers] = useState<RosterPlayer[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [banners, setBanners] = useState<Record<Sport, string>>({
    football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80',
    basketball: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1400&q=80',
  });

  useEffect(() => {
    api.getPlayers().then((data: RosterPlayer[]) => setAllPlayers(data || [])).catch(() => {});
    api.getHomepageSettings()
      .then((settings) => {
        setBanners({
          football: settings?.footballBannerUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80',
          basketball: settings?.basketballBannerUrl || 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1400&q=80',
        });
      })
      .catch(() => {});
  }, []);

  const roster = useMemo(() => allPlayers.filter((p) => p.sport === sport), [allPlayers, sport]);

  const positions = useMemo(
    () => ['All', ...Array.from(new Set(roster.map((p) => p.position)))],
    [roster]
  );

  const filteredRoster = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roster.filter((p) => {
      const matchPos = activeFilter === 'All' || p.position === activeFilter;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.nationality.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q);
      return matchPos && matchSearch;
    });
  }, [roster, activeFilter, search]);

  // Reset position filter when switching sport
  const switchSport = (s: Sport) => {
    setSport(s);
    setActiveFilter('All');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-white text-usm-blue-dark">

      {/* ── Cinematic Hero ── */}
      <section className="relative isolate overflow-hidden min-h-[480px] flex items-end">
        <img
          src={banners[sport]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
          style={{ opacity: 0.75 }}
          key={sport}
        />
        {/* Soft light overlay to ensure text contrast while preserving image details */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/45 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-14 pt-32">
          {/* Sport toggle pill */}
          <div className="inline-flex items-center gap-1 rounded-full border border-usm-border bg-white p-1.5 shadow-md mb-8">
            {(['football', 'basketball'] as Sport[]).map((s) => (
              <button
                key={s}
                onClick={() => switchSport(s)}
                className={`relative flex items-center gap-3 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  sport === s
                    ? 'bg-[#0D63FF] text-white shadow-lg shadow-[#0D63FF]/25'
                    : 'text-slate-600 hover:text-usm-blue-dark hover:bg-slate-100/70'
                }`}
              >
                <img
                  src={SPORT_LOGO[s]}
                  alt={s}
                  className={`h-12 w-12 object-contain transition-all duration-300 ${
                    sport === s ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]' : 'opacity-95'
                  }`}
                />
                {s === 'football'
                  ? tr(language, 'Football', 'Football', 'كرة القدم')
                  : tr(language, 'Basketball', 'Basketball', 'كرة السلة')}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#0D63FF] flex items-center gap-1.5 mb-3">
                <Shield size={12} /> {tr(language, 'Official Roster', 'Effectif Officiel', 'القائمة الرسمية')}
              </p>
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-usm-blue-dark leading-none">
                {tr(language, 'The Squad', "L'Équipe", 'الفريق')}
              </h1>
              <p className="text-sm text-slate-500 mt-4 max-w-xl leading-relaxed">
                {sport === 'football'
                  ? tr(language,
                      'Elite football athletes representing the blue and white colors of US Monastir in the Tunisian Ligue 1.',
                      "Les footballeurs d'élite de l'US Monastir en Ligue 1 Tunisienne.",
                      'نخبة لاعبي كرة القدم الذين يمثلون الاتحاد الرياضي المنستيري في الرابطة المحترفة الأولى.')
                  : tr(language,
                      'The historic BAL champions and dominant forces of Tunisian Pro A basketball.',
                      'Les champions historiques BAL et forces dominantes du basketball tunisien.',
                      'أبطال الدوري الإفريقي التاريخيون والعملاق المسيطر على كرة السلة التونسية.')}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 bg-black/40 border border-usm-border px-6 py-4 rounded-2xl backdrop-blur">
              <Users size={22} className="text-[#0D63FF]" />
              <div>
                <p className="text-3xl font-mono font-black text-[#0D63FF]">{roster.length}</p>
                <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
                  {tr(language, 'Players', 'Joueurs', 'لاعبين')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <section className="sticky top-14 z-30 bg-white/90 backdrop-blur-xl border-b border-usm-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr(language, 'Search player…', 'Chercher un joueur…', 'ابحث عن لاعب…')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-usm-blue-soft border border-usm-border text-sm text-usm-blue-dark placeholder-slate-500 outline-none focus:border-[#0D63FF]/50 transition"
            />
          </div>

          {/* Position filters */}
          <div className="flex flex-wrap gap-1.5">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setActiveFilter(pos)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                  activeFilter === pos
                    ? 'bg-[#0D63FF] text-[#020813]'
                    : 'bg-usm-blue-soft border border-usm-border text-slate-500 hover:text-white hover:bg-usm-blue-soft'
                }`}
              >
                {pos === 'All'
                  ? tr(language, 'All', 'Tous', 'الكل')
                  : language === 'ar'
                  ? (roster.find((p) => p.position === pos)?.positionAr || pos)
                  : pos}
              </button>
            ))}
          </div>

          {filteredRoster.length !== roster.length && (
            <p className="text-[10px] text-slate-500 ml-auto shrink-0">
              {filteredRoster.length} / {roster.length}
            </p>
          )}
        </div>
      </section>

      {/* ── Player Grid ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
        {filteredRoster.length === 0 ? (
          <div className="py-24 text-center">
            <Users size={40} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm">
              {tr(language, 'No players found.', 'Aucun joueur trouvé.', 'لا يوجد لاعبون.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredRoster.map((player, i) => (
              <motion.div
                key={player._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              >
              <Link
                href={`/${player.sport}/joueurs/${player.slug}`}
                className="bg-white border border-usm-border rounded-2xl overflow-hidden group hover:border-[#0D63FF]/40 shadow-lg cursor-pointer transition-all duration-300 flex flex-col"
              >
                {/* Photo */}
                <div className="relative overflow-hidden aspect-[3/4] bg-white">
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  {/* Jersey number */}
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 border border-[#0D63FF]/30 flex items-center justify-center font-mono font-black text-[#0D63FF] text-[11px]">
                    {player.number}
                  </div>
                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[8px] uppercase font-bold tracking-widest text-[#0D63FF] block">
                      {language === 'ar' ? player.positionAr : player.position}
                    </span>
                    <h3 className="text-sm font-bold text-usm-blue-dark mt-0.5 line-clamp-1">
                      {language === 'ar' ? player.nameAr : player.name}
                    </h3>
                  </div>
                </div>
                {/* Stats strip */}
                <div className="p-3 border-t border-usm-border grid grid-cols-3 gap-1 text-center">
                  {Object.entries(player.stats).slice(0, 3).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-[8px] text-slate-500 block uppercase font-semibold truncate">{key}</span>
                      <span className="text-[11px] font-mono font-black text-usm-blue-dark">{val}</span>
                    </div>
                  ))}
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
