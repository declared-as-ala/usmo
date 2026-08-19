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
        const dbPlayers: RosterPlayer[] = await api.getPlayers(sport).catch(() => []);
        const merged = [...(dbPlayers || [])];

        if (sport === 'football') {
          const apiFootballRes = await api.getFootballSquad().catch(() => null);
          if (apiFootballRes && apiFootballRes.players && apiFootballRes.players.length > 0) {
            for (const p of apiFootballRes.players) {
              const pSlug = p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `player-${p.id}`;
              const pImage = p.photo || '/moez_ben_cherifia.png';
              merged.push({
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

          if (merged.length === 0) {
            const extPlayers: any[] = await api.getSportsDbPlayers().catch(() => []);
            if (extPlayers && extPlayers.length > 0) {
              for (const ext of extPlayers) {
                merged.push({
                  _id: ext._id || `ext_${ext.name}`,
                  slug: ext.slug,
                  sport: 'football',
                  name: ext.name,
                  nameAr: ext.nameAr || ext.name,
                  number: ext.number || 0,
                  position: ext.position || 'Player',
                  positionAr: ext.positionAr || 'لاعب',
                  nationality: ext.nationality || 'Tunisian',
                  nationalityAr: ext.nationalityAr || 'تونسي',
                  image: ext.image || '/moez_ben_cherifia.png',
                  stats: ext.stats || {},
                });
              }
            }
          }
        }

        if (!cancelled) setRoster(merged);
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

            {/* Players Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRoster.map((player) => (
                <Link
                  key={player._id}
                  href={`/${sport}/joueurs/${player.slug}`}
                  className="bg-white border border-usm-border rounded-2xl overflow-hidden group hover:border-usm-blue-primary/40 shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden aspect-[4/5] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                    <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 border border-usm-blue-primary/30 flex items-center justify-center font-mono font-black text-usm-blue-primary text-sm">
                      #{player.number}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-usm-blue-primary block">
                          {language === 'ar' ? player.positionAr : player.position}
                        </span>
                        <h3 className="text-sm font-bold text-usm-blue-dark mt-0.5 line-clamp-1">
                          {language === 'ar' ? player.nameAr : player.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-usm-border grid grid-cols-3 gap-2 text-center">
                    {Object.entries(player.stats).slice(0, 3).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-[9px] text-slate-500 block uppercase font-semibold">{key}</span>
                        <span className="text-xs font-mono font-black text-usm-blue-dark">{val}</span>
                      </div>
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
