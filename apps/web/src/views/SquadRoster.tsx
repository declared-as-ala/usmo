'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import { Shield, Loader2, Users, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

interface RosterPlayer {
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
  bio?: string;
  height?: string;
  weight?: string;
  age?: number | null;
  club?: {
    isCaptain?: boolean;
    isViceCaptain?: boolean;
  };
  stats?: Record<string, number | string>;
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
        setLoading(true);
        // Load directly and exclusively from first-party MongoDB backend
        const dbPlayers: RosterPlayer[] = await api.getPlayers(sport).catch(() => []);
        if (!cancelled) {
          setRoster(dbPlayers || []);
        }
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

  const footballPositions = [
    { key: 'All', labelFr: 'Tous', labelAr: 'الكل', labelEn: 'All' },
    { key: 'Goalkeeper', labelFr: 'Gardiens', labelAr: 'حراس المرمى', labelEn: 'Goalkeepers' },
    { key: 'Defender', labelFr: 'Défenseurs', labelAr: 'المدافعون', labelEn: 'Defenders' },
    { key: 'Midfielder', labelFr: 'Milieux', labelAr: 'وسط الميدان', labelEn: 'Midfielders' },
    { key: 'Forward', labelFr: 'Attaquants', labelAr: 'المهاجمون', labelEn: 'Forwards' },
  ];

  const basketballPositions = [
    { key: 'All', labelFr: 'Tous', labelAr: 'الكل', labelEn: 'All' },
    { key: 'Guard', labelFr: 'Meneurs / Arrières', labelAr: 'لاعبو الخط الخلفي', labelEn: 'Guards' },
    { key: 'Forward', labelFr: 'Ailiers', labelAr: 'الأجنحة', labelEn: 'Forwards' },
    { key: 'Center', labelFr: 'Pivots', labelAr: 'لاعبو الارتكاز', labelEn: 'Centers' },
  ];

  const filterTabs = sport === 'football' ? footballPositions : basketballPositions;

  const filteredRoster = useMemo(() => {
    if (activeFilter === 'All') return roster;

    return roster.filter((p) => {
      const pos = (p.position || '').toLowerCase();
      const target = activeFilter.toLowerCase();

      if (target === 'goalkeeper') return pos.includes('goal') || pos.includes('gardien');
      if (target === 'defender') return pos.includes('def') || pos.includes('défens');
      if (target === 'midfielder') return pos.includes('mid') || pos.includes('milieu');
      if (target === 'forward') return pos.includes('forw') || pos.includes('attaqu') || pos.includes('ailier') || pos.includes('striker');
      if (target === 'guard') return pos.includes('guard') || pos.includes('meneur') || pos.includes('arrière');
      if (target === 'center') return pos.includes('center') || pos.includes('pivot');

      return pos.includes(target);
    });
  }, [roster, activeFilter]);

  const translatePos = (p: RosterPlayer) => {
    if (language === 'ar' && p.positionAr) return p.positionAr;
    const pos = (p.position || '').toLowerCase();
    if (pos.includes('goal') || pos.includes('gardien')) return tr(language, 'Goalkeeper', 'Gardien', 'حارس مرمى');
    if (pos.includes('def') || pos.includes('défens')) return tr(language, 'Defender', 'Défenseur', 'مدافع');
    if (pos.includes('mid') || pos.includes('milieu')) return tr(language, 'Midfielder', 'Milieu de terrain', 'متوسط ميدان');
    if (pos.includes('forw') || pos.includes('attaqu')) return tr(language, 'Forward', 'Attaquant', 'مهاجم');
    if (pos.includes('guard') || pos.includes('meneur')) return tr(language, 'Guard', 'Meneur / Arrière', 'لاعب خلفي');
    if (pos.includes('center') || pos.includes('pivot')) return tr(language, 'Center', 'Pivot', 'لاعب ارتكاز');
    return p.position;
  };

  return (
    <div className="min-h-screen bg-usm-blue-soft/30 text-usm-blue-dark pb-20">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-[#071328] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-[#071328]/80 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-usm-teal-accent/40 bg-usm-teal-accent/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-usm-teal-accent">
                <Sparkles size={12} /> {sport === 'football' ? 'Football Professionnel' : 'Basketball Pro A'} · 2026-2027
              </span>
              <h1 className="mt-3 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
                {language === 'ar'
                  ? sport === 'football' ? 'تشكيلة فريق كرة القدم' : 'تشكيلة فريق كرة السلة'
                  : sport === 'football' ? 'Effectif Football' : 'Effectif Basketball'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl">
                {language === 'ar'
                  ? 'القائمة الرسمية للاعبي الاتحاد الرياضي المنستيري للموسم الرياضي 2026-2027.'
                  : 'L’effectif officiel et les profils détaillés des athlètes de l’Union Sportive Monastirienne.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 bg-white/[0.05] border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
                <Users size={24} className="text-usm-teal-accent" />
                <div>
                  <div className="text-2xl font-black text-white font-display leading-none">
                    {roster.length}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    {language === 'ar' ? 'رياضي مسجل' : 'Athlètes Enregistrés'}
                  </div>
                </div>
              </div>

              <Link
                href={`/${sport}/staff`}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-usm-blue-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-usm-blue-dark transition-all duration-300 shadow-lg shadow-usm-blue-primary/20 border border-usm-blue-primary/50"
              >
                <UserCheck size={18} />
                {language === 'ar' ? 'عرض الطاقم الفني' : 'Voir le Staff'}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Position Filter Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const label = language === 'ar' ? tab.labelAr : language === 'fr' ? tab.labelFr : tab.labelEn;
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-usm-teal-accent text-usm-blue-dark shadow-lg shadow-usm-teal-accent/20 font-black'
                      : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Squad Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={36} className="animate-spin text-usm-blue-primary mb-3" />
            <span className="text-xs font-bold uppercase tracking-wider">Chargement de l’effectif officiel…</span>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-usm-border p-8">
            <Shield size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-usm-blue-dark uppercase">Aucun joueur dans cette catégorie</h3>
            <p className="text-xs text-slate-500 mt-1">Sélectionnez un autre filtre pour découvrir les athlètes de l’USM.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredRoster.map((player) => {
              const playerName = language === 'ar' && player.nameAr ? player.nameAr : player.displayName || player.name;
              const playerPos = translatePos(player);
              const isCaptain = player.club?.isCaptain;

              return (
                <Link
                  key={player._id}
                  href={`/${sport}/joueurs/${player.slug}`}
                  className="group relative flex flex-col justify-between bg-white border border-usm-border rounded-2xl overflow-hidden hover:border-usm-blue-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  {/* Card Header Top Badges */}
                  <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
                    <span className="h-8 w-8 rounded-lg bg-[#071328]/90 backdrop-blur-md border border-white/10 text-white font-mono font-black text-xs flex items-center justify-center shadow">
                      #{player.number}
                    </span>
                    {isCaptain && (
                      <span className="px-2 py-1 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow">
                        Capitaine
                      </span>
                    )}
                  </div>

                  {/* Player Image Canvas */}
                  <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden flex items-end justify-center">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback silhouette
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                        <Users size={54} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                          US Monastir
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Card Body Details */}
                  <div className="p-3.5 sm:p-4 bg-white flex flex-col justify-between flex-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-usm-blue-primary block truncate">
                        {playerPos}
                      </span>
                      <h3 className="font-display font-black text-sm sm:text-base text-usm-blue-dark uppercase tracking-tight truncate mt-0.5 group-hover:text-usm-blue-primary transition-colors">
                        {playerName}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{player.nationality || 'Tunisien'}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-usm-blue-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform text-xs">
                        Fiche <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
