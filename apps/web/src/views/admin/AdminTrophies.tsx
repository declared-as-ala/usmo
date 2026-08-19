'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { Plus, X, Trash2, Pencil, Trophy, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface TrophyRow {
  _id: string; sport: 'football' | 'basketball'; competition: string;
  achievementType: string; titleCount: number; years: string; season: string;
  description: string; remarks: string; isFeatured: boolean; verified: boolean;
  sourceNote: string; displayOrder: number; status: 'draft' | 'published';
}

const SPORTS: TrophyRow['sport'][] = ['football', 'basketball'];
const TYPES = ['Winner', 'Runner-up', 'Champion', 'Podium', 'Participation'];

const emptyForm = {
  sport: 'football' as TrophyRow['sport'], competition: '', achievementType: 'Winner',
  titleCount: 1, years: '', season: '', description: '', remarks: '',
  isFeatured: false, verified: true, sourceNote: '', displayOrder: 0, status: 'published' as 'draft' | 'published',
};

export default function AdminTrophies() {
  const [trophies, setTrophies] = useState<TrophyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sportFilter, setSportFilter] = useState<'all' | TrophyRow['sport']>('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTrophies(await api.getAdminTrophies());
    } catch {
      setError('Impossible de charger les trophées');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.getAdminTrophies()
      .then((data) => { if (active) setTrophies(data || []); })
      .catch(() => { if (active) setError('Impossible de charger les trophées'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t: TrophyRow) => {
    setEditingId(t._id);
    setForm({
      sport: t.sport, competition: t.competition, achievementType: t.achievementType,
      titleCount: t.titleCount, years: t.years, season: t.season || '', description: t.description,
      remarks: t.remarks || '', isFeatured: t.isFeatured, verified: t.verified,
      sourceNote: t.sourceNote || '', displayOrder: t.displayOrder, status: t.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.competition) return;
    setSaving(true);
    try {
      if (editingId) await api.updateTrophy(editingId, form);
      else await api.createTrophy(form);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (t: TrophyRow) => {
    requestConfirmation({
      title: 'Supprimer ce trophée ?',
      message: `« ${t.competition} — ${t.achievementType} » sera retiré du palmarès.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await api.deleteTrophy(t._id); await load(); }
        catch (err: any) { setError(err.message || 'Échec de la suppression'); }
      },
    });
  };

  const visible = sportFilter === 'all' ? trophies : trophies.filter((t) => t.sport === sportFilter);
  const unverifiedCount = trophies.filter((t) => !t.verified).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Palmarès & Trophées"
        description="Gérez les trophées football et basketball affichés sur /palmares."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> Ajouter un trophée
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error} <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Trophées" value={trophies.length} icon={Trophy} accent="blue" />
        <StatCard label="Football" value={trophies.filter((t) => t.sport === 'football').length} icon={Trophy} accent="slate" />
        <StatCard label="Basketball" value={trophies.filter((t) => t.sport === 'basketball').length} icon={Trophy} accent="amber" />
        <StatCard label="À vérifier" value={unverifiedCount} icon={AlertTriangle} accent="emerald" />
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
                <th className="py-3 px-4">Compétition</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Titres</th>
                <th className="py-3 px-4">Années</th>
                <th className="py-3 px-4">Vérifié</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Aucun trophée pour ce filtre.</td></tr>
              ) : (
                visible.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      {t.isFeatured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                      {t.competition}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{t.sport}</td>
                    <td className="py-2.5 px-4 text-slate-600">{t.achievementType}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-mono">{t.titleCount}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-[160px] truncate">{t.years}</td>
                    <td className="py-2.5 px-4">
                      {t.verified ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">Oui</span>
                      ) : (
                        <span title={t.sourceNote} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700">À vérifier</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(t)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 size={13} /></button>
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
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier le trophée' : 'Ajouter un trophée'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sport</label>
                  <select value={form.sport} onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as TrophyRow['sport'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type</label>
                  <select value={form.achievementType} onChange={(e) => setForm((f) => ({ ...f, achievementType: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Compétition *</label>
                <input required value={form.competition} onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre de titres</label>
                  <input type="number" min={0} value={form.titleCount} onChange={(e) => setForm((f) => ({ ...f, titleCount: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Années</label>
                  <input value={form.years} onChange={(e) => setForm((f) => ({ ...f, years: e.target.value }))} placeholder="2019, 2020, 2021..." className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
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
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="size-4" />
                Trophée mis en avant
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))} className="size-4" />
                Donnée vérifiée
              </label>
              {!form.verified && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Note de vérification</label>
                  <textarea rows={2} value={form.sourceNote} onChange={(e) => setForm((f) => ({ ...f, sourceNote: e.target.value }))} placeholder="Pourquoi cette donnée doit être vérifiée avant publication..." className="w-full bg-amber-50 border border-amber-200 text-xs rounded-lg p-2.5 outline-none focus:border-amber-400 resize-none" />
                </div>
              )}
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
