'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { Plus, X, Trash2, Pencil, CalendarDays, AlertTriangle, Loader2 } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface SeasonRow {
  _id: string; sport: 'football' | 'basketball'; type: 'league' | 'continental';
  season: string; competition: string; leaguePosition: string;
  nationalCompetitions: string; internationalCompetitions: string;
  stageReached: string; notableOpponents: string; achievementSummary: string;
  notes: string; displayOrder: number; verified: boolean; status: 'draft' | 'published';
}

const SPORTS: SeasonRow['sport'][] = ['football', 'basketball'];
const TYPES: SeasonRow['type'][] = ['league', 'continental'];

const emptyForm = {
  sport: 'football' as SeasonRow['sport'], type: 'league' as SeasonRow['type'], season: '',
  competition: '', leaguePosition: '', nationalCompetitions: '', internationalCompetitions: '',
  stageReached: '', notableOpponents: '', achievementSummary: '', notes: '',
  displayOrder: 0, verified: true, status: 'published' as 'draft' | 'published',
};

export default function AdminSeasonPerformance() {
  const [rows, setRows] = useState<SeasonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sportFilter, setSportFilter] = useState<'all' | SeasonRow['sport']>('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.getAdminSeasonPerformance());
    } catch {
      setError('Impossible de charger les performances par saison');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (r: SeasonRow) => {
    setEditingId(r._id);
    setForm({
      sport: r.sport, type: r.type, season: r.season, competition: r.competition || '',
      leaguePosition: r.leaguePosition || '', nationalCompetitions: r.nationalCompetitions || '',
      internationalCompetitions: r.internationalCompetitions || '', stageReached: r.stageReached || '',
      notableOpponents: r.notableOpponents || '', achievementSummary: r.achievementSummary || '',
      notes: r.notes || '', displayOrder: r.displayOrder, verified: r.verified, status: r.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.season) return;
    setSaving(true);
    try {
      if (editingId) await api.updateSeasonPerformance(editingId, form);
      else await api.createSeasonPerformance(form);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (r: SeasonRow) => {
    requestConfirmation({
      title: 'Supprimer cette ligne ?',
      message: `La saison « ${r.season} » (${r.sport}) sera retirée.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await api.deleteSeasonPerformance(r._id); await load(); }
        catch (err: any) { setError(err.message || 'Échec de la suppression'); }
      },
    });
  };

  const visible = sportFilter === 'all' ? rows : rows.filter((r) => r.sport === sportFilter);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Performance par saison"
        description="Classements Ligue 1, compétitions africaines et saisons basketball affichés sur /palmares."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> Ajouter une saison
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error} <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lignes" value={rows.length} icon={CalendarDays} accent="blue" />
        <StatCard label="Football" value={rows.filter((r) => r.sport === 'football').length} icon={CalendarDays} accent="slate" />
        <StatCard label="Basketball" value={rows.filter((r) => r.sport === 'basketball').length} icon={CalendarDays} accent="amber" />
        <StatCard label="À vérifier" value={rows.filter((r) => !r.verified).length} icon={AlertTriangle} accent="emerald" />
      </div>

      <div className="flex gap-2">
        {(['all', 'football', 'basketball'] as const).map((s) => (
          <button key={s} onClick={() => setSportFilter(s)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer transition-colors ${sportFilter === s ? 'bg-usm-blue-dark text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-usm-blue-primary'}`}>
            {s === 'all' ? 'Tous' : s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Saison</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Résumé</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucune ligne pour ce filtre.</td></tr>
              ) : (
                visible.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{r.season}</td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{r.sport}</td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{r.type === 'league' ? 'National' : 'Continental'}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">
                      {r.leaguePosition || r.stageReached || r.internationalCompetitions || r.achievementSummary}
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier la saison' : 'Ajouter une saison'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sport</label>
                  <select value={form.sport} onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as SeasonRow['sport'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as SeasonRow['type'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {TYPES.map((t) => <option key={t} value={t}>{t === 'league' ? 'National' : 'Continental'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Saison *</label>
                  <input required value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} placeholder="2024–2025" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>

              {form.type === 'league' && form.sport === 'football' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Position en championnat</label>
                  <input value={form.leaguePosition} onChange={(e) => setForm((f) => ({ ...f, leaguePosition: e.target.value }))} placeholder="2e place" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              )}

              {form.sport === 'basketball' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Compétitions nationales</label>
                    <input value={form.nationalCompetitions} onChange={(e) => setForm((f) => ({ ...f, nationalCompetitions: e.target.value }))} placeholder="Champion + Coupe" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Compétitions internationales</label>
                    <input value={form.internationalCompetitions} onChange={(e) => setForm((f) => ({ ...f, internationalCompetitions: e.target.value }))} placeholder="BAL – Champion" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                  </div>
                </div>
              )}

              {form.type === 'continental' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Compétition</label>
                    <input value={form.competition} onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))} placeholder="CAF Champions League" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stade atteint</label>
                    <input value={form.stageReached} onChange={(e) => setForm((f) => ({ ...f, stageReached: e.target.value }))} placeholder="Quarts de finale" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Adversaires notables</label>
                    <input value={form.notableOpponents} onChange={(e) => setForm((f) => ({ ...f, notableOpponents: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Résumé</label>
                <textarea rows={2} value={form.achievementSummary} onChange={(e) => setForm((f) => ({ ...f, achievementSummary: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre d’affichage</label>
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Statut</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} className="size-4" />
                Donnée vérifiée
              </label>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:bg-slate-300 text-white text-xs font-black uppercase rounded-lg cursor-pointer disabled:cursor-not-allowed transition-colors mt-2">
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
