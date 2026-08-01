'use client';

import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { FileText, Loader2, Save, ShieldCheck } from 'lucide-react';

type LegalPageKey = 'privacy' | 'terms' | 'cookies';

const TABS: { key: LegalPageKey; label: string; route: string }[] = [
  { key: 'privacy', label: 'Confidentialité', route: '/confidentialite' },
  { key: 'terms', label: "Conditions d'utilisation", route: '/conditions-utilisation' },
  { key: 'cookies', label: 'Cookies', route: '/cookies' },
];

type FormState = Record<LegalPageKey, { title: string; content: string }>;

const emptyForm: FormState = {
  privacy: { title: '', content: '' },
  terms: { title: '', content: '' },
  cookies: { title: '', content: '' },
};

export default function AdminLegalPages() {
  const [active, setActive] = useState<LegalPageKey>('privacy');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getAdminLegalPages()
      .then((docs: { key: LegalPageKey; title: string; content: string }[]) => {
        const next = { ...emptyForm };
        for (const doc of docs) next[doc.key] = { title: doc.title || '', content: doc.content || '' };
        setForm(next);
      })
      .catch(() => setMessage('Chargement impossible'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.updateLegalPage(active, form[active]);
      setMessage('Page enregistrée.');
    } catch (err: any) {
      setMessage(err.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-usm-blue-primary" aria-label="Chargement" /></div>;
  }

  const activeTab = TABS.find((t) => t.key === active)!;
  const activeForm = form[active];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Pages légales" description="Confidentialité, conditions d'utilisation et cookies — affichées en pied de page sur tout le site." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActive(tab.key); setMessage(''); }}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors ${
              active === tab.key
                ? 'border-usm-blue-primary bg-usm-blue-primary/10 text-usm-blue-primary'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {message && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 max-w-3xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-usm-blue-primary" />
            <h3 className="text-sm font-black text-slate-900">{activeTab.label}</h3>
          </div>
          <a href={activeTab.route} target="_blank" rel="noreferrer" className="text-xs font-bold text-usm-blue-primary hover:underline">Voir la page publique →</a>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Titre
          <input
            value={activeForm.title}
            onChange={(e) => setForm((f) => ({ ...f, [active]: { ...f[active], title: e.target.value } }))}
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:ring-2 focus:ring-blue-300"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Contenu
          <textarea
            rows={16}
            value={activeForm.content}
            onChange={(e) => setForm((f) => ({ ...f, [active]: { ...f[active], content: e.target.value } }))}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal leading-6 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </label>

        <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-usm-blue-primary px-5 text-sm font-bold text-white disabled:opacity-50">
          {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Enregistrer
        </button>
      </form>
    </div>
  );
}
