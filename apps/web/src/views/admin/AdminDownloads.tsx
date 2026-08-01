'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { api } from '../../lib/api-client';
import { Plus, X, Trash2, Pencil, FileText, Loader2 } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface DownloadItem {
  _id: string; title: string; titleAr: string; description: string; descriptionAr: string;
  category: 'regulations' | 'membership' | 'press-kit' | 'forms' | 'other';
  fileUrl: string; fileType: string; fileSizeKb: number; downloadCount: number;
  displayOrder: number; status: 'draft' | 'published';
}

const CATEGORIES: DownloadItem['category'][] = ['regulations', 'membership', 'press-kit', 'forms', 'other'];

const emptyForm = {
  title: '', titleAr: '', description: '', descriptionAr: '',
  category: 'other' as DownloadItem['category'], fileUrl: '', fileType: '', fileSizeKb: 0,
  displayOrder: 0, status: 'published' as 'draft' | 'published',
};

export default function AdminDownloads() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.getAdminDownloads());
    } catch {
      setError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: DownloadItem) => {
    setEditingId(item._id);
    setForm({
      title: item.title, titleAr: item.titleAr, description: item.description, descriptionAr: item.descriptionAr,
      category: item.category, fileUrl: item.fileUrl, fileType: item.fileType, fileSizeKb: item.fileSizeKb,
      displayOrder: item.displayOrder, status: item.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.fileUrl) return;
    setSaving(true);
    try {
      if (editingId) await api.updateDownload(editingId, form);
      else await api.createDownload(form);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: DownloadItem) => {
    requestConfirmation({
      title: 'Supprimer ce document ?',
      message: `« ${item.title} » sera retiré du centre de téléchargement.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await api.deleteDownload(item._id); await load(); }
        catch (err: any) { setError(err.message || 'Échec de la suppression'); }
      },
    });
  };

  const totalDownloads = items.reduce((sum, i) => sum + (i.downloadCount || 0), 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Centre de téléchargement"
        description="Gérez les documents publiés sur /telechargements."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> Ajouter un document
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error} <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Documents" value={items.length} icon={FileText} accent="blue" />
        <StatCard label="Publiés" value={items.filter((i) => i.status === 'published').length} icon={FileText} accent="emerald" />
        <StatCard label="Téléchargements" value={totalDownloads} icon={FileText} accent="amber" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Titre</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Téléchargements</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucun document pour le moment.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{item.category}</td>
                    <td className="py-2.5 px-4 text-slate-600">{item.downloadCount || 0}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 size={13} /></button>
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
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier le document' : 'Ajouter un document'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fichier *</label>
                <MediaUploader compact folder="downloads" currentUrl={form.fileUrl} onUpload={(file) => setForm((f) => ({ ...f, fileUrl: file.url, fileType: file.url.split('.').pop() || '', fileSizeKb: Math.round((file.size || 0) / 1024) }))} onRemove={() => setForm((f) => ({ ...f, fileUrl: '' }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as DownloadItem['category'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre d’affichage</label>
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Statut</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                  <option value="published">Publié</option>
                  <option value="draft">Brouillon</option>
                </select>
              </div>
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
