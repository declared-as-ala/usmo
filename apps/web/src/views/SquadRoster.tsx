'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import { Shield, Loader2, Users, ArrowRight } from 'lucide-react';

interface RosterPlayer {
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
}

interface SquadRosterProps {
  sport: 'football' | 'basketball';
}

export const SquadRoster: React.FC<SquadRosterProps> = ({ sport }) => {
  const { language } = useApp();
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [bannerUrl, setBannerUrl] = useState(
    sport === 'football'
      ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=1200&q=80'
  );

  useEffect(() => {
    let cancelled = false;

    const fetchRoster = async () => {
      try {
        if (sport === 'football') {
          // STRICT DIRECTIVE: Only display players from external API-Football, do NOT show database players
          const apiFootballRes = await api.getFootballSquad().catch(() => null);
          const externalRoster: RosterPlayer[] = [];

          if (apiFootballRes && apiFootballRes.players && apiFootballRes.players.length > 0) {
            for (const p of apiFootballRes.players) {
              const pSlug = p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `player-${p.id}`;
              const pImage = p.photo || '/moez_ben_cherifia.png';
              externalRoster.push({
                _id: `apifootball_${p.id}`,
                slug: pSlug,
                sport: 'football',
                name: p.name,
                nameAr: p.name,
                number: p.number || 0,
                position: p.positionGroup || p.position || 'Milieux',
                positionAr: p.positionGroup || p.position || 'Milieux',
                nationality: 'Tunisian',
                nationalityAr: 'تونسي',
                image: pImage,
                stats: {
                  Age: p.age ? `${p.age} ans` : '-',
                  Poste: p.position || '-',
                },
              });
            }
          }

          if (!cancelled) setRoster(externalRoster);
          return;
        }

        // Basketball or default: fetch DB players
        const dbPlayers: RosterPlayer[] = await api.getPlayers(sport).catch(() => []);
        if (!cancelled) setRoster(dbPlayers || []);
      } catch (err) {
        if (!cancelled) setRoster([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRoster();

    api.getHomepageSettings()
      .then((settings) => {
        if (cancelled) return;
        if (sport === 'football' && settings?.footballBannerUrl) setBannerUrl(settings.footballBannerUrl);
        else if (sport === 'basketball' && settings?.basketballBannerUrl) setBannerUrl(settings.basketballBannerUrl);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [sport]);

  const positions = ['All', ...new Set(roster.map((p) => p.position))];
  const filteredRoster = roster.filter((p) => activeFilter === 'All' || p.position === activeFilter);

  return (
    <div className="min-h-screen bg-white text-usm-blue-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Cinematic Header Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-usm-border p-8 sm:p-12 bg-gradient-to-r from-white to-usm-blue-soft shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-[0.65] contrast-110 saturate-110 pointer-events-none opacity-60 mix-blend-overlay"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
          <div className="absolute -top-16 -right-16 w-[300px] h-[300px] bg-usm-blue-primary/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
            <div className="text-center md:text-left rtl:text-right">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-usm-blue-primary flex items-center justify-center md:justify-start gap-1.5 mb-2">
                <Shield size={12} /> {tr(language, 'Season 2026–2027 • Official Roster', 'Saison 2026–2027 • Effectif Officiel', 'الموسم 2026-2027 • قائمة اللاعبين الرسمية')}
              </span>
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-wider text-usm-blue-dark">
                  {sport === 'football'
                    ? tr(language, 'Football Squad', 'Effectif Football', 'فريق كرة القدم')
                    : tr(language, 'Basketball Squad', 'Effectif Basketball', 'فريق كرة السلة')}
                </h1>
                <span className="bg-usm-blue-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                  2026 / 2027
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-xl mt-3 leading-relaxed">
                {sport === 'football'
                  ? tr(language, 'Discover the elite football athletes representing US Monastir for the 2026-2027 Tunisian Ligue 1 season.', 'Découvrez les footballeurs d\'élite représentant l\'US Monastir pour la saison 2026-2027 de Ligue 1 Tunisienne.', 'اكتشف نخبة لاعبي كرة القدم الذين يمثلون ألوان الاتحاد الرياضي المنستيري لموسم 2026-2027.')
                  : tr(language, 'Meet the elite basketball squad representing US Monastir for the 2026-2027 Tunisian Pro A and continental campaigns.', 'Rencontrez l\'effectif d\'élite basketball représentant l\'US Monastir pour la saison 2026-2027 en Pro A et compétitions continentales.', 'تعرّف على نخبة لاعبي كرة السلة الذين يمثلون الاتحاد الرياضي المنستيري لموسم 2026-2027.')}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 bg-black/35 border border-usm-border px-6 py-4 rounded-2xl backdrop-blur">
              <span className="text-3xl font-mono font-black text-usm-blue-primary">{roster.length}</span>
              <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
                {tr(language, 'Registered Players', 'Athlètes Enregistrés', 'اللاعبين المسجلين')}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center"><Loader2 className="animate-spin text-usm-blue-primary" /></div>
        ) : roster.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-12">
            {tr(language, 'Roster coming soon.', 'Effectif bientôt disponible.', 'القائمة قريباً.')}
          </p>
        ) : (
          <>
            {/* Position Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start border-b border-usm-border pb-4">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setActiveFilter(pos)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                    activeFilter === pos
                      ? 'bg-usm-blue-primary text-white shadow-lg shadow-usm-blue-primary/10'
                      : 'bg-usm-blue-soft border border-usm-border text-slate-500 hover:text-white hover:bg-usm-blue-soft'
                  }`}
                >
                  {pos === 'All'
                    ? tr(language, 'All Positions', 'Tous', 'الكل')
                    : language === 'ar'
                      ? (roster.find((p) => p.position === pos)?.positionAr || pos)
                      : pos}
                </button>
              ))}
            </div>

            {/* Enhanced Compact Players Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {filteredRoster.map((player) => (
                <Link
                  key={player._id}
                  href={`/${sport}/joueurs/${player.slug}`}
                  className="bg-white/95 border border-slate-200/90 rounded-2xl overflow-hidden group hover:border-usm-blue-primary/60 hover:shadow-xl hover:-translate-y-1 shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden aspect-[4/4.5] bg-gradient-to-b from-slate-50 to-usm-blue-soft/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    {/* Compact Jersey Badge */}
                    <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-usm-blue-primary text-white flex items-center justify-center font-mono font-black text-xs shadow-md border border-white/20">
                      #{player.number}
                    </div>

                    {/* Name & Position Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                      <span className="inline-block text-[8px] uppercase font-black tracking-wider text-white bg-usm-blue-primary/80 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                        {language === 'ar' ? player.positionAr : player.position}
                      </span>
                      <h3 className="text-xs font-black text-white truncate drop-shadow-sm group-hover:text-amber-300 transition-colors">
                        {language === 'ar' ? player.nameAr : player.name}
                      </h3>
                    </div>
                  </div>

                  {/* Compact Stats Bar */}
                  <div className="px-2.5 py-1.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono font-bold text-slate-600">
                    {Object.entries(player.stats).slice(0, 2).map(([key, val]) => (
                      <span key={key} className="truncate">
                        <span className="text-slate-400 font-normal uppercase text-[8px] mr-1">{key}:</span>
                        <span className="text-usm-blue-dark font-black">{val}</span>
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Link
                href={`/${sport}/staff`}
                className="inline-flex items-center gap-2 rounded-full border border-usm-border bg-usm-blue-soft px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-usm-blue-dark transition-colors hover:border-usm-blue-primary hover:text-usm-blue-primary"
              >
                <Users size={14} />
                {tr(language, 'View technical staff', 'Voir le staff technique', 'مشاهدة الطاقم الفني')}
                <ArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
