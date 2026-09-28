'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { LeagueStandingsTable } from '../components/Common/LeagueStandingsTable';
import { Logo } from '../components/Common/Logo';
import {
  MapPin, Calendar, Users2,
  Clock3, ExternalLink, Radio,
} from 'lucide-react';

interface ResultRow {
  id: string; date: string; time: string; competition: string; round: string | null;
  homeTeam: string; awayTeam: string; homeTeamId: string; awayTeamId: string;
  homeScore: number | null; awayScore: number | null; homeBadge: string | null; awayBadge: string | null;
  venue: string | null;
  quarters?: { home: number[]; away: number[] } | null;
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

  // Load Football data
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

    // 2. Fetch Football Team Information
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
  }, []);

  // Load Basketball data
  useEffect(() => {
    let cancelled = false;
    setBbLoading(true);

    Promise.all([
      api.getMatches('basketball').catch(() => []),
      api.getSportsSyncTeamInfo('basketball').catch(() => null),
    ])
      .then(([matches, team]) => {
        if (cancelled) return;
        const normalized = (matches || []).map((m: any) => ({
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
  }, []);

  const fmtDate = (d: string) => {
    try {
      return new Date(`${d}T00:00:00`).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  // Derive basketball next match
  const bbUpcoming = basketballMatches.filter((m) => m.status === 'upcoming' || m.status === 'live');
  const nextBBMatch = bbUpcoming.length > 0 ? bbUpcoming[0] : null;

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

      {/* ════════════════ BASKETBALL — PROCHAIN MATCH ════════════════ */}
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
                  const homeIsOpponent = !isHomeUsm;
                  const awayIsOpponent = isHomeUsm;

                  return (
                    <div className="flex items-center justify-around gap-4">
                      {/* Home Team */}
                      <div className="flex flex-col items-center text-center w-28">
                        {homeIsOpponent ? (
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-700 mb-2 shadow-sm">
                            {nextBBMatch.homeTeam.slice(0, 3).toUpperCase()}
                          </div>
                        ) : (
                          <Logo size={56} className="mb-2" />
                        )}
                        <span className="text-xs font-bold text-usm-blue-dark line-clamp-2">
                          {language === 'ar' ? nextBBMatch.homeTeamAr || nextBBMatch.homeTeam : nextBBMatch.homeTeam}
                        </span>
                      </div>

                      {/* Match Details */}
                      <div className="flex flex-col items-center gap-2">
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
                      <div className="flex flex-col items-center text-center w-28">
                        {awayIsOpponent ? (
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-700 mb-2 shadow-sm">
                            {nextBBMatch.awayTeam.slice(0, 3).toUpperCase()}
                          </div>
                        ) : (
                          <Logo size={56} className="mb-2" />
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
                  <Logo size={64} className="mb-3" />
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
        </div>
      )}
    </div>
  );
};

