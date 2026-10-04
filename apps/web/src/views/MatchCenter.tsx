'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { LeagueStandingsTable } from '../components/Common/LeagueStandingsTable';
import { Logo } from '../components/Common/Logo';
import {
  MapPin, Calendar, Users2,
  Clock3, ExternalLink, Radio, CheckCircle2, Trophy, ChevronDown, ChevronUp,
} from 'lucide-react';

interface ResultRow {
  id: string; date: string; time: string; competition: string; round: string | null;
  homeTeam: string; awayTeam: string; homeTeamId: string; awayTeamId: string;
  homeScore: number | null; awayScore: number | null; homeBadge: string | null; awayBadge: string | null;
  venue: string | null;
  quarters?: { home: number[]; away: number[] } | null;
  competitionAr?: string;
  homeTeamAr?: string;
  awayTeamAr?: string;
  venueAr?: string;
}

interface TeamInfo {
  id: string; name: string; shortName: string | null; badge: string | null; stadium: string | null;
  stadiumCapacity: number | null; formedYear: number | null; league: string | null;
  description: string | null; website: string | null;
}

export const getBasketballTeamLogo = (teamName: string, customLogo?: string | null): string | null => {
  if (customLogo && customLogo.trim()) return customLogo.trim();
  const lower = (teamName || '').toLowerCase().trim();
  if (lower.includes('monastir') || lower.includes('usm')) return '/images/usm-basketball-logo.png';
  if (lower.includes('css') || lower.includes('sfax')) return '/teams/css.png';
  if (lower.includes('africain') || lower.includes('ca')) return '/teams/ca.png';
  if (lower.includes('sahel') || lower.includes('ess') || lower.includes('étoile') || lower.includes('etoile')) return '/teams/ess.png';
  if (lower.includes('kairouan') || lower.includes('jsk')) return '/teams/jsk.svg';
  if (lower.includes('radès') || lower.includes('rades') || lower.includes('esr')) return '/teams/esg.svg';
  if (lower.includes('nabeul') || lower.includes('stade nabeulien') || lower.includes('sn')) return '/teams/st.png';
  if (lower.includes('grombalia') || lower.includes('dsg')) return '/teams/dsg.svg';
  if (lower.includes('ezzahra') || lower.includes('ezs')) return '/teams/esz.png';
  if (lower.includes('manazeh') || lower.includes('jsm')) return '/teams/jso.png';
  if (lower.includes('goulette')) return '/teams/esg.svg';
  return null;
};

export const getFootballTeamLogo = (teamName: string, customLogo?: string | null): string | null => {
  if (customLogo && customLogo.trim()) return customLogo.trim();
  const lower = (teamName || '').toLowerCase().trim();
  if (lower.includes('monastir') || lower.includes('usm')) return '/brand/usm-logo.webp';
  if (lower.includes('esperance') || lower.includes('espérance') || lower.includes('est')) return '/teams/est.png';
  if (lower.includes('africain') || lower.includes('ca')) return '/teams/ca.png';
  if (lower.includes('étoile') || lower.includes('etoile') || lower.includes('ess') || lower.includes('sahel')) return '/teams/ess.png';
  if (lower.includes('sfax') || lower.includes('css')) return '/teams/css.png';
  if (lower.includes('stade tunisien') || lower.includes('st')) return '/teams/st.png';
  if (lower.includes('bizertin') || lower.includes('cab')) return '/teams/cab.png';
  if (lower.includes('zarzis') || lower.includes('esz')) return '/teams/esz.png';
  if (lower.includes('beja') || lower.includes('béja') || lower.includes('ob')) return '/teams/ob.png';
  if (lower.includes('metlaoui') || lower.includes('esm')) return '/teams/esm.png';
  if (lower.includes('omrane') || lower.includes('jso')) return '/teams/jso.png';
  if (lower.includes('sakiet') || lower.includes('pss')) return '/teams/pss.svg';
  if (lower.includes('guerdane') || lower.includes('usbg')) return '/teams/usbg.png';
  if (lower.includes('marsa') || lower.includes('asm')) return '/teams/asm.png';
  if (lower.includes('hammam sousse') || lower.includes('eshs')) return '/teams/eshs.png';
  if (lower.includes('hammam-lif') || lower.includes('cshl')) return '/teams/cshl.png';
  return null;
};

interface PlayedMatchProps {
  match: any;
  sport: 'football' | 'basketball';
  language: string;
  fmtDate: (d: string) => string;
}

const PlayedMatchCard: React.FC<PlayedMatchProps> = ({ match, sport, language, fmtDate }) => {
  const isBasketball = sport === 'basketball';
  const isHomeUsm = (match.homeTeam || '').toLowerCase().includes('monastir') || (match.homeTeam || '').toLowerCase().includes('usm');
  const isAwayUsm = (match.awayTeam || '').toLowerCase().includes('monastir') || (match.awayTeam || '').toLowerCase().includes('usm');

  const defaultLogo = isBasketball ? '/images/usm-basketball-logo.png' : '/brand/usm-logo.webp';

  const homeLogo = isHomeUsm
    ? (match.homeLogo || match.homeBadge || defaultLogo)
    : (isBasketball
        ? getBasketballTeamLogo(match.homeTeam, match.homeLogo || match.homeBadge)
        : getFootballTeamLogo(match.homeTeam, match.homeLogo || match.homeBadge));

  const awayLogo = isAwayUsm
    ? (match.awayLogo || match.awayBadge || defaultLogo)
    : (isBasketball
        ? getBasketballTeamLogo(match.awayTeam, match.awayLogo || match.awayBadge)
        : getFootballTeamLogo(match.awayTeam, match.awayLogo || match.awayBadge));

  const homeScore = Number(match.score?.home ?? match.homeScore ?? 0);
  const awayScore = Number(match.score?.away ?? match.awayScore ?? 0);

  let outcome: 'win' | 'loss' | 'draw' | 'neutral' = 'neutral';
  if (isHomeUsm) {
    if (homeScore > awayScore) outcome = 'win';
    else if (homeScore < awayScore) outcome = 'loss';
    else outcome = 'draw';
  } else if (isAwayUsm) {
    if (awayScore > homeScore) outcome = 'win';
    else if (awayScore < homeScore) outcome = 'loss';
    else outcome = 'draw';
  }

  const compLabel = language === 'ar' && match.competitionAr ? match.competitionAr : match.competition;
  const homeTeamName = language === 'ar' && match.homeTeamAr ? match.homeTeamAr : match.homeTeam;
  const awayTeamName = language === 'ar' && match.awayTeamAr ? match.awayTeamAr : match.awayTeam;
  const venueLabel = language === 'ar' && match.venueAr ? match.venueAr : match.venue;

  const quarters = match.quarters;
  const hasQuarters =
    isBasketball &&
    quarters &&
    Array.isArray(quarters.home) &&
    Array.isArray(quarters.away) &&
    quarters.home.length === 4;

  return (
    <div className="usm-card rounded-2xl p-5 sm:p-6 border border-usm-blue-primary/15 bg-white/95 dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-usm-blue-primary/35 transition-all flex flex-col justify-between gap-4">
      {/* Top row: Competition & Date */}
      <div className="flex items-center justify-between gap-2 border-b border-usm-border/60 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-usm-blue-primary shrink-0" />
          <span className="text-[11px] font-black uppercase text-usm-blue-dark tracking-wide truncate max-w-[220px] sm:max-w-xs" title={compLabel}>
            {compLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
            <Calendar size={11} className="text-usm-blue-primary" /> {fmtDate(match.date)}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {language === 'ar' ? 'انتهت' : 'Terminé'}
          </span>
        </div>
      </div>

      {/* Main Scoreboard */}
      <div className="grid grid-cols-7 items-center gap-2 py-1">
        {/* Home Team (3 cols) */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <div className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center mb-2 shrink-0">
            {homeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={homeLogo} alt={homeTeamName} className="max-h-12 max-w-12 sm:max-h-14 sm:max-w-14 object-contain drop-shadow-sm" />
            ) : (
              <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
                {match.homeTeam?.slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>
          <span className={`text-xs sm:text-sm font-bold line-clamp-2 ${isHomeUsm ? 'text-usm-blue-primary font-black' : 'text-usm-blue-dark'}`}>
            {homeTeamName}
          </span>
        </div>

        {/* Score & Outcome (1 col) */}
        <div className="col-span-1 flex flex-col items-center justify-center text-center">
          <div className="bg-usm-blue-soft/70 dark:bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-usm-border flex items-center gap-1 sm:gap-1.5 shadow-inner">
            <span className={`font-display font-black text-lg sm:text-2xl tabular-nums ${homeScore > awayScore ? 'text-usm-blue-primary' : 'text-slate-700 dark:text-slate-300'}`}>
              {homeScore}
            </span>
            <span className="text-slate-400 font-bold text-xs">-</span>
            <span className={`font-display font-black text-lg sm:text-2xl tabular-nums ${awayScore > homeScore ? 'text-usm-blue-primary' : 'text-slate-700 dark:text-slate-300'}`}>
              {awayScore}
            </span>
          </div>

          <div className="mt-1.5 shrink-0">
            {outcome === 'win' && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                {language === 'ar' ? 'فوز' : 'Victoire'}
              </span>
            )}
            {outcome === 'loss' && (
              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/25">
                {language === 'ar' ? 'هزيمة' : 'Défaite'}
              </span>
            )}
            {outcome === 'draw' && (
              <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/25">
                {language === 'ar' ? 'تعادل' : 'Nul'}
              </span>
            )}
          </div>
        </div>

        {/* Away Team (3 cols) */}
        <div className="col-span-3 flex flex-col items-center text-center">
          <div className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center mb-2 shrink-0">
            {awayLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={awayLogo} alt={awayTeamName} className="max-h-12 max-w-12 sm:max-h-14 sm:max-w-14 object-contain drop-shadow-sm" />
            ) : (
              <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
                {match.awayTeam?.slice(0, 3).toUpperCase()}
              </div>
            )}
          </div>
          <span className={`text-xs sm:text-sm font-bold line-clamp-2 ${isAwayUsm ? 'text-usm-blue-primary font-black' : 'text-usm-blue-dark'}`}>
            {awayTeamName}
          </span>
        </div>
      </div>

      {/* Quarters for Basketball */}
      {hasQuarters && (
        <div className="pt-2 border-t border-usm-border/50">
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 rounded-lg py-1 px-1 border border-slate-100 dark:border-slate-800">
                <span className="block text-[8px] sm:text-[9px] font-black uppercase text-slate-400">
                  Q{idx + 1}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  {quarters.home[idx] ?? 0} - {quarters.away[idx] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Venue bottom note */}
      {venueLabel && (
        <div className="pt-2 border-t border-usm-border/40 text-[10px] text-slate-500 flex items-center gap-1 justify-center text-center truncate">
          <MapPin size={10} className="shrink-0 text-usm-blue-primary" />
          <span className="truncate">{venueLabel}</span>
        </div>
      )}
    </div>
  );
};

const PlayedMatchesSection: React.FC<{
  matches: any[];
  sport: 'football' | 'basketball';
  language: string;
  fmtDate: (d: string) => string;
}> = ({ matches, sport, language, fmtDate }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedMatches = showAll ? matches : matches.slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-usm-blue-primary/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-usm-blue-primary/10 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wider flex items-center gap-2">
              <span>{language === 'ar' ? 'آخر النتائج' : 'Derniers résultats'}</span>
              <span className="text-xs font-bold text-slate-500 font-sans normal-case">
                ({matches.length})
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === 'ar'
                ? 'المباريات المكتملة والنتائج الرسمية المسجلة'
                : 'Matchs déjà joués et résultats officiels'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-usm-blue-soft border border-usm-border text-usm-blue-primary self-start sm:self-auto">
          {sport === 'basketball'
            ? (language === 'ar' ? '🏀 نتائج كرة السلة' : '🏀 Basketball')
            : (language === 'ar' ? '⚽ نتائج كرة القدم' : '⚽ Football')}
        </span>
      </div>

      {/* Grid or Empty */}
      {matches.length === 0 ? (
        <div className="usm-card rounded-2xl p-8 text-center border border-usm-border">
          <Trophy size={28} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-usm-blue-dark mb-1">
            {language === 'ar' ? 'لا توجد نتائج مسجلة حالياً' : 'Aucun match terminé enregistré'}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ar'
              ? 'ستظهر نتائج المباريات الرسمية هنا فور انتهاء المقابلات وتحديثها من الإدارة.'
              : 'Les scores et résultats des matchs apparaîtront ici dès leur enregistrement dans le tableau de bord.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {displayedMatches.map((m: any) => (
              <PlayedMatchCard
                key={m.id || m._id || m.slug || `${m.homeTeam}-${m.awayTeam}-${m.date}`}
                match={m}
                sport={sport}
                language={language}
                fmtDate={fmtDate}
              />
            ))}
          </div>

          {matches.length > 6 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-usm-blue-primary/30 bg-usm-blue-soft text-usm-blue-primary font-bold text-xs uppercase tracking-wider hover:bg-usm-blue-primary hover:text-white transition-all cursor-pointer shadow-sm"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={14} />
                    {language === 'ar' ? 'عرض أقل' : 'Afficher moins'}
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    {language === 'ar'
                      ? `عرض باقي النتائج (${matches.length - 6})`
                      : `Voir plus de résultats (${matches.length - 6})`}
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const MatchCenter: React.FC = () => {
  const { language, t, matches: contextMatches } = useApp();
  const [sportTab, setSportTab] = useState<'football' | 'basketball'>('football');

  // Football states
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [nextMatch, setNextMatch] = useState<ResultRow | null>(null);
  const [recentResults, setRecentResults] = useState<ResultRow[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [freshnessText, setFreshnessText] = useState<string | null>(null);

  // Basketball states
  const [basketballMatches, setBasketballMatches] = useState<any[]>([]);
  const [bbTeamInfo, setBbTeamInfo] = useState<TeamInfo | null>(null);
  const [bbLoading, setBbLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getSportsSyncFreshness(sportTab)
      .then((f: any) => {
        if (cancelled || !f?.lastSyncAt) return;
        const syncDate = new Date(f.lastSyncAt);
        const diffMins = Math.floor((Date.now() - syncDate.getTime()) / (60 * 1000));
        if (diffMins < 2) setFreshnessText('Mis à jour à l’instant');
        else if (diffMins < 60) setFreshnessText(`Mis à jour il y a ${diffMins} min`);
        else {
          setFreshnessText(
            `Dernière synchronisation : ${syncDate.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Africa/Tunis',
            })}`
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sportTab]);

  // Load Football data (both API-Football and Admin/DB matches)
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.getFootballFixtures().catch(() => null),
      api.getMatches('football').catch(() => []),
    ])
      .then(([fixturesRes, dbMatchesRes]) => {
        if (cancelled) return;

        const dbList = Array.isArray(dbMatchesRes) ? dbMatchesRes : [];
        const sourceMatches = dbList.length > 0 ? dbList : (contextMatches || []).filter((m: any) => m.sport === 'football');

        // 1. Map finished DB matches (controlled from admin dashboard only)
        const dbPlayed: ResultRow[] = sourceMatches
          .filter((m: any) => m.status === 'finished' || (!['upcoming', 'live'].includes(m.status) && m.score && (Number(m.score.home) > 0 || Number(m.score.away) > 0)))
          .map((m: any) => ({
            id: String(m._id || m.id || m.slug),
            date: typeof m.date === 'string' ? m.date.slice(0, 10) : m.date,
            time: m.time || '16:00',
            competition: m.competition || 'Ligue 1 Professionnelle',
            competitionAr: m.competitionAr,
            round: null,
            homeTeam: m.homeTeam,
            homeTeamAr: m.homeTeamAr,
            awayTeam: m.awayTeam,
            awayTeamAr: m.awayTeamAr,
            homeTeamId: String(m.homeTeamId || 'home'),
            awayTeamId: String(m.awayTeamId || 'away'),
            homeScore: m.score?.home ?? 0,
            awayScore: m.score?.away ?? 0,
            homeBadge: m.homeLogo || null,
            awayBadge: m.awayLogo || null,
            venue: m.venue || null,
            venueAr: m.venueAr || null,
          }));

        // ONLY use matches filled from dashboard (no external API fixtures for played matches)
        setRecentResults(dbPlayed);

        // 2. Derive upcoming match (DB admin upcoming first, then API upcoming if any)
        const dbUpcoming = sourceMatches.filter((m: any) => m.status === 'upcoming' || m.status === 'live');
        if (dbUpcoming.length > 0) {
          const u = [...dbUpcoming].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime())[0];
          setNextMatch({
            id: String(u._id || u.id || u.slug),
            date: typeof u.date === 'string' ? u.date.slice(0, 10) : u.date,
            time: u.time || '17:00',
            competition: u.competition || 'Ligue 1 Professionnelle',
            round: null,
            homeTeam: u.homeTeam,
            homeTeamAr: u.homeTeamAr,
            awayTeam: u.awayTeam,
            awayTeamAr: u.awayTeamAr,
            homeTeamId: 'home',
            awayTeamId: 'away',
            homeScore: u.score?.home ?? null,
            awayScore: u.score?.away ?? null,
            homeBadge: u.homeLogo || null,
            awayBadge: u.awayLogo || null,
            venue: u.venue || null,
            venueAr: u.venueAr || null,
          });
        } else if (fixturesRes && Array.isArray(fixturesRes.upcoming) && fixturesRes.upcoming.length > 0) {
          const f = fixturesRes.upcoming[0];
          setNextMatch({
            id: String(f.id),
            date: f.date ? f.date.split('T')[0] : f.formattedDate,
            time: f.formattedTime || '17:00',
            competition: f.competition || 'Ligue 1',
            round: null,
            homeTeam: f.homeTeam.name,
            awayTeam: f.awayTeam.name,
            homeTeamId: String(f.homeTeam.id),
            awayTeamId: String(f.awayTeam.id),
            homeScore: f.score.home,
            awayScore: f.score.away,
            homeBadge: f.homeTeam.logo,
            awayBadge: f.awayTeam.logo,
            venue: f.venue,
          });
        } else {
          api.getNextLeagueMatch().then((nm) => { if (!cancelled) setNextMatch(nm); }).catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) {
          api.getNextLeagueMatch().then(setNextMatch).catch(() => {});
        }
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    // 4. Fetch Football Team Information
    api.getFootballTeam()
      .then((tInfo: any) => {
        if (!cancelled && tInfo && tInfo.name) {
          setTeamInfo({
            id: String(tInfo.id),
            name: tInfo.name,
            shortName: tInfo.code || 'USMO',
            badge: tInfo.logo || 'https://media.api-sports.io/football/teams/992.png',
            stadium: tInfo.venue?.name || 'Stade Mustapha Ben Jannet',
            stadiumCapacity: tInfo.venue?.capacity || 15000,
            formedYear: tInfo.founded || 1923,
            league: 'Ligue 1 Professionnelle',
            description: 'Union Sportive Monastirienne - Fondé en 1923',
            website: 'https://usmonastir.tn',
          });
        } else {
          api.getUsmTeamInfo().then((ti) => { if (!cancelled) setTeamInfo(ti); }).catch(() => {});
        }
      })
      .catch(() => {
        api.getUsmTeamInfo().then((ti) => { if (!cancelled) setTeamInfo(ti); }).catch(() => {});
      });

    return () => { cancelled = true; };
  }, [contextMatches]);

  // Load Basketball data (both API / MongoDB and Context fallback)
  useEffect(() => {
    let cancelled = false;
    setBbLoading(true);

    Promise.all([
      api.getMatches('basketball').catch(() => []),
      api.getSportsSyncTeamInfo('basketball').catch(() => null),
    ])
      .then(([matches, team]) => {
        if (cancelled) return;
        const apiList = Array.isArray(matches) ? matches : [];
        const sourceMatches = apiList.length > 0 ? apiList : (contextMatches || []).filter((m: any) => m.sport === 'basketball');

        const normalized = sourceMatches.map((m: any) => ({
          ...m,
          id: m._id || m.id || m.slug,
          date: typeof m.date === 'string' ? m.date.slice(0, 10) : m.date,
        }));
        setBasketballMatches(normalized);

        if (team && team.name) {
          setBbTeamInfo({
            id: String(team.id || 'usm-basket'),
            name: team.name,
            shortName: team.shortName || 'USM Basket',
            badge: team.badge || '/brand/usm-logo.webp',
            stadium: team.stadium || 'Salle Omnisports Mohamed Mzali',
            stadiumCapacity: team.stadiumCapacity || 4075,
            formedYear: team.formedYear || 1959,
            league: team.league || 'Championnat Pro A / BAL',
            description: team.description || 'US Monastir Basketball - Champion de Tunisie & Vainqueur BAL',
            website: team.website || 'https://usmonastir.tn',
          });
        } else {
          setBbTeamInfo({
            id: 'usm-basket',
            name: 'US Monastir Basketball',
            shortName: 'USM Basket',
            badge: '/brand/usm-logo.webp',
            stadium: 'Salle Omnisports Mohamed Mzali, Monastir',
            stadiumCapacity: 4075,
            formedYear: 1959,
            league: 'Championnat National Pro A',
            description: 'Section Basketball de l\'Union Sportive Monastirienne',
            website: 'https://usmonastir.tn',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setBbLoading(false);
      });

    return () => { cancelled = true; };
  }, [contextMatches]);

  const fmtDate = (d: string) => {
    try {
      return new Date(`${d}T00:00:00`).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  // Derive basketball next match (sorted ascending by date so the earliest upcoming match is first)
  const bbUpcoming = basketballMatches
    .filter((m) => m.status === 'upcoming' || m.status === 'live')
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime());
  const nextBBMatch = bbUpcoming.length > 0 ? bbUpcoming[0] : null;

  // Derive basketball played / completed matches (sorted descending by date so latest is first)
  const bbPlayed = basketballMatches
    .filter((m) => m.status === 'finished' || (!['upcoming', 'live'].includes(m.status) && m.score && (Number(m.score.home) > 0 || Number(m.score.away) > 0)))
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());

  // Derive football played / completed matches
  const footballPlayed = [...recentResults].sort(
    (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 space-y-10">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-usm-blue-primary/20 usm-premium-bg p-8 sm:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 w-[360px] h-[360px] bg-usm-blue-primary/15 rounded-full blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-usm-blue-primary/10 rounded-full blur-[110px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-usm-blue-primary text-white font-black tracking-widest px-3 py-1 rounded-full uppercase">
                USM Match Center
              </span>
              {freshnessText && (
                <span className="text-[10px] bg-white/80 backdrop-blur-sm text-usm-blue-dark font-bold px-3 py-1 rounded-full border border-usm-border flex items-center gap-1.5 shadow-sm">
                  <Clock3 size={11} className="text-usm-blue-primary" />
                  {freshnessText}
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-usm-blue-dark uppercase tracking-wider mt-3">
              {language === 'ar' ? 'مركز المباريات' : 'Match Center'}
            </h1>
            <p className="text-xs text-slate-600 mt-2 max-w-lg">
              {language === 'ar'
                ? 'الترتيب الرسمي، النتائج الأخيرة، والمباريات القادمة للاتحاد المنستيري.'
                : 'Classement officiel, derniers résultats et prochaines rencontres de l\'US Monastir.'}
            </p>
          </div>

          {/* Sport switcher */}
          <div className="flex bg-usm-blue-soft border border-usm-border rounded-xl p-1 shrink-0">
            {(['football', 'basketball'] as const).map((sport) => (
              <button
                key={sport}
                onClick={() => setSportTab(sport)}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  sportTab === sport ? 'bg-usm-blue-primary text-white shadow-md' : 'text-slate-600 hover:text-white'
                }`}
              >
                {sport === 'football' ? (language === 'ar' ? '⚽ كرة القدم' : '⚽ Football') : (language === 'ar' ? '🏀 كرة السلة' : '🏀 Basketball')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ FOOTBALL — LIVE DATA ════════════════ */}
      {sportTab === 'football' && (
        <div className="space-y-10 animate-[fadeIn_0.25s_ease-out]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prochain match */}
            <div className="lg:col-span-2 usm-card rounded-2xl p-6 sm:p-8 flex flex-col justify-center min-h-[220px]">
              <h3 className="text-[10px] tracking-[0.2em] text-usm-blue-primary font-bold uppercase mb-5 flex items-center gap-2">
                <Radio size={13} /> {language === 'ar' ? 'المباراة القادمة' : 'Prochain match'}
              </h3>
              {liveLoading ? (
                <div className="skeleton-loader h-24 rounded-xl" />
              ) : nextMatch ? (
                <div className="flex items-center justify-around gap-4">
                  <div className="flex flex-col items-center text-center w-24">
                    {(nextMatch.homeBadge || (nextMatch as any).homeLogo) ? (
                      <img src={nextMatch.homeBadge || (nextMatch as any).homeLogo} alt="" className="h-14 w-14 object-contain mb-2" />
                    ) : <Logo size={56} />}
                    <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">
                      {language === 'ar' && nextMatch.homeTeamAr ? nextMatch.homeTeamAr : nextMatch.homeTeam}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-display font-black text-2xl text-usm-blue-primary uppercase tracking-wide">
                      {nextMatch.time?.slice(0, 5) || '--:--'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                      <Calendar size={11} /> {fmtDate(nextMatch.date)}
                    </span>
                    {nextMatch.venue && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 max-w-[180px] text-center">
                        <MapPin size={11} className="shrink-0" /> {language === 'ar' && nextMatch.venueAr ? nextMatch.venueAr : nextMatch.venue}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center w-24">
                    {(nextMatch.awayBadge || (nextMatch as any).awayLogo) ? (
                      <img src={nextMatch.awayBadge || (nextMatch as any).awayLogo} alt="" className="h-14 w-14 object-contain mb-2" />
                    ) : <div className="h-14 w-14 rounded-full bg-usm-blue-soft border border-usm-border" />}
                    <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">
                      {language === 'ar' && nextMatch.awayTeamAr ? nextMatch.awayTeamAr : nextMatch.awayTeam}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm font-bold text-usm-blue-dark mb-1">
                    {language === 'ar' ? 'راحة الموسم' : 'Hors saison'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === 'ar'
                      ? 'انتهى الموسم الحالي، لم يُنشر التقويم الجديد بعد. تابعوا آخر النتائج والترتيب أدناه.'
                      : 'La saison est terminée et le nouveau calendrier n’a pas encore été publié. Retrouvez les derniers résultats et le classement ci-dessous.'}
                  </p>
                </div>
              )}
            </div>

            {/* Team info */}
            <div className="usm-card rounded-2xl p-6 flex flex-col items-center text-center">
              {liveLoading ? (
                <div className="skeleton-loader h-32 w-full rounded-xl" />
              ) : teamInfo ? (
                <>
                  {teamInfo.badge ? (
                    <img src={teamInfo.badge} alt={teamInfo.name} className="h-16 w-16 object-contain mb-3" />
                  ) : <Logo size={64} className="mb-3" />}
                  <h4 className="font-display font-black text-usm-blue-dark uppercase tracking-wide text-sm mb-1">{teamInfo.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-4">{teamInfo.league}</span>
                  <div className="w-full space-y-2 text-[11px] text-slate-600">
                    {teamInfo.stadium && (
                      <div className="flex items-center justify-between border-t border-usm-border pt-2">
                        <span className="text-slate-500 flex items-center gap-1"><MapPin size={11} /> {language === 'ar' ? 'الملعب' : 'Stade'}</span>
                        <span className="font-bold text-usm-blue-dark text-right">{teamInfo.stadium}</span>
                      </div>
                    )}
                    {teamInfo.stadiumCapacity && (
                      <div className="flex items-center justify-between border-t border-usm-border pt-2">
                        <span className="text-slate-500 flex items-center gap-1"><Users2 size={11} /> {language === 'ar' ? 'السعة' : 'Capacité'}</span>
                        <span className="font-bold text-usm-blue-dark">{teamInfo.stadiumCapacity.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {teamInfo.website && (
                    <a
                      href={`https://${teamInfo.website.replace(/^https?:\/\//, '')}`}
                      target="_blank" rel="noreferrer"
                      className="mt-4 text-[10px] text-usm-blue-primary font-bold uppercase hover:underline flex items-center gap-1"
                    >
                      {teamInfo.website} <ExternalLink size={10} />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500 py-8">
                  {language === 'ar' ? 'معلومات الفريق غير متوفرة' : 'Informations indisponibles'}
                </p>
              )}
            </div>
          </div>

          {/* Derniers résultats Football (Matchs déjà joués) */}
          <PlayedMatchesSection
            matches={footballPlayed}
            sport="football"
            language={language}
            fmtDate={fmtDate}
          />

          {/* Classement Football */}
          <div>
            <h3 className="font-display font-extrabold text-xl uppercase tracking-wider text-usm-blue-dark border-b-2 border-usm-blue-primary/40 pb-2 mb-6 flex items-center justify-between">
              <span>🏆 {language === 'ar' ? 'ترتيب البطولة المحترفة الأولى' : 'Tableau de classement de la ligue'}</span>
              <span className="text-[9px] font-bold text-slate-500 normal-case tracking-normal">{language === 'ar' ? 'الموسم الحالي' : 'Ligue 1 Professionnelle'}</span>
            </h3>
            <LeagueStandingsTable
              sport="football"
              posLabel={t('table.pos')}
              teamLabel={t('table.team')}
              playedLabel={t('table.played')}
              wonLabel={t('table.won')}
              pointsLabel={t('table.points')}
              diffLabel={t('table.diff')}
              emptyLabel={language === 'ar' ? 'الترتيب غير متوفر حالياً' : 'Classement indisponible pour le moment'}
            />
          </div>
        </div>
      )}

      {/* ════════════════ BASKETBALL — PROCHAIN MATCH & DERNIERS RÉSULTATS ════════════════ */}
      {sportTab === 'basketball' && (
        <div className="space-y-10 animate-[fadeIn_0.25s_ease-out]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prochain match Basketball */}
            <div className="lg:col-span-2 usm-card rounded-2xl p-6 sm:p-8 flex flex-col justify-center min-h-[220px]">
              <h3 className="text-[10px] tracking-[0.2em] text-usm-blue-primary font-bold uppercase mb-5 flex items-center gap-2">
                <Radio size={13} /> {language === 'ar' ? 'المباراة القادمة لكرة السلة' : 'Prochain match de basketball'}
              </h3>
              {bbLoading ? (
                <div className="skeleton-loader h-24 rounded-xl" />
              ) : nextBBMatch ? (
                (() => {
                  const isHomeUsm = (nextBBMatch.homeTeam || '').toLowerCase().includes('monastir') || (nextBBMatch.homeTeam || '').toLowerCase().includes('usm');
                  const homeLogo = isHomeUsm
                    ? (nextBBMatch.homeLogo || '/images/usm-basketball-logo.png')
                    : getBasketballTeamLogo(nextBBMatch.homeTeam, nextBBMatch.homeLogo);
                  const awayLogo = !isHomeUsm
                    ? (nextBBMatch.awayLogo || '/images/usm-basketball-logo.png')
                    : getBasketballTeamLogo(nextBBMatch.awayTeam, nextBBMatch.awayLogo);

                  return (
                    <div className="flex items-center justify-around gap-4">
                      {/* Home Team */}
                      <div className="flex flex-col items-center text-center w-28 sm:w-32">
                        {homeLogo ? (
                          <div className={`flex items-center justify-center mb-2 ${isHomeUsm ? 'h-16 w-16 sm:h-18 sm:w-18' : 'h-12 w-12 sm:h-13 sm:w-13'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={homeLogo}
                              alt={nextBBMatch.homeTeam}
                              className={`object-contain ${isHomeUsm ? 'max-h-16 max-w-16 sm:max-h-18 sm:max-w-18' : 'max-h-12 max-w-12 sm:max-h-13 sm:max-w-13'}`}
                            />
                          </div>
                        ) : (
                          <div className={`rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-700 mb-2 shadow-sm ${isHomeUsm ? 'h-16 w-16 sm:h-18 sm:w-18' : 'h-12 w-12 sm:h-13 sm:w-13'}`}>
                            {nextBBMatch.homeTeam.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">
                          {language === 'ar' ? nextBBMatch.homeTeamAr || nextBBMatch.homeTeam : nextBBMatch.homeTeam}
                        </span>
                      </div>

                      {/* Match Details */}
                      <div className="flex flex-col items-center gap-2 px-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {nextBBMatch.competition}
                        </span>
                        <span className="font-display font-black text-2xl text-usm-blue-primary uppercase tracking-wide">
                          {nextBBMatch.time || '18:00'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Calendar size={11} /> {fmtDate(nextBBMatch.date)}
                        </span>
                        {nextBBMatch.venue && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 max-w-[220px] text-center">
                            <MapPin size={11} className="shrink-0 text-usm-blue-primary" /> {nextBBMatch.venue}
                          </span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center text-center w-28 sm:w-32">
                        {awayLogo ? (
                          <div className={`flex items-center justify-center mb-2 ${!isHomeUsm ? 'h-16 w-16 sm:h-18 sm:w-18' : 'h-12 w-12 sm:h-13 sm:w-13'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={awayLogo}
                              alt={nextBBMatch.awayTeam}
                              className={`object-contain ${!isHomeUsm ? 'max-h-16 max-w-16 sm:max-h-18 sm:max-w-18' : 'max-h-12 max-w-12 sm:max-h-13 sm:max-w-13'}`}
                            />
                          </div>
                        ) : (
                          <div className={`rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-700 mb-2 shadow-sm ${!isHomeUsm ? 'h-16 w-16 sm:h-18 sm:w-18' : 'h-12 w-12 sm:h-13 sm:w-13'}`}>
                            {nextBBMatch.awayTeam.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">
                          {language === 'ar' ? nextBBMatch.awayTeamAr || nextBBMatch.awayTeam : nextBBMatch.awayTeam}
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm font-bold text-usm-blue-dark mb-1">
                    {language === 'ar' ? 'فترة التوقف بين المواسم' : 'Période d\'intersaison'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === 'ar'
                      ? 'لا توجد مباريات مبرمجة في الوقت الحالي. سيتم الإعلان عن الموعد القادم فور تحديده.'
                      : 'Aucun match programmé pour le moment. La prochaine rencontre sera annoncée prochainement.'}
                  </p>
                </div>
              )}
            </div>

            {/* Basketball Team info */}
            <div className="usm-card rounded-2xl p-6 flex flex-col items-center text-center">
              {bbLoading ? (
                <div className="skeleton-loader h-32 w-full rounded-xl" />
              ) : bbTeamInfo ? (
                <>
                  <img
                    src="/images/usm-basketball-logo.png"
                    alt="US Monastir Basketball"
                    className="h-16 w-16 object-contain mb-3"
                  />
                  <h4 className="font-display font-black text-usm-blue-dark uppercase tracking-wide text-sm mb-1">{bbTeamInfo.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-4">{bbTeamInfo.league}</span>
                  <div className="w-full space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between border-t border-usm-border pt-2">
                      <span className="text-slate-500 flex items-center gap-1"><MapPin size={11} /> {language === 'ar' ? 'القاعة' : 'Salle'}</span>
                      <span className="font-bold text-usm-blue-dark text-right truncate max-w-[170px]" title={bbTeamInfo.stadium || ''}>{bbTeamInfo.stadium}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-usm-border pt-2">
                      <span className="text-slate-500 flex items-center gap-1"><Users2 size={11} /> {language === 'ar' ? 'السعة' : 'Capacité'}</span>
                      <span className="font-bold text-usm-blue-dark">4 075 places</span>
                    </div>
                  </div>
                  <a
                    href="https://usmonastir.tn"
                    target="_blank" rel="noreferrer"
                    className="mt-4 text-[10px] text-usm-blue-primary font-bold uppercase hover:underline flex items-center gap-1"
                  >
                    usmonastir.tn <ExternalLink size={10} />
                  </a>
                </>
              ) : null}
            </div>
          </div>

          {/* Derniers résultats Basketball (Matchs déjà joués) */}
          <PlayedMatchesSection
            matches={bbPlayed}
            sport="basketball"
            language={language}
            fmtDate={fmtDate}
          />
        </div>
      )}
    </div>
  );
};
