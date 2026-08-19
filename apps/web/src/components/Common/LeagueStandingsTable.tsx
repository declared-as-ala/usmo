'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api-client';

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
}

interface LeagueStandingsTableProps {
  posLabel: string;
  teamLabel: string;
  playedLabel: string;
  wonLabel: string;
  pointsLabel: string;
  diffLabel: string;
  emptyLabel: string;
  limit?: number;
  className?: string;
  footer?: React.ReactNode;
}

/** Live Tunisian Ligue 1 table sourced from TheSportsDB — shared by Home and Match Center. */
export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({
  posLabel, teamLabel, playedLabel, wonLabel, pointsLabel, diffLabel, emptyLabel, limit, className = '', footer,
}) => {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getFootballStandings()
      .then((res: any) => {
        if (!active) return;
        if (res && res.standings && res.standings.length > 0) {
          const mapped: StandingRow[] = res.standings.map((r: any) => ({
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
          }));
          setStandings(mapped);
        } else {
          api.getStandings()
            .then((rows: StandingRow[]) => { if (active) setStandings(rows || []); })
            .catch(() => {});
        }
      })
      .catch(() => {
        api.getStandings()
          .then((rows: StandingRow[]) => { if (active) setStandings(rows || []); })
          .catch(() => {});
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

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
              <tr key={row.teamId || row.position} className={row.isUSM ? 'bg-usm-blue-primary/15 text-usm-blue-dark font-bold' : ''}>
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
                  <span>{row.team}</span>
                </td>
                <td className="px-4 py-3 text-center">{row.played}</td>
                <td className="px-4 py-3 text-center">{row.won}</td>
                <td className="px-4 py-3 text-center text-usm-blue-primary font-bold">{row.points}</td>
                <td className="px-4 py-3 text-center text-slate-500">{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {footer}
    </div>
  );
};
