'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { LeagueStandingsTable } from '../components/Common/LeagueStandingsTable';
import { Logo } from '../components/Common/Logo';
import {
  MapPin, Calendar, ChevronLeft, ArrowRight, Check, ShieldCheck, Users2,
  TrendingUp, Clock3, ExternalLink, Radio,
} from 'lucide-react';

interface ResultRow {
  id: string; date: string; time: string; competition: string; round: string | null;
  homeTeam: string; awayTeam: string; homeTeamId: string; awayTeamId: string;
  homeScore: number | null; awayScore: number | null; homeBadge: string | null; awayBadge: string | null;
  venue: string | null;
}
interface TeamInfo {
  id: string; name: string; shortName: string | null; badge: string | null; stadium: string | null;
  stadiumCapacity: number | null; formedYear: number | null; league: string | null;
  description: string | null; website: string | null;
}

const USM_TEAM_ID = '139871';

export const MatchCenter: React.FC = () => {
  const { language, predictions, submitPrediction, addBluePoints, t } = useApp();
  const [sportTab, setSportTab] = useState<'football' | 'basketball'>('football');

  // ── Live football data (TheSportsDB) ─────────────────────────────────
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [nextMatch, setNextMatch] = useState<ResultRow | null>(null);
  const [recentResults, setRecentResults] = useState<ResultRow[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 1. Fetch API-Football Fixtures (Upcoming & Recent Results)
    api.getFootballFixtures()
      .then((res: any) => {
        if (cancelled) return;
        if (res && Array.isArray(res.previous) && res.previous.length > 0) {
          const mappedPrevious: ResultRow[] = res.previous.slice(0, 10).map((f: any) => ({
            id: String(f.id),
            date: f.date ? f.date.split('T')[0] : f.formattedDate,
            time: f.formattedTime || '16:00',
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
          }));
          setRecentResults(mappedPrevious);
        } else {
          api.getRecentResults(6).then((rows) => { if (!cancelled) setRecentResults(rows || []); }).catch(() => {});
        }

        if (res && Array.isArray(res.upcoming) && res.upcoming.length > 0) {
          const f = res.upcoming[0];
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
          api.getRecentResults(6).then((rows) => setRecentResults(rows || [])).catch(() => {});
        }
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    // 2. Fetch API-Football Team Information
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
            league: 'Ligue 1',
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
  }, []);

  // ── Basketball: real matches from the internal Match API (admin-managed —
  //    there is no free live-data provider covering Tunisian/BAL basketball,
  //    so this is not TheSportsDB-backed like football above). ──
  const [basketballMatches, setBasketballMatches] = useState<any[]>([]);
  const [bbLoading, setBbLoading] = useState(true);
  const [selectedBBMatch, setSelectedBBMatch] = useState<typeof basketballMatches[number] | null>(null);
  const [votedPOM, setVotedPOM] = useState<{ [matchId: string]: string }>({});

  useEffect(() => {
    api.getMatches('basketball')
      .then((data: any[]) => setBasketballMatches((data || []).map((m) => ({ ...m, id: m._id }))))
      .catch(() => setBasketballMatches([]))
      .finally(() => setBbLoading(false));
  }, []);

  const handlePOMVote = (matchId: string, playerName: string) => {
    setVotedPOM((prev) => ({ ...prev, [matchId]: playerName }));
    addBluePoints(40);
  };

  const fmtDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const resultBadgeFor = (r: ResultRow) => {
    const isUsmHome = r.homeTeamId === USM_TEAM_ID;
    const usmScore = isUsmHome ? r.homeScore : r.awayScore;
    const oppScore = isUsmHome ? r.awayScore : r.homeScore;
    if (usmScore === null || oppScore === null) return null;
    if (usmScore > oppScore) return { label: 'V', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (usmScore < oppScore) return { label: 'D', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
    return { label: 'N', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-usm-blue-primary/20 usm-premium-bg p-8 sm:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 w-[360px] h-[360px] bg-usm-blue-primary/15 rounded-full blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-usm-blue-primary/10 rounded-full blur-[110px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="text-[10px] bg-usm-blue-primary text-white font-black tracking-widest px-3 py-1 rounded-full uppercase">
              USM Match Center
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-usm-blue-dark uppercase tracking-wider mt-3">
              {language === 'ar' ? 'مركز المباريات' : 'Match Center'}
            </h1>
            <p className="text-xs text-slate-600 mt-2 max-w-lg">
              {language === 'ar'
                ? 'الترتيب، النتائج والمباراة القادمة مباشرة من TheSportsDB.'
                : 'Classement, résultats et prochaine échéance en direct via TheSportsDB.'}
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
                {sport === 'football' ? (language === 'ar' ? 'كرة القدم' : 'Football') : (language === 'ar' ? 'كرة السلة' : 'Basketball')}
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
                    {nextMatch.homeBadge ? (
                      <img src={nextMatch.homeBadge} alt="" className="h-14 w-14 object-contain mb-2" />
                    ) : <Logo size={56} />}
                    <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">{nextMatch.homeTeam}</span>
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
                        <MapPin size={11} className="shrink-0" /> {nextMatch.venue}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center w-24">
                    {nextMatch.awayBadge ? (
                      <img src={nextMatch.awayBadge} alt="" className="h-14 w-14 object-contain mb-2" />
                    ) : <div className="h-14 w-14 rounded-full bg-usm-blue-soft border border-usm-border" />}
                    <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">{nextMatch.awayTeam}</span>
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
                    {teamInfo.formedYear && (
                      <div className="flex items-center justify-between border-t border-usm-border pt-2">
                        <span className="text-slate-500 flex items-center gap-1"><ShieldCheck size={11} /> {language === 'ar' ? 'التأسيس' : 'Fondé en'}</span>
                        <span className="font-bold text-usm-blue-dark">{teamInfo.formedYear}</span>
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

          {/* Derniers résultats */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-usm-blue-primary/40 pb-2 mb-6 gap-2">
              <h3 className="font-display font-extrabold text-xl uppercase tracking-wider text-usm-blue-dark flex items-center gap-2">
                <TrendingUp size={18} className="text-usm-blue-primary" />
                {language === 'ar' ? 'آخر نتائج المباريات الرسمية' : 'Derniers Résultats Officiels'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-usm-blue-soft border border-usm-border px-3 py-1 rounded-full w-fit">
                {language === 'ar' ? 'أحدث المباريات المكتملة' : 'Dernières rencontres disputées'}
              </span>
            </div>

            {liveLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((n) => <div key={n} className="skeleton-loader h-28 rounded-2xl" />)}
              </div>
            ) : recentResults.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">
                {language === 'ar' ? 'لا توجد نتائج حديثة' : 'Aucun résultat récent disponible'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentResults.map((r) => {
                  const badge = resultBadgeFor(r);
                  const year = new Date(r.date).getFullYear();
                  return (
                    <div key={r.id} className="usm-card rounded-2xl p-4 flex flex-col justify-between hover:border-usm-blue-primary/40 transition-colors shadow-md">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide flex items-center gap-1">
                            <Clock3 size={10} className="text-usm-blue-primary" /> {fmtDate(r.date)}
                          </span>
                          <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {year}
                          </span>
                        </div>
                        {badge && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${badge.className}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {r.homeBadge && <img src={r.homeBadge} alt="" className="h-6 w-6 object-contain shrink-0" />}
                          <span className={`text-xs truncate ${r.homeTeamId === USM_TEAM_ID || r.homeTeam.toLowerCase().includes('monastir') ? 'font-black text-usm-blue-dark' : 'text-slate-500'}`}>
                            {r.homeTeam}
                          </span>
                        </div>
                        <span className="font-display font-black text-base text-usm-blue-dark shrink-0 px-2 py-1 bg-usm-blue-soft rounded-lg border border-usm-border">
                          {r.homeScore} - {r.awayScore}
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className={`text-xs truncate text-right ${r.awayTeamId === USM_TEAM_ID || r.awayTeam.toLowerCase().includes('monastir') ? 'font-black text-usm-blue-dark' : 'text-slate-500'}`}>
                            {r.awayTeam}
                          </span>
                          {r.awayBadge && <img src={r.awayBadge} alt="" className="h-6 w-6 object-contain shrink-0" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Classement */}
          <div>
            <h3 className="font-display font-extrabold text-xl uppercase tracking-wider text-usm-blue-dark border-b-2 border-usm-blue-primary/40 pb-2 mb-6 flex items-center justify-between">
              <span>🏆 {language === 'ar' ? 'ترتيب البطولة المحترفة الأولى' : 'Classement Ligue 1'}</span>
              <span className="text-[9px] font-bold text-slate-500 normal-case tracking-normal">TheSportsDB</span>
            </h3>
            <LeagueStandingsTable
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

      {/* ════════════════ BASKETBALL — CLUB-MANAGED ════════════════ */}
      {sportTab === 'basketball' && (
        <div className="animate-[fadeIn_0.25s_ease-out]">
          {!selectedBBMatch ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bbLoading ? (
                [0, 1].map((n) => <div key={n} className="skeleton-loader h-56 rounded-2xl" />)
              ) : basketballMatches.length > 0 ? (
                basketballMatches.map((m) => {
                  const isLive = m.status === 'live';
                  const isFinished = m.status === 'finished';
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedBBMatch(m)}
                      className="usm-card rounded-2xl p-5 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-usm-border pb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          🏀 {language === 'ar' ? m.competitionAr : m.competition}
                        </span>
                        {isLive ? (
                          <span className="text-[9px] bg-usm-danger text-usm-blue-dark font-extrabold px-2 py-0.5 rounded animate-red-live-pulse tracking-wide uppercase">
                            {t('match.live')}
                          </span>
                        ) : isFinished ? (
                          <span className="text-[9px] bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                            {language === 'ar' ? 'انتهت' : 'Terminé'}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-usm-blue-primary/30 text-usm-blue-primary font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                            {language === 'ar' ? 'مجدولة' : 'Programmé'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-4 my-2">
                        <div className="flex flex-col items-center w-24 text-center">
                          <Logo size={42} />
                          <span className="text-xs font-bold text-usm-blue-dark mt-2 block line-clamp-1">
                            {language === 'ar' ? m.homeTeamAr : m.homeTeam}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          {isLive || isFinished ? (
                            <div className="flex items-center space-x-3">
                              <span className="font-display font-black text-2xl text-usm-blue-dark">{m.score.home}</span>
                              <span className="text-slate-600">-</span>
                              <span className="font-display font-black text-2xl text-usm-blue-dark">{m.score.away}</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-usm-blue-primary">{m.time}</span>
                          )}
                          <span className="text-[9px] text-slate-500 font-bold mt-2 uppercase">{m.date}</span>
                        </div>
                        <div className="flex flex-col items-center w-24 text-center">
                          <img src={m.awayLogo} alt={m.awayTeam} className="h-10 w-auto object-contain" />
                          <span className="text-xs font-bold text-usm-blue-dark mt-2 block line-clamp-1">
                            {language === 'ar' ? m.awayTeamAr : m.awayTeam}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-usm-border flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className="truncate max-w-[200px]">📍 {language === 'ar' ? m.venueAr : m.venue}</span>
                        <span className="text-usm-blue-primary group-hover:translate-x-1.5 transition-transform flex items-center space-x-1 rtl:space-x-reverse">
                          <span>{language === 'ar' ? 'التفاصيل' : 'Détails'}</span>
                          <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 py-12 text-center col-span-2">
                  {language === 'ar' ? 'لا توجد مباريات كرة سلة مبرمجة' : 'Aucun match de basketball programmé'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <button
                onClick={() => setSelectedBBMatch(null)}
                className="flex items-center space-x-1 rtl:space-x-reverse text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wide bg-usm-blue-soft px-4 py-2 rounded-xl cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{language === 'ar' ? 'العودة' : 'Retour aux matchs'}</span>
              </button>

              <div className="usm-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-usm-blue-primary text-usm-blue-primary text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-usm-blue-primary/25">
                  🏀 {selectedBBMatch.competition}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-around py-8 gap-8 mt-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center p-3 mb-3">
                      <Logo size={70} />
                    </div>
                    <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wide">
                      {language === 'ar' ? selectedBBMatch.homeTeamAr : selectedBBMatch.homeTeam}
                    </h3>
                  </div>
                  <div className="flex flex-col items-center">
                    {selectedBBMatch.status === 'live' || selectedBBMatch.status === 'finished' ? (
                      <div className="flex items-center space-x-6 text-usm-blue-dark">
                        <span className="font-display font-black text-5xl tracking-widest">{selectedBBMatch.score.home}</span>
                        <span className="text-2xl text-slate-500 font-extrabold">-</span>
                        <span className="font-display font-black text-5xl tracking-widest">{selectedBBMatch.score.away}</span>
                      </div>
                    ) : (
                      <span className="font-display font-black text-3xl text-usm-blue-primary uppercase tracking-wider">
                        {selectedBBMatch.time}
                      </span>
                    )}
                    <span className="text-[9px] bg-usm-blue-soft text-slate-500 font-extrabold px-3 py-1 rounded-full mt-4 tracking-widest uppercase">
                      {selectedBBMatch.status === 'live'
                        ? (language === 'ar' ? 'المباراة جارية' : 'En direct')
                        : selectedBBMatch.status === 'finished'
                        ? (language === 'ar' ? 'انتهت المباراة' : 'Match terminé')
                        : (language === 'ar' ? 'مبرمجة' : 'À venir')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center p-3 mb-3">
                      <img src={selectedBBMatch.awayLogo} alt={selectedBBMatch.awayTeam} className="h-16 w-auto object-contain" />
                    </div>
                    <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wide">
                      {language === 'ar' ? selectedBBMatch.awayTeamAr : selectedBBMatch.awayTeam}
                    </h3>
                  </div>
                </div>
                <div className="border-t border-usm-border pt-4 text-center text-xs text-slate-500 flex justify-center items-center space-x-1.5 rtl:space-x-reverse">
                  <MapPin size={13} className="text-usm-blue-primary" />
                  <span>{language === 'ar' ? selectedBBMatch.venueAr : selectedBBMatch.venue} • {selectedBBMatch.date}</span>
                </div>
              </div>

              {/* Prediction — genuine fan feature, works for any upcoming match */}
              {selectedBBMatch.status === 'upcoming' && (
                <div className="usm-card rounded-2xl p-6 max-w-md">
                  <h3 className="font-display font-extrabold text-lg text-usm-blue-dark mb-3 uppercase border-b border-usm-border pb-2">
                    {language === 'ar' ? 'توقع النتيجة' : 'Prédire le score'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {language === 'ar' ? 'اربح 50 نقطة زرقاء عند التوقع الصحيح.' : 'Gagnez 50 points bleus pour un pronostic correct.'}
                  </p>
                  {predictions[selectedBBMatch.id] ? (
                    <div className="p-3 bg-usm-blue-primary/10 border border-usm-blue-primary/30 rounded-xl text-center">
                      <span className="text-xs text-usm-blue-primary font-bold">
                        {language === 'ar' ? 'توقعك:' : 'Votre pronostic :'} <strong>{predictions[selectedBBMatch.id]}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <input
                        id={`dpred-${selectedBBMatch.id}`}
                        type="text"
                        placeholder="e.g. 84-79"
                        className="w-24 bg-white border border-usm-border rounded-lg text-center text-xs font-semibold text-usm-blue-dark px-2 py-2 outline-none"
                      />
                      <button
                        onClick={() => {
                          const val = (document.getElementById(`dpred-${selectedBBMatch.id}`) as HTMLInputElement)?.value;
                          if (val) {
                            submitPrediction(selectedBBMatch.id, val);
                            addBluePoints(50);
                          }
                        }}
                        className="flex-grow py-2 bg-usm-blue-primary text-white text-xs font-bold uppercase rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {language === 'ar' ? 'إرسال' : 'Envoyer'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Player of the Match — genuine fan feature (roster-backed) */}
              {selectedBBMatch.status === 'finished' && selectedBBMatch.lineups?.home && selectedBBMatch.lineups.home.length > 0 && (
                <div className="usm-card rounded-2xl p-6 max-w-md">
                  <h3 className="font-display font-extrabold text-lg text-usm-blue-dark mb-3 uppercase border-b border-usm-border pb-2">
                    {t('match.votePlayer')}
                  </h3>
                  {votedPOM[selectedBBMatch.id] ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center flex items-center justify-center space-x-2">
                      <Check className="text-green-400" size={16} />
                      <span className="text-xs text-green-400 font-bold">
                        {language === 'ar' ? 'صوّتَ لـ:' : 'Voté pour :'} <strong className="text-usm-blue-dark ml-1">{votedPOM[selectedBBMatch.id]}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedBBMatch.lineups.home.slice(0, 3).map((pName: string) => (
                        <button
                          key={pName}
                          onClick={() => handlePOMVote(selectedBBMatch.id, pName)}
                          className="w-full p-2.5 bg-usm-blue-soft hover:bg-usm-blue-primary/25 border border-usm-border hover:border-usm-blue-primary/30 rounded-lg text-xs font-semibold text-slate-600 hover:text-white cursor-pointer transition-all flex items-center justify-between"
                        >
                          <span>{pName}</span>
                          <ChevronLeft className="rotate-180 text-slate-500" size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
