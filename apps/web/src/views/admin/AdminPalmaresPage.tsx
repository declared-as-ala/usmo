'use client';

import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { api } from '../../lib/api-client';
import { Trophy, Loader2, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';

interface PalmaresPageForm {
  heroBadge: string; heroTitle: string; heroSubtitle: string; heroImage: string; heroCtaText: string;
  seoTitle: string; seoDescription: string; status: 'draft' | 'published';
}

const emptyForm: PalmaresPageForm = {
  heroBadge: '', heroTitle: '', heroSubtitle: '', heroImage: '', heroCtaText: '',
  seoTitle: '', seoDescription: '', status: 'published',
};

export default function AdminPalmaresPage() {
  const { language } = useApp();
  const [form, setForm] = useState<PalmaresPageForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [heroImageUploading, setHeroImageUploading] = useState(false);

  useEffect(() => {
    api.getAdminPalmaresPage()
      .then((doc: any) => setForm({
        heroBadge: doc.heroBadge || '', heroTitle: doc.heroTitle || '', heroSubtitle: doc.heroSubtitle || '',
        heroImage: doc.heroImage || '', heroCtaText: doc.heroCtaText || '',
        seoTitle: doc.seoTitle || '', seoDescription: doc.seoDescription || '', status: doc.status || 'published',
      }))
      .catch(() => setMessage(tr(language, 'Unable to load page data', 'Chargement impossible', 'تعذر تحميل بيانات الصفحة')))
      .finally(() => setLoading(false));
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.updatePalmaresPage(form);
      setMessage(tr(language, 'Palmarès page saved successfully.', 'Page Palmarès enregistrée.', 'تم حفظ صفحة التتويجات بنجاح.'));
    } catch (err: any) {
      setMessage(err.message || tr(language, 'Unable to save data', 'Enregistrement impossible', 'تعذر حفظ البيانات'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="animate-spin text-usm-blue-primary" aria-label={tr(language, 'Loading...', 'Chargement...', 'جاري التحميل...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={tr(language, 'Palmarès Page', 'Page Palmarès', 'صفحة التتويجات')}
        description={tr(
          language,
          'Content of the public /palmares page — hero and photo of the museum. Trophies themselves are managed under Trophies List.',
          'Contenu de la page publique /palmares — hero et photo du musée des trophées. Les trophées eux-mêmes se gèrent dans Trophies.',
          'محتوى صفحة التتويجات العامة - واجهة وصورة متحف الكؤوس. يتم إدارة الكؤوس نفسها في قائمة الكؤوس.'
        )}
      />
      {message && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 max-w-3xl">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Trophy size={16} className="text-usm-blue-primary" />
          <h3 className="text-sm font-black text-slate-900 font-display">{tr(language, 'Hero Section', 'Section Hero', 'قسم الواجهة الرئيسية')}</h3>
        </div>
        
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            {tr(language, 'Badge (e.g. "Trophy Room")', 'Badge (ex. "Salle des trophées")', 'الشارة (مثال: "قاعة الكؤوس")')}
            <input value={form.heroBadge} onChange={(e) => setForm((f) => ({ ...f, heroBadge: e.target.value }))} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs" />
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {tr(language, 'Title (e.g. "Our Palmarès")', 'Titre (ex. "Notre Palmarès")', 'العنوان (مثال: "تتويجاتنا")')}
              <input value={form.heroTitle} onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs" />
            </label>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {tr(language, 'Button Text', 'Texte du bouton', 'نص الزر')}
              <input value={form.heroCtaText} onChange={(e) => setForm((f) => ({ ...f, heroCtaText: e.target.value }))} placeholder={tr(language, 'Explore collection', 'Explorer la collection', 'استكشف المجموعة')} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs" />
            </label>
          </div>
          
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            {tr(language, 'Subtitle', 'Sous-titre', 'العنوان الفرعي')}
            <textarea rows={2} value={form.heroSubtitle} onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs resize-none" />
          </label>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-wider">{tr(language, 'Hero Photo', 'Photo du hero', 'صورة الواجهة')}</label>
            <MediaUploader folder="heritage/palmares" currentUrl={form.heroImage} label={tr(language, 'Drop trophy museum photo or click to browse', 'Déposez la photo du musée des trophées ou cliquez pour choisir', 'أفلت صورة متحف الكؤوس أو انقر للتصفح')} onUpload={(file) => setForm((f) => ({ ...f, heroImage: file.url }))} onRemove={() => setForm((f) => ({ ...f, heroImage: '' }))} onUploadingChange={setHeroImageUploading} />
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-4 font-display">{tr(language, 'SEO & Publication', 'SEO & publication', 'السيو والنشر')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {tr(language, 'SEO Title', 'Titre SEO', 'عنوان السيو')}
              <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs" />
            </label>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {tr(language, 'Status', 'Statut', 'الحالة')}
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs">
                <option value="published">{tr(language, 'Published', 'Publié', 'منشور')}</option>
                <option value="draft">{tr(language, 'Draft', 'Brouillon', 'مسودة')}</option>
              </select>
            </label>
          </div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            {tr(language, 'SEO Description', 'Description SEO', 'وصف السيو')}
            <textarea rows={2} value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal outline-none focus:border-usm-blue-primary focus:bg-white transition-all text-xs resize-none" />
          </label>
        </div>

        <button disabled={saving || heroImageUploading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-usm-blue-primary px-6 text-xs font-black uppercase text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-usm-blue-hover transition-colors shadow-lg shadow-usm-blue-primary/15 cursor-pointer">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {heroImageUploading ? tr(language, 'Uploading image…', 'Envoi de l’image…', 'جارٍ رفع الصورة…') : tr(language, 'Save Page', 'Enregistrer', 'حفظ الصفحة')}
        </button>
      </form>
    </div>
  );
}
