'use client';

import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { Save, CheckCircle2, AlertTriangle, Key, Clock, Settings2, Sliders, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminSportsSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    football: {
      provider: 'api-football',
      leagueExternalId: '202',
      teamExternalId: '992',
      currentSeason: '2024',
      currentSeasonLabel: '2024-2025',
      autoDetectSeason: true,
      syncEnabled: true,
      apiKey: '',
    },
    basketball: {
      provider: 'basketball-provider',
      leagueExternalId: 'pro-a-basketball',
      teamExternalId: 'bb_usm',
      currentSeason: '2025-2026',
      currentSeasonLabel: '2025-2026',
      autoDetectSeason: false,
      syncEnabled: true,
      apiKey: '',
    },
    intervals: {
      normalStandingsMinutes: 360,
      matchdayStandingsMinutes: 60,
      liveMatchMinutes: 2,
      normalFixturesMinutes: 360,
      normalResultsMinutes: 180,
      nightlySyncCron: '0 3 * * *',
    },
  });

  const [apiKeyStatus, setApiKeyStatus] = useState({
    football: 'Configured',
    basketball: 'Internal/Configured',
  });

  useEffect(() => {
    api
      .getAdminSportsConfig()
      .then((data: any) => {
        if (data) {
          if (data.football) {
            setForm((prev) => ({
              ...prev,
              football: {
                ...prev.football,
                provider: data.football.provider || prev.football.provider,
                leagueExternalId: data.football.currentLeagueId || prev.football.leagueExternalId,
                currentSeason: data.football.currentSeason || prev.football.currentSeason,
                currentSeasonLabel: data.football.currentSeasonLabel || prev.football.currentSeasonLabel,
                syncEnabled: data.football.syncEnabled !== false,
              },
            }));
            setApiKeyStatus((prev) => ({ ...prev, football: data.football.apiKeyStatus || 'Configured' }));
          }
          if (data.basketball) {
            setForm((prev) => ({
              ...prev,
              basketball: {
                ...prev.basketball,
                provider: data.basketball.provider || prev.basketball.provider,
                currentSeason: data.basketball.currentSeason || prev.basketball.currentSeason,
                currentSeasonLabel: data.basketball.currentSeasonLabel || prev.basketball.currentSeasonLabel,
                syncEnabled: data.basketball.syncEnabled !== false,
              },
            }));
            setApiKeyStatus((prev) => ({ ...prev, basketball: data.basketball.apiKeyStatus || 'Configured' }));
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);
    try {
      await api.updateAdminSportsConfig(form);
      setNotification({ type: 'success', message: 'Paramètres sportifs enregistrés avec succès.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Configuration des Sports & Fournisseurs"
        description="Configuration des identifiants de ligue, saisons, clés d'API externes et intervalles de synchronisation (Super Admin)."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/sports-sync"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              ← Tableau de Bord Synchro
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-red-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FOOTBALL SETTINGS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="text-base">⚽</span> Football — Intégration Ligue 1
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Statut clé API :</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Key size={10} /> {apiKeyStatus.football} (Masquée)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fournisseur Actif</label>
              <select
                value={form.football.provider}
                onChange={(e) => setForm({ ...form, football: { ...form.football, provider: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
              >
                <option value="api-football">API-Football / API-Sports (Recommandé - Couverture Complète)</option>
                <option value="thesportsdb">TheSportsDB</option>
                <option value="manual">Mode Manuel Exclusif</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ID Externe de la Ligue</label>
              <input
                type="text"
                value={form.football.leagueExternalId}
                onChange={(e) => setForm({ ...form, football: { ...form.football, leagueExternalId: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                placeholder="202 (API-Football) ou 4828 (TheSportsDB)"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ID Externe US Monastir</label>
              <input
                type="text"
                value={form.football.teamExternalId}
                onChange={(e) => setForm({ ...form, football: { ...form.football, teamExternalId: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                placeholder="992 (API-Football) ou 139871 (TheSportsDB)"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Paramètre Saison (Fournisseur)</label>
              <input
                type="text"
                value={form.football.currentSeason}
                onChange={(e) => setForm({ ...form, football: { ...form.football, currentSeason: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                placeholder="2024 ou 2025"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Libellé Affiché de la Saison</label>
              <input
                type="text"
                value={form.football.currentSeasonLabel}
                onChange={(e) => setForm({ ...form, football: { ...form.football, currentSeasonLabel: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                placeholder="2024-2025 ou 2025-2026"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.football.syncEnabled}
                  onChange={(e) => setForm({ ...form, football: { ...form.football, syncEnabled: e.target.checked } })}
                  className="rounded border-slate-300 text-usm-blue-primary focus:ring-usm-blue-primary"
                />
                Synchro activée
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.football.autoDetectSeason}
                  onChange={(e) => setForm({ ...form, football: { ...form.football, autoDetectSeason: e.target.checked } })}
                  className="rounded border-slate-300 text-usm-blue-primary focus:ring-usm-blue-primary"
                />
                Détection auto saison
              </label>
            </div>
          </div>
        </div>

        {/* BASKETBALL SETTINGS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="text-base">🏀</span> Basketball — Intégration Pro A & BAL
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Statut clé API :</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Key size={10} /> {apiKeyStatus.basketball}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fournisseur Actif</label>
              <select
                value={form.basketball.provider}
                onChange={(e) => setForm({ ...form, basketball: { ...form.basketball, provider: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
              >
                <option value="basketball-provider">Pro A Repository (Officiel)</option>
                <option value="thesportsdb">TheSportsDB</option>
                <option value="manual">Mode Manuel</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ID Externe Championnat</label>
              <input
                type="text"
                value={form.basketball.leagueExternalId}
                onChange={(e) => setForm({ ...form, basketball: { ...form.basketball, leagueExternalId: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                placeholder="pro-a-basketball"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Libellé Saison</label>
              <input
                type="text"
                value={form.basketball.currentSeasonLabel}
                onChange={(e) => setForm({ ...form, basketball: { ...form.basketball, currentSeasonLabel: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                placeholder="2025-2026"
              />
            </div>
          </div>
        </div>

        {/* INTERVALS & CRON SCHEDULE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-usm-blue-primary" /> Fréquence & Tâches Planifiées (Fuseau : Africa/Tunis)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Intervalle Classement Normal (minutes)</label>
              <input
                type="number"
                min={15}
                value={form.intervals.normalStandingsMinutes}
                onChange={(e) => setForm({ ...form, intervals: { ...form.intervals, normalStandingsMinutes: Number(e.target.value) } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Défaut : 360 min (6 heures)</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Intervalle Jour de Match (minutes)</label>
              <input
                type="number"
                min={5}
                value={form.intervals.matchdayStandingsMinutes}
                onChange={(e) => setForm({ ...form, intervals: { ...form.intervals, matchdayStandingsMinutes: Number(e.target.value) } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Défaut : 60 min (1 heure)</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Intervalle Match en Direct (minutes)</label>
              <input
                type="number"
                min={1}
                max={15}
                value={form.intervals.liveMatchMinutes}
                onChange={(e) => setForm({ ...form, intervals: { ...form.intervals, liveMatchMinutes: Number(e.target.value) } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Défaut : 2 min</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Synchro Complète Nocturne (Expression Cron)</label>
              <input
                type="text"
                value={form.intervals.nightlySyncCron}
                onChange={(e) => setForm({ ...form, intervals: { ...form.intervals, nightlySyncCron: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                placeholder="0 3 * * *"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Défaut : 0 3 * * * (03:00 heure de Tunis)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/sports-sync"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow"
          >
            <Save size={14} />
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}
