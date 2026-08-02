'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { api } from '../../lib/api-client';
import { Plus, X, Trash2, Pencil, History, Star, Loader2 } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface TimelineEvent {
  _id: string; year: string; date?: string; month?: number; day?: number; title: string; description: string;
  sport: 'club' | 'football' | 'basketball' | 'city'; image?: string;
  isHighlighted: boolean; displayOrder: number; status: 'draft' | 'published';
}

const SPORTS: TimelineEvent['sport'][] = ['club', 'football', 'basketball', 'city'];

const emptyForm = {
  year: '', date: '', month: '' as number | '', day: '' as number | '', title: '', description: '',
  sport: 'club' as TimelineEvent['sport'], image: '',
  isHighlighted: false, displayOrder: 0, status: 'published' as 'draft' | 'published',
};

export default function AdminTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageUploading, setImageUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await api.getAdminTimeline());
    } catch {
      setError('Impossible de charger la chronologie');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (ev: TimelineEvent) => {
    setEditingId(ev._id);
    setForm({
      year: ev.year, date: ev.date || '', month: ev.month ?? '', day: ev.day ?? '', title: ev.title, description: ev.description,
      sport: ev.sport, image: ev.image || '', isHighlighted: ev.isHighlighted,
      displayOrder: ev.displayOrder, status: ev.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.title) return;
    setSaving(true);
    const payload = {
      ...form,
      month: form.month === '' ? undefined : Number(form.month),
      day: form.day === '' ? undefined : Number(form.day),
    };
    try {
      if (editingId) await api.updateTimelineEvent(editingId, payload);
      else await api.createTimelineEvent(payload);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (ev: TimelineEvent) => {
    requestConfirmation({
      title: 'Supprimer cet événement ?',
      message: `« ${ev.title} » (${ev.year}) sera retiré de la chronologie.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await api.deleteTimelineEvent(ev._id); await load(); }
        catch (err: any) { setError(err.message || 'Échec de la suppression'); }
      },
    });
  };

  const published = events.filter((e) => e.status === 'published').length;
  const highlighted = events.filter((e) => e.isHighlighted).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chronologie USM"
        description="Gérez les événements clés de l’histoire du club affichés sur /histoire."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> Ajouter un événement
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error} <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Événements" value={events.length} icon={History} accent="blue" />
        <StatCard label="Publiés" value={published} icon={History} accent="emerald" />
        <StatCard label="Mis en avant" value={highlighted} icon={Star} accent="amber" />
        <StatCard label="Brouillons" value={events.length - published} icon={History} accent="slate" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Année</th>
                <th className="py-3 px-4">Titre</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucun événement pour le moment.</td></tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      {ev.isHighlighted && <Star size={12} className="text-amber-400 fill-amber-400" />}
                      {ev.year}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">{ev.title}</td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{ev.sport}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ev.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {ev.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button onClick={() => openEdit(ev)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(ev)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 size={13} /></button>
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
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier l’événement' : 'Ajouter un événement'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Année *</label>
                  <input required value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="2020" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sport</label>
                  <select value={form.sport} onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as TimelineEvent['sport'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image</label>
                <MediaUploader compact folder="heritage/timeline" currentUrl={form.image} onUpload={(file) => setForm((f) => ({ ...f, image: file.url }))} onRemove={() => setForm((f) => ({ ...f, image: '' }))} onUploadingChange={setImageUploading} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mois (« Ce jour dans l’histoire »)</label>
                  <input type="number" min={1} max={12} placeholder="1-12" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value === '' ? '' : Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jour</label>
                  <input type="number" min={1} max={31} placeholder="1-31" value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value === '' ? '' : Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
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
                <input type="checkbox" checked={form.isHighlighted} onChange={(e) => setForm((f) => ({ ...f, isHighlighted: e.target.checked }))} className="size-4" />
                Événement mis en avant (icône trophée sur la chronologie)
              </label>
              <button type="submit" disabled={saving || imageUploading} className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:bg-slate-300 text-white text-xs font-black uppercase rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors mt-2">
                {imageUploading ? 'Envoi de l’image…' : saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
