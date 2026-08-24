'use client';

import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  Database,
  ArrowUpDown,
  Radio,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';

interface HealthStatus {
  football: {
    provider: string;
    healthy: boolean;
    currentLeagueId: string;
    currentSeason: string;
    currentSeasonLabel: string;
    syncEnabled: boolean;
    apiKeyStatus: string;
    lastSuccessfulSyncAt: string | null;
    lastAttemptAt: string | null;
    lastStatus: string;
    lastError: string | null;
  };
  basketball: {
    provider: string;
    healthy: boolean;
    currentLeagueId: string;
    currentSeason: string;
    currentSeasonLabel: string;
    syncEnabled: boolean;
    apiKeyStatus: string;
    lastSuccessfulSyncAt: string | null;
    lastAttemptAt: string | null;
    lastStatus: string;
    lastError: string | null;
  };
  statuses: any[];
  serverTime: string;
  timezone: string;
}

interface SyncLog {
  _id: string;
  provider: string;
  sport: string;
  resourceType: string;
  competition: string;
  season: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED';
  message: string;
  fetchedCount: number;
  updatedCount: number;
  skippedCount: number;
  durationMs: number;
  triggeredBy: string;
  createdAt: string;
}

export default function AdminSportsSync() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAction, setSyncingAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const [healthData, logsData] = await Promise.all([
        api.getAdminSportsSyncStatus(),
        api.getAdminSportsSyncLogs({ limit: 30 }),
      ]);
      setHealth(healthData);
      setLogs(logsData?.items || []);
    } catch (e: any) {
      console.error('Failed to load sports sync status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSync = async (
    actionKey: string,
    payload: { sport?: string; resourceType?: string; competitionId?: string; season?: string },
    label: string,
  ) => {
    setSyncingAction(actionKey);
    setNotification(null);
    try {
      const res = await api.triggerAdminSportsSync(payload);
      let resultMsg = `${label} terminée avec succès.`;
      if (res && typeof res === 'object') {
        if (res.message) {
          resultMsg = res.message;
        } else if (res.football || res.basketball) {
          const fCount = res.football?.standings?.updated ?? 0;
          const bCount = res.basketball?.standings?.updated ?? 0;
          resultMsg = `Synchronisation réussie (${fCount + bCount} éléments mis à jour).`;
        }
      }
      setNotification({ type: 'success', message: resultMsg });
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erreur lors de la synchronisation' });
    } finally {
      setSyncingAction(null);
    }
  };

  const formatDate = (dStr?: string | null) => {
    if (!dStr) return 'Jamais';
    const d = new Date(dStr);
    return d.toLocaleString('fr-FR', {
      timeZone: 'Africa/Tunis',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Synchronisation Sportive"
        description="Contrôle centralisé du moteur de synchronisation des classements, matchs et résultats pour le Football et Basketball."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings/sports"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              <Sliders size={14} /> Paramètres Fournisseurs
            </Link>
            <button
              onClick={() => handleTriggerSync('all', { resourceType: 'all' }, 'Synchronisation globale')}
              disabled={!!syncingAction}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              <RefreshCw size={14} className={syncingAction === 'all' ? 'animate-spin' : ''} />
              Synchroniser tout
            </button>
          </div>
        }
      />

      {/* Result Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Football Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-usm-blue-primary/10 flex items-center justify-center text-usm-blue-primary font-black">
                  ⚽
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Football — Ligue 1 Tunisienne</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Fournisseur : {health?.football.provider || 'API-Football'}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                  health?.football.healthy
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {health?.football.healthy ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                {health?.football.healthy ? 'Opérationnel' : 'Erreur'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dernière synchro réussie :</span>
                <span className="font-semibold text-slate-800 font-mono">{formatDate(health?.football.lastSuccessfulSyncAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Saison active :</span>
                <span className="font-semibold text-slate-800">{health?.football.currentSeasonLabel || '2024-2025'} (ID {health?.football.currentLeagueId || '202'})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Clé API :</span>
                <span className="font-semibold text-slate-800">{health?.football.apiKeyStatus}</span>
              </div>
              {health?.football.lastError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px]">
                  Dernier avertissement : {health.football.lastError}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleTriggerSync('f_standings', { sport: 'football', resourceType: 'standings' }, 'Synchro classements football')}
              disabled={!!syncingAction}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              <ArrowUpDown size={12} className={syncingAction === 'f_standings' ? 'animate-spin' : ''} />
              Classement
            </button>
            <button
              onClick={() => handleTriggerSync('f_fixtures', { sport: 'football', resourceType: 'fixtures' }, 'Synchro matchs football')}
              disabled={!!syncingAction}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              <Radio size={12} className={syncingAction === 'f_fixtures' ? 'animate-spin' : ''} />
              Matchs
            </button>
            <button
              onClick={() => handleTriggerSync('f_results', { sport: 'football', resourceType: 'results' }, 'Synchro résultats football')}
              disabled={!!syncingAction}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              <Activity size={12} className={syncingAction === 'f_results' ? 'animate-spin' : ''} />
              Résultats
            </button>
            <button
              onClick={() => handleTriggerSync('f_all', { sport: 'football', resourceType: 'all' }, 'Synchro Football')}
              disabled={!!syncingAction}
              className="col-span-2 sm:col-span-3 px-3 py-2 bg-usm-blue-primary/10 hover:bg-usm-blue-primary/20 text-usm-blue-primary rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} className={syncingAction === 'f_all' ? 'animate-spin' : ''} />
              Synchroniser tout Football
            </button>
          </div>
        </div>

        {/* Basketball Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black">
                  🏀
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Basketball — Pro A Tunisie</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Fournisseur : {health?.basketball.provider || 'Basketball Repository'}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                  health?.basketball.healthy
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {health?.basketball.healthy ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                {health?.basketball.healthy ? 'Opérationnel' : 'Erreur'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dernière synchro réussie :</span>
                <span className="font-semibold text-slate-800 font-mono">{formatDate(health?.basketball.lastSuccessfulSyncAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Saison active :</span>
                <span className="font-semibold text-slate-800">{health?.basketball.currentSeasonLabel || '2025-2026'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Statut :</span>
                <span className="font-semibold text-slate-800">{health?.basketball.apiKeyStatus}</span>
              </div>
              {health?.basketball.lastError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px]">
                  Dernier avertissement : {health.basketball.lastError}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleTriggerSync('b_standings', { sport: 'basketball', resourceType: 'standings' }, 'Synchro classements basketball')}
              disabled={!!syncingAction}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              <ArrowUpDown size={12} className={syncingAction === 'b_standings' ? 'animate-spin' : ''} />
              Classement
            </button>
            <button
              onClick={() => handleTriggerSync('b_all', { sport: 'basketball', resourceType: 'all' }, 'Synchro Basketball')}
              disabled={!!syncingAction}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} className={syncingAction === 'b_all' ? 'animate-spin' : ''} />
              Synchroniser Basketball
            </button>
          </div>
        </div>
      </div>

      {/* Sync Logs Audit Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-usm-blue-primary" />
              Journal des Synchronisations (Audit Trail)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Historique des requêtes planifiées et manuelles avec durée et volumétrie.</p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Date / Heure (Tunisie)</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Ressource</th>
                <th className="py-3 px-4">Fournisseur</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-center">Éléments</th>
                <th className="py-3 px-4 text-center">Durée</th>
                <th className="py-3 px-4">Déclencheur</th>
                <th className="py-3 px-4">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="py-3 px-4 capitalize font-bold text-slate-900">{log.sport}</td>
                  <td className="py-3 px-4 capitalize text-slate-700">{log.resourceType}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.provider}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.status === 'SKIPPED'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-700">
                    {log.updatedCount} / {log.fetchedCount}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{log.durationMs} ms</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500 uppercase">{log.triggeredBy}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-[260px] truncate" title={log.message}>
                    {log.message}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Aucun historique de synchronisation pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
