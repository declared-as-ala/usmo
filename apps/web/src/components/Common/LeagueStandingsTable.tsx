'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';
import { Clock } from 'lucide-react';

interface StandingRow {
  position: number;
  teamId: string;
  team: string;
  badge: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
  points: number;
  isUSM: boolean;
  form?: string | null;
}

interface LeagueStandingsTableProps {
  posLabel: string;
  teamLabel: string;
  playedLabel: string;
  wonLabel: string;
  pointsLabel: string;
  diffLabel: string;
  emptyLabel: string;
  sport?: 'football' | 'basketball';
  limit?: number;
  className?: string;
  footer?: React.ReactNode;
  showFreshness?: boolean;
}

/** Live Tunisian League table sourced from NestJS backend cache — shared by Home and Match Center. */
export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({
  posLabel,
  teamLabel,
  playedLabel,
  wonLabel,
  pointsLabel,
  diffLabel,
  emptyLabel,
  sport = 'football',
  limit,
  className = '',
  footer,
  showFreshness = true,
}) => {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [freshnessText, setFreshnessText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // 1. Fetch standings from MongoDB-backed sports-sync endpoint
    api
      .getSportsSyncStandings(sport)
      .then((rows: any[]) => {
        if (!active) return;
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped: StandingRow[] = rows.map((r: any) => ({
            position: r.position || r.rank,
            teamId: String(r.teamId || r._id || r.teamName),
            team: r.teamName || r.team,
            badge: r.teamLogo || r.badge || r.logo || null,
            played: Number(r.played ?? 0),
            won: Number(r.won ?? r.win ?? 0),
            drawn: Number(r.drawn ?? r.draw ?? 0),
            lost: Number(r.lost ?? r.lose ?? 0),
            goalDiff: Number(r.goalDifference ?? r.goalDiff ?? 0),
            points: Number(r.points ?? 0),
            isUSM: Boolean(r.isUSM),
            form: r.form || null,
          }));
          setStandings(mapped);
        } else {
          // Fallback to legacy endpoints if empty
          api
            .getFootballStandings()
            .then((res: any) => {
              if (!active) return;
              if (res?.standings?.length > 0) {
                setStandings(
                  res.standings.map((r: any) => ({
                    position: r.rank,
                    teamId: String(r.teamId),
                    team: r.team,
                    badge: r.logo,
                    played: r.played,
                    won: r.win,
                    drawn: r.draw,
                    lost: r.lose,
                    goalDiff: r.goalDifference,
                    points: r.points,
                    isUSM: r.isUSM,
                  })),
                );
              } else {
                api.getStandings().then((fb) => { if (active) setStandings(fb || []); }).catch(() => {});
              }
            })
            .catch(() => {
              api.getStandings().then((fb) => { if (active) setStandings(fb || []); }).catch(() => {});
            });
        }
      })
      .catch(() => {
        api
          .getFootballStandings()
          .then((res: any) => {
            if (!active) return;
            if (res?.standings?.length > 0) {
              setStandings(
                res.standings.map((r: any) => ({
                  position: r.rank,
                  teamId: String(r.teamId),
                  team: r.team,
                  badge: r.logo,
                  played: r.played,
                  won: r.win,
                  drawn: r.draw,
                  lost: r.lose,
                  goalDiff: r.goalDifference,
                  points: r.points,
                  isUSM: r.isUSM,
                })),
              );
            } else {
              api.getStandings().then((fb) => { if (active) setStandings(fb || []); }).catch(() => {});
            }
          })
          .catch(() => {
            api.getStandings().then((fb) => { if (active) setStandings(fb || []); }).catch(() => {});
          });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // 2. Fetch freshness
    api
      .getSportsSyncFreshness(sport)
      .then((f: any) => {
        if (!active || !f?.lastSyncAt) return;
        const syncDate = new Date(f.lastSyncAt);
        const diffMins = Math.floor((Date.now() - syncDate.getTime()) / (60 * 1000));
        if (diffMins < 2) {
          setFreshnessText('Mis à jour à l’instant');
        } else if (diffMins < 60) {
          setFreshnessText(`Mis à jour il y a ${diffMins} min`);
        } else {
          const timeStr = syncDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Tunis',
          });
          setFreshnessText(`Dernière synchronisation : ${timeStr}`);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [sport]);

  // Compute displayed rows based on optional limit
  const getDisplayedRows = () => {
    if (!limit || standings.length <= limit) return standings;
    const topRows = standings.slice(0, limit);
    const usmRow = standings.find((r) => r.isUSM);
    // If USM is not in the top limit rows, append USM row so it is always visible
    if (usmRow && !topRows.some((r) => r.isUSM)) {
      return [...topRows, usmRow];
    }
    return topRows;
  };

  const displayedRows = getDisplayedRows();

  return (
    <div className={`bg-usm-blue-soft/70 border border-usm-border rounded-2xl overflow-hidden shadow ${className}`}>
      {loading ? (
        <div className="p-4 space-y-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-loader h-9 rounded-lg" />
          ))}
        </div>
      ) : standings.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-10">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-xs text-slate-600 text-left rtl:text-right">
            <thead className="bg-usm-blue-soft font-bold text-usm-blue-dark text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">{posLabel}</th>
                <th className="px-4 py-3">{teamLabel}</th>
                <th className="px-4 py-3 text-center">{playedLabel}</th>
                <th className="px-4 py-3 text-center">{wonLabel}</th>
                <th className="px-4 py-3 text-center">{pointsLabel}</th>
                <th className="px-4 py-3 text-center">{diffLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {displayedRows.map((row) => (
                <tr
                  key={row.teamId || row.team}
                  className={row.isUSM ? 'bg-usm-blue-primary/15 text-usm-blue-dark font-bold' : ''}
                >
                  <td className="px-4 py-3 text-center font-display font-black text-slate-500">
                    {row.position}
                  </td>
                  <td className="px-4 py-3 flex items-center space-x-2 rtl:space-x-reverse">
                    {row.isUSM && <span className="h-1.5 w-1.5 rounded-full bg-usm-blue-primary animate-live-pulse" />}
                    {row.badge ? (
                      <img src={row.badge} alt="" className="h-4 w-4 object-contain" />
                    ) : row.isUSM ? (
                      <img src="/logo.png" alt="" className="h-4 w-4 object-contain" />
                    ) : null}
                    <span className="truncate max-w-[180px]">{row.team}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold">{row.played}</td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-emerald-600">{row.won}</td>
                  <td className="px-4 py-3 text-center text-usm-blue-primary font-bold font-mono">{row.points}</td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Freshness Bar */}
      {showFreshness && freshnessText && (
        <div className="px-4 py-2 bg-usm-blue-soft/50 border-t border-usm-border/40 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-usm-blue-primary" />
            <span>{freshnessText}</span>
          </span>
          <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-400">
            {sport === 'football' ? 'Ligue 1' : 'Pro A'}
          </span>
        </div>
      )}

      {footer}
    </div>
  );
};
