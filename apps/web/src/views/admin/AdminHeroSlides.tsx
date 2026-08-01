'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import {
  Plus, X, Trash2, Pencil, GalleryHorizontal, Eye, EyeOff,
  ArrowUp, ArrowDown, Loader2, ImageUp, ImageIcon,
} from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  overlayStrength: 'light' | 'medium' | 'strong';
  textPosition: 'left' | 'center' | 'right';
  page: string;
  displayOrder: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

const emptyForm = {
  title: '', subtitle: '', badgeText: '',
  backgroundImage: '', mobileBackgroundImage: '',
  primaryCtaText: '', primaryCtaLink: '', secondaryCtaText: '', secondaryCtaLink: '',
  overlayStrength: 'medium' as HeroSlide['overlayStrength'],
  textPosition: 'left' as HeroSlide['textPosition'],
  page: 'home',
  displayOrder: 0,
  isActive: true,
  startsAt: '', endsAt: '',
};

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminHeroSlides('home');
      setSlides((data || []).sort((a: HeroSlide, b: HeroSlide) => a.displayOrder - b.displayOrder));
    } catch {
      setError('Impossible de charger les slides du hero.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, displayOrder: slides.length });
    setShowForm(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditingId(s._id);
    setForm({
      title: s.title, subtitle: s.subtitle || '', badgeText: s.badgeText || '',
      backgroundImage: s.backgroundImage, mobileBackgroundImage: s.mobileBackgroundImage || '',
      primaryCtaText: s.primaryCtaText || '', primaryCtaLink: s.primaryCtaLink || '',
      secondaryCtaText: s.secondaryCtaText || '', secondaryCtaLink: s.secondaryCtaLink || '',
      overlayStrength: s.overlayStrength || 'medium', textPosition: s.textPosition || 'left',
      page: s.page || 'home', displayOrder: s.displayOrder,
      isActive: s.isActive, startsAt: s.startsAt ? s.startsAt.slice(0, 10) : '', endsAt: s.endsAt ? s.endsAt.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleUpload = async (file: File, target: 'desktop' | 'mobile') => {
    setUploading(target);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');
      const uploaded = await api.uploadMedia(formData);
      setForm((f) => ({
        ...f,
        [target === 'desktop' ? 'backgroundImage' : 'mobileBackgroundImage']: uploaded.url,
      }));
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi de l'image.");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.backgroundImage) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      };
      if (editingId) await api.updateHeroSlide(editingId, payload);
      else await api.createHeroSlide(payload);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (s: HeroSlide) => {
    requestConfirmation({
      title: 'Supprimer ce slide ?',
      message: `« ${s.title} » sera retiré du carrousel de la page d'accueil.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await api.deleteHeroSlide(s._id); await load(); }
        catch (err: any) { setError(err.message || 'Échec de la suppression.'); }
      },
    });
  };

  const toggleActive = async (s: HeroSlide) => {
    try { await api.updateHeroSlide(s._id, { isActive: !s.isActive }); await load(); }
    catch (err: any) { setError(err.message || 'Échec de la mise à jour.'); }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSlides(reordered);
    try {
      await api.reorderHeroSlides(reordered.map((s, i) => ({ id: s._id, displayOrder: i })));
      await load();
    } catch (err: any) {
      setError(err.message || 'Échec de la réorganisation.');
      await load();
    }
  };

  const activeCount = slides.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Hero de la page d'accueil"
        description="Gérez le carrousel de bannières affiché en haut de la page d'accueil (/)."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> Ajouter un slide
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error} <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Slides" value={slides.length} icon={GalleryHorizontal} accent="blue" />
        <StatCard label="Actifs" value={activeCount} icon={Eye} accent="emerald" />
        <StatCard label="Masqués" value={slides.length - activeCount} icon={EyeOff} accent="slate" />
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400"><Loader2 size={22} className="animate-spin inline-block" /></div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-sm text-slate-400">
          Aucun slide pour le moment. La page d’accueil utilisera une bannière de secours.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((s, index) => (
            <div key={s._id} className={`group relative border rounded-2xl overflow-hidden bg-white shadow-sm ${s.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
              <div className="relative aspect-video bg-slate-900">
                <img src={s.backgroundImage} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                  <button onClick={() => openEdit(s)} aria-label="Modifier" className="flex size-9 items-center justify-center rounded-lg bg-white/90 text-slate-700 hover:bg-white cursor-pointer"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s)} aria-label="Supprimer" className="flex size-9 items-center justify-center rounded-lg bg-white/90 text-red-600 hover:bg-white cursor-pointer"><Trash2 size={14} /></button>
                </div>
                <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-wider text-white bg-black/50 rounded px-2 py-0.5">#{index + 1}</span>
                {s.badgeText && <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider text-white bg-usm-blue-primary rounded-full px-2 py-0.5">{s.badgeText}</span>}
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate">{s.title}</p>
                  {s.subtitle && <p className="text-[10px] text-slate-400 truncate">{s.subtitle}</p>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(index, -1)} disabled={index === 0} title="Monter" className="p-1 rounded text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ArrowUp size={13} /></button>
                    <button onClick={() => move(index, 1)} disabled={index === slides.length - 1} title="Descendre" className="p-1 rounded text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ArrowDown size={13} /></button>
                  </div>
                  <button
                    onClick={() => toggleActive(s)}
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer transition-colors ${s.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {s.isActive ? 'Actif' : 'Masqué'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier le slide' : 'Ajouter un slide'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image de fond (desktop) *</label>
                <input ref={desktopFileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'desktop')} />
                {form.backgroundImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video">
                    <img src={form.backgroundImage} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => desktopFileRef.current?.click()} className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all cursor-pointer">
                      <ImageUp size={20} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => desktopFileRef.current?.click()} disabled={uploading === 'desktop'} className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-usm-blue-primary hover:text-usm-blue-primary cursor-pointer transition-colors disabled:opacity-50">
                    {uploading === 'desktop' ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                    <span className="text-[10px] font-bold uppercase">{uploading === 'desktop' ? 'Envoi…' : 'Choisir une image'}</span>
                  </button>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image mobile (optionnel)</label>
                <input ref={mobileFileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'mobile')} />
                {form.mobileBackgroundImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24">
                    <img src={form.mobileBackgroundImage} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, mobileBackgroundImage: '' }))} className="absolute top-1 right-1 p-1 rounded bg-white/90 text-red-600 cursor-pointer"><X size={12} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => mobileFileRef.current?.click()} disabled={uploading === 'mobile'} className="w-full h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-400 hover:border-usm-blue-primary hover:text-usm-blue-primary cursor-pointer transition-colors disabled:opacity-50 text-[10px] font-bold uppercase">
                    {uploading === 'mobile' ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} Choisir une image mobile
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sous-titre</label>
                  <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Badge</label>
                  <input value={form.badgeText} onChange={(e) => setForm((f) => ({ ...f, badgeText: e.target.value }))} placeholder="Club officiel" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CTA principal — texte</label>
                  <input value={form.primaryCtaText} onChange={(e) => setForm((f) => ({ ...f, primaryCtaText: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CTA principal — lien</label>
                  <input value={form.primaryCtaLink} onChange={(e) => setForm((f) => ({ ...f, primaryCtaLink: e.target.value }))} placeholder="/histoire" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CTA secondaire — texte</label>
                  <input value={form.secondaryCtaText} onChange={(e) => setForm((f) => ({ ...f, secondaryCtaText: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CTA secondaire — lien</label>
                  <input value={form.secondaryCtaLink} onChange={(e) => setForm((f) => ({ ...f, secondaryCtaLink: e.target.value }))} placeholder="/palmares" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Intensité de l’overlay</label>
                  <select value={form.overlayStrength} onChange={(e) => setForm((f) => ({ ...f, overlayStrength: e.target.value as HeroSlide['overlayStrength'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    <option value="light">Légère</option>
                    <option value="medium">Moyenne</option>
                    <option value="strong">Forte</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Position du texte</label>
                  <select value={form.textPosition} onChange={(e) => setForm((f) => ({ ...f, textPosition: e.target.value as HeroSlide['textPosition'] }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre</label>
                  <input type="number" min={0} value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Début de diffusion (optionnel)</label>
                  <input type="date" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fin de diffusion (optionnel)</label>
                  <input type="date" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4" />
                Slide actif (visible sur le site)
              </label>

              <button type="submit" disabled={saving || !form.backgroundImage} className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:bg-slate-300 text-white text-xs font-black uppercase rounded-lg cursor-pointer disabled:cursor-not-allowed transition-colors mt-2">
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
