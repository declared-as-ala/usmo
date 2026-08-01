'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../lib/api-client';
import { FileText, Download, ShieldCheck, Users, Newspaper, Folder } from 'lucide-react';

interface DownloadRow {
  _id: string; title: string; titleAr: string; description: string; descriptionAr: string;
  category: 'regulations' | 'membership' | 'press-kit' | 'forms' | 'other';
  fileUrl: string; fileType: string; fileSizeKb: number;
}

type Tab = 'all' | DownloadRow['category'];

const TAB_LABELS: Record<Tab, string> = {
  all: 'Tout', regulations: 'Règlements', membership: 'Adhésion', 'press-kit': 'Kit presse', forms: 'Formulaires', other: 'Autres',
};
const CATEGORY_ICON: Record<DownloadRow['category'], React.ElementType> = {
  regulations: ShieldCheck, membership: Users, 'press-kit': Newspaper, forms: FileText, other: Folder,
};

export const DownloadsCenter: React.FC = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') as Tab | null;
  const [items, setItems] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>(initialCategory && initialCategory in TAB_LABELS ? initialCategory : 'all');

  useEffect(() => {
    api.getDownloads().then((data) => setItems(data || [])).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => (tab === 'all' ? items : items.filter((i) => i.category === tab)), [items, tab]);

  const handleDownload = (item: DownloadRow) => {
    api.registerDownload(item._id).catch(() => {});
    window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="usm-premium-bg min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-usm-blue-primary border-usm-border rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="usm-premium-bg min-h-screen text-usm-blue-dark pb-20 pt-24 lg:pt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/40 bg-usm-blue-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-usm-blue-primary mb-5">
            <FileText size={14} /> Centre de téléchargement
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-black uppercase leading-[0.95] tracking-tight text-usm-blue-dark">
            Documents & <span className="text-usm-blue-primary">Ressources</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-sm text-slate-600 leading-relaxed">
            Règlements officiels, formulaires d’adhésion, kit presse et autres documents utiles du club.
          </p>
        </section>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-usm-border bg-usm-blue-soft p-2 w-fit mx-auto">
          {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`min-h-11 shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-usm-blue-primary ${
                tab === key ? 'bg-usm-blue-primary text-white shadow-md' : 'text-slate-600 hover:bg-usm-blue-soft'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-16">Aucun document disponible pour ce filtre.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {visible.map((item) => {
              const Icon = CATEGORY_ICON[item.category];
              return (
                <div key={item._id} className="usm-card rounded-2xl p-5 flex items-start gap-4">
                  <span className="h-11 w-11 rounded-xl bg-usm-blue-primary/10 text-usm-blue-primary flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-usm-blue-dark leading-snug">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleDownload(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-usm-blue-primary hover:underline cursor-pointer"
                      >
                        <Download size={13} /> Télécharger
                      </button>
                      {item.fileType && <span className="text-[10px] text-slate-400 uppercase font-bold">{item.fileType}{item.fileSizeKb ? ` · ${Math.round(item.fileSizeKb)} Ko` : ''}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
