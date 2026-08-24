'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { Settings as SettingsIcon, Check } from 'lucide-react';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { tr } from '../../utils/i18n';
import Link from 'next/link';

export default function AdminSettings() {
  const { clubSettings, updateClubSettings, language } = useApp();
  const [form, setForm] = useState(clubSettings);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClubSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Club information shown across the public site (footer, contact points, social links)."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/sports-sync"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              Tableau de bord Synchro
            </Link>
            <Link
              href="/admin/settings/sports"
              className="px-3 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Configuration Sports
            </Link>
          </div>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 max-w-2xl space-y-6"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <SettingsIcon size={16} className="text-usm-blue-primary" />
          <h3 className="text-sm font-black text-slate-900 font-display">
            {tr(language, 'General & Contact', 'Général & Contact', 'عام والاتصال')}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">
              {tr(language, 'Club Name', 'Nom du club', 'اسم النادي')}
            </label>
            <input
              type="text"
              value={form.clubName}
              onChange={(e) => setForm((f) => ({ ...f, clubName: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">
                {tr(language, 'Contact Email', 'E-mail de contact', 'البريد الإلكتروني للاتصال')}
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">
                {tr(language, 'Contact Phone', 'Téléphone de contact', 'هاتف الاتصال')}
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">
              {tr(language, 'Address', 'Adresse', 'العنوان')}
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-wider">
              {tr(language, 'Club Logo', 'Logo du club', 'شعار النادي')}
            </label>
            <MediaUploader
              folder="settings/logo"
              currentUrl={form.logoUrl}
              label={tr(language, 'Drop club logo or click to browse', 'Déposer le logo du club ou cliquer pour choisir', 'أفلت شعار النادي أو انقر للتصفح')}
              onUpload={(file) => setForm((f) => ({ ...f, logoUrl: file.url }))}
              onRemove={() => setForm((f) => ({ ...f, logoUrl: '' }))}
              onUploadingChange={setLogoUploading}
            />
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">
            {tr(language, 'Social Media', 'Réseaux Sociaux', 'وسائل التواصل الاجتماعي')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Facebook</label>
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">YouTube</label>
              <input
                type="text"
                value={form.youtube}
                onChange={(e) => setForm((f) => ({ ...f, youtube: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-usm-blue-primary focus:bg-white transition-all focus:ring-4 focus:ring-usm-blue-primary/5"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="submit"
            disabled={logoUploading}
            className="px-6 py-3 bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-usm-blue-primary/15 flex items-center gap-1.5 w-fit disabled:cursor-not-allowed disabled:opacity-50"
          >
            {logoUploading ? (
              tr(language, 'Uploading image…', 'Envoi de l’image…', 'جارٍ رفع الصورة…')
            ) : saved ? (
              <>
                <Check size={14} /> {tr(language, 'Saved Settings', 'Paramètres enregistrés', 'تم حفظ الإعدادات')}
              </>
            ) : (
              tr(language, 'Save Settings', 'Enregistrer les paramètres', 'حفظ الإعدادات')
            )}
          </button>
          <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
            {tr(
              language,
              'Changes apply immediately to the public site footer and contact points.',
              "Les modifications s'appliquent immédiatement au pied de page et aux points de contact du site public.",
              'تسري التغييرات فورًا على تذييل الموقع العام ونقاط الاتصال.'
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
