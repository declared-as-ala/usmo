'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { MediaLibrary } from '../../components/Admin/MediaLibrary';
import { api } from '../../lib/api-client';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

const sectionLabels: Record<string, string> = {
  hero: 'Hero', today: 'Actualités du jour', news: 'Dernières actualités',
  heritage: 'Aperçu Histoire & Palmarès',
  standings: 'Classement et palmarès', spotlight: 'Joueur et sondage', catalog: 'Boutique',
  supporterGallery: 'Galerie supporters', newsletter: 'Newsletter',
};
type Settings = { heroTitle: string; heroSubtitle: string; heroDescription: string; heroImageUrl: string; primaryCtaLabel: string; primaryCtaHref: string; sections: Record<string, boolean> };
type FanPhoto = { _id: string; imageUrl: string; caption: string; supporterName: string; published: boolean };

const emptySettings: Settings = { heroTitle: '', heroSubtitle: '', heroDescription: '', heroImageUrl: '', primaryCtaLabel: '', primaryCtaHref: '', sections: {} };

export default function AdminPages() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [photos, setPhotos] = useState<FanPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoForm, setPhotoForm] = useState({ imageUrl: '', caption: '', supporterName: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [homepage, fanPhotos] = await Promise.all([api.getHomepageSettings(), api.getAdminFanPhotos()]);
      setSettings(homepage); setPhotos(fanPhotos || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Chargement impossible'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage('');
    try { setSettings(await api.updateHomepageSettings(settings)); setMessage('Page d’accueil enregistrée.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Enregistrement impossible'); }
    finally { setSaving(false); }
  };

  const addPhoto = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const created = await api.createFanPhoto({ ...photoForm, published: true });
      setPhotos((current) => [created, ...current]); setPhotoForm({ imageUrl: '', caption: '', supporterName: '' });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Ajout impossible'); }
  };

  const togglePhoto = async (photo: FanPhoto) => {
    const updated = await api.updateFanPhoto(photo._id, { published: !photo.published });
    setPhotos((current) => current.map((item) => item._id === photo._id ? updated : item));
  };

  const deletePhoto = (photo: FanPhoto) => {
    requestConfirmation({ title: 'Supprimer cette photo ?', message: `La photo de ${photo.supporterName || 'ce supporter'} sera supprimée définitivement.`, confirmLabel: 'Supprimer', onConfirm: async () => { await api.deleteFanPhoto(photo._id); setPhotos(current => current.filter(item => item._id !== photo._id)); } });
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-usm-blue-primary" aria-label="Chargement" /></div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Page d’accueil" description="Gérez le hero, la visibilité des sections et la galerie supporters publiée sur le site." />
      {message && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}

      <form onSubmit={saveSettings} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-bold text-slate-900">Contenu du hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[['heroTitle', 'Titre'], ['heroSubtitle', 'Sous-titre'], ['primaryCtaLabel', 'Texte du bouton'], ['primaryCtaHref', 'Lien du bouton']].map(([key, label]) => (
            <label key={key} className="text-sm font-semibold text-slate-700">{label}<input value={String(settings[key as keyof Settings] || '')} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:ring-2 focus:ring-blue-300" /></label>
          ))}
        </div>
        <label className="block text-sm font-semibold text-slate-700">Description<textarea value={settings.heroDescription} onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })} className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 p-3 font-normal outline-none focus:ring-2 focus:ring-blue-300" /></label>
        <label className="block text-sm font-semibold text-slate-700">Image du hero<div className="mt-1 flex gap-2"><input value={settings.heroImageUrl} onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })} className="min-h-11 flex-1 rounded-xl border border-slate-300 px-3 font-normal outline-none focus:ring-2 focus:ring-blue-300" /><button type="button" onClick={() => setPickerOpen(true)} className="min-h-11 rounded-xl bg-slate-100 px-4 text-sm font-bold hover:bg-slate-200">Médiathèque</button></div></label>
        <div><h2 className="mb-3 font-bold text-slate-900">Sections visibles</h2><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(sectionLabels).map(([key, label]) => { const enabled = settings.sections?.[key] !== false; return <button key={key} type="button" onClick={() => setSettings({ ...settings, sections: { ...settings.sections, [key]: !enabled } })} aria-pressed={enabled} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-sm font-semibold ${enabled ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500'}`}>{enabled ? <Eye size={16} /> : <EyeOff size={16} />}{label}</button>; })}</div></div>
        <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-usm-blue-primary px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Enregistrer</button>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-bold text-slate-900">Galerie supporters</h2>
        <form onSubmit={addPhoto} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input required placeholder="URL MinIO de l’image" value={photoForm.imageUrl} onChange={(e) => setPhotoForm({ ...photoForm, imageUrl: e.target.value })} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm" />
          <input placeholder="Nom du supporter" value={photoForm.supporterName} onChange={(e) => setPhotoForm({ ...photoForm, supporterName: e.target.value })} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm" />
          <input placeholder="Légende" value={photoForm.caption} onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm" />
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white"><Plus size={17} /> Ajouter</button>
        </form>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{photos.map((photo) => <article key={photo._id} className={`overflow-hidden rounded-xl border ${photo.published ? 'border-slate-200' : 'border-amber-300 opacity-70'}`}><div className="aspect-square bg-slate-100"><img src={photo.imageUrl} alt={photo.caption || photo.supporterName} className="size-full object-cover" /></div><div className="flex items-center justify-between gap-2 p-2"><p className="min-w-0 truncate text-xs font-semibold">{photo.supporterName || 'Supporter USM'}</p><div className="flex"><button type="button" aria-label={photo.published ? 'Masquer' : 'Publier'} onClick={() => void togglePhoto(photo)} className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">{photo.published ? <Eye size={15} /> : <EyeOff size={15} />}</button><button type="button" aria-label="Supprimer" onClick={() => void deletePhoto(photo)} className="flex size-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div></div></article>)}</div>
      </section>
      <MediaLibrary isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(file) => { setSettings({ ...settings, heroImageUrl: file.url }); setPickerOpen(false); }} typeFilter="image" />
    </div>
  );
}
