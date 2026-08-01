'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { api } from '../../lib/api-client';
import { Plus, X, Trash2, Pencil, MapPin, Loader2, Save } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface Venue {
  _id: string; name: string; nameAr: string; sport: 'football' | 'basketball' | 'other';
  description: string; descriptionAr: string; image?: string; capacity?: number; gates: string;
  address: string; addressAr: string; directions: string; directionsAr: string;
  services: string; displayOrder: number; status: 'draft' | 'published';
}
interface SafetyRule { title: string; description: string; }
interface StadiumPageForm {
  heroTitle: string; heroSubtitle: string; heroImage: string;
  safetyIntro: string; safetyRules: SafetyRule[]; status: 'draft' | 'published';
}

const SPORTS: Venue['sport'][] = ['football', 'basketball', 'other'];

const emptyVenueForm = {
  name: '', nameAr: '', sport: 'other' as Venue['sport'], description: '', descriptionAr: '',
  image: '', capacity: '' as number | '', gates: '', address: '', addressAr: '',
  directions: '', directionsAr: '', services: '', displayOrder: 0, status: 'published' as 'draft' | 'published',
};

const emptyPageForm: StadiumPageForm = {
  heroTitle: '', heroSubtitle: '', heroImage: '', safetyIntro: '', safetyRules: [], status: 'published',
};

export default function AdminStadium() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [pageForm, setPageForm] = useState<StadiumPageForm>(emptyPageForm);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyVenueForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, p] = await Promise.all([api.getAdminVenues(), api.getAdminStadiumPage()]);
      setVenues(v || []);
      setPageForm({
        heroTitle: p.heroTitle || '', heroSubtitle: p.heroSubtitle || '', heroImage: p.heroImage || '',
        safetyIntro: p.safetyIntro || '', safetyRules: p.safetyRules || [], status: p.status || 'published',
      });
    } catch {
      setError('Impossible de charger le guide du stade');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPage(true);
    setPageMessage('');
    try {
      await api.updateStadiumPage(pageForm);
      setPageMessage('Page enregistrée.');
    } catch (err: any) {
      setPageMessage(err.message || 'Échec de l’enregistrement');
    } finally {
      setSavingPage(false);
    }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyVenueForm); setShowForm(true); };
  const openEdit = (venue: Venue) => {
    setEditingId(venue._id);
    setForm({
      name: venue.name, nameAr: venue.nameAr, sport: venue.sport,
      description: venue.description, descriptionAr: venue.descriptionAr, image: venue.image || '',
      capacity: venue.capacity ?? '', gates: venue.gates, address: venue.address, addressAr: venue.addressAr,
      directions: venue.directions, directionsAr: venue.directionsAr,
      services: (venue.services as unknown as string[])?.join(', ') || '',
      displayOrder: venue.displayOrder, status: venue.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    const payload = {
      ...form,
      capacity: form.capacity === '' ? undefined : Number(form.capacity),
      services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) await api.updateVenue(editingId, payload);
      else await api.createVenue(payload);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (venue: Venue) => {
    requestConfirmation({
      title: 'Supprimer ce site ?',
      message: `« ${venue.name} » sera retiré du guide du stade.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await api.deleteVenue(venue._id); await load(); }
        catch (err: any) { setError(err.message || 'Échec de la suppression'); }
      },
    });
  };

  const addRule = () => setPageForm((f) => ({ ...f, safetyRules: [...f.safetyRules, { title: '', description: '' }] }));
  const updateRule = (i: number, field: keyof SafetyRule, value: string) =>
    setPageForm((f) => ({ ...f, safetyRules: f.safetyRules.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)) }));
  const removeRule = (i: number) => setPageForm((f) => ({ ...f, safetyRules: f.safetyRules.filter((_, idx) => idx !== i) }));

  if (loading) {
    return <div className="py-20 text-center"><Loader2 size={24} className="animate-spin inline-block text-usm-blue-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Guide du stade" description="Gérez le contenu de la page /stadium et la liste des sites." />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error} <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      {/* PAGE CONTENT */}
      <form onSubmit={savePage} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Contenu de la page</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre héro</label>
            <input value={pageForm.heroTitle} onChange={(e) => setPageForm((f) => ({ ...f, heroTitle: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sous-titre héro</label>
            <input value={pageForm.heroSubtitle} onChange={(e) => setPageForm((f) => ({ ...f, heroSubtitle: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image héro</label>
          <MediaUploader compact folder="stadium/hero" currentUrl={pageForm.heroImage} onUpload={(file) => setPageForm((f) => ({ ...f, heroImage: file.url }))} onRemove={() => setPageForm((f) => ({ ...f, heroImage: '' }))} />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Introduction sécurité</label>
          <textarea rows={2} value={pageForm.safetyIntro} onChange={(e) => setPageForm((f) => ({ ...f, safetyIntro: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Règles de sécurité</label>
            <button type="button" onClick={addRule} className="text-[10px] font-bold text-usm-blue-primary flex items-center gap-1 cursor-pointer"><Plus size={12} /> Ajouter</button>
          </div>
          {pageForm.safetyRules.map((rule, i) => (
            <div key={i} className="flex gap-2 items-start bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="flex-1 space-y-1.5">
                <input value={rule.title} onChange={(e) => updateRule(i, 'title', e.target.value)} placeholder="Titre" className="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 outline-none focus:border-usm-blue-primary" />
                <textarea rows={2} value={rule.description} onChange={(e) => updateRule(i, 'description', e.target.value)} placeholder="Description" className="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <button type="button" onClick={() => removeRule(i)} className="p-1.5 text-slate-400 hover:text-red-500 rounded cursor-pointer"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        {pageMessage && <p className="text-[11px] text-slate-500">{pageMessage}</p>}
        <button type="submit" disabled={savingPage} className="flex items-center gap-1.5 px-4 py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:bg-slate-300 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors">
          <Save size={13} /> {savingPage ? 'Enregistrement…' : 'Enregistrer la page'}
        </button>
      </form>

      {/* VENUES */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Sites & enceintes</h3>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
          <Plus size={14} /> Ajouter un site
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sites" value={venues.length} icon={MapPin} accent="blue" />
        <StatCard label="Publiés" value={venues.filter((v) => v.status === 'published').length} icon={MapPin} accent="emerald" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Capacité</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {venues.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucun site pour le moment.</td></tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{venue.name}</td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{venue.sport}</td>
                    <td className="py-2.5 px-4 text-slate-600">{venue.capacity ? venue.capacity.toLocaleString('fr-FR') : '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${venue.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {venue.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button onClick={() => openEdit(venue)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(venue)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"><Trash2 size={13} /></button>
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
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier le site' : 'Ajouter un site'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sport</label>
                  <select value={form.sport} onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as Venue['sport'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Photo</label>
                <MediaUploader compact folder="stadium/venues" currentUrl={form.image} onUpload={(file) => setForm((f) => ({ ...f, image: file.url }))} onRemove={() => setForm((f) => ({ ...f, image: '' }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Capacité</label>
                  <input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value === '' ? '' : Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Portes</label>
                  <input value={form.gates} onChange={(e) => setForm((f) => ({ ...f, gates: e.target.value }))} placeholder="Gates A, B, C" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Adresse</label>
                <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Itinéraire</label>
                <textarea rows={2} value={form.directions} onChange={(e) => setForm((f) => ({ ...f, directions: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Services (séparés par des virgules)</label>
                <input value={form.services} onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))} placeholder="VIP Lounges, Media Desk" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
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
