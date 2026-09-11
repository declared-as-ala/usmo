'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { Search, AlertTriangle, CheckCircle2, FileText, Globe } from 'lucide-react';

type ContentType = 'page' | 'news' | 'product';

interface SeoRow {
  type: ContentType;
  id: string;
  title: string;
  path?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// All static pages on the site
const STATIC_PAGES: { id: string; title: string; path: string }[] = [
  { id: 'home', title: 'Accueil', path: '/' },
  { id: 'boutique', title: 'Boutique Officielle', path: '/boutique' },
  { id: 'contact', title: 'Contact', path: '/contact' },
  { id: 'fan-zone', title: 'Fan Zone', path: '/fan-zone' },
  { id: 'match-center', title: 'Match Center', path: '/match-center' },
  { id: 'sponsors', title: 'Partenaires', path: '/sponsors' },
  { id: 'newsroom', title: 'Actualités', path: '/newsroom' },
  { id: 'media', title: 'Portail Média', path: '/media' },
  { id: 'histoire', title: "L'histoire", path: '/histoire' },
  { id: 'palmares', title: 'Palmarès', path: '/palmares' },
  { id: 'legends', title: 'Légendes', path: '/legends' },
  { id: 'stadium', title: 'Guide du Stade', path: '/stadium' },
  { id: 'downloads', title: 'Centre de Téléchargement', path: '/downloads' },
  { id: 'abonnement', title: 'Abonnement', path: '/abonnement' },
  { id: 'legal', title: 'Pages Légales', path: '/legal' },
  { id: 'account', title: 'Mon Compte', path: '/compte' },
  { id: 'mentions-legales', title: 'Mentions Légales', path: '/mentions-legales' },
  { id: 'politique-confidentialite', title: 'Politique de Confidentialité', path: '/politique-confidentialite' },
  { id: 'conditions-utilisation', title: "Conditions d'Utilisation", path: '/conditions-utilisation' },
  { id: 'politique-cookies', title: 'Politique de Cookies', path: '/politique-cookies' },
];

const STORAGE_KEY = 'usm-seo-pages';

function loadPageSeo(): Record<string, { seoTitle?: string; seoDescription?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePageSeo(data: Record<string, { seoTitle?: string; seoDescription?: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function AdminSeo() {
  const { newsList, updateNewsArticle, products, updateProduct } = useApp();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [pageSeo, setPageSeo] = useState<Record<string, { seoTitle?: string; seoDescription?: string }>>({});
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');

  useEffect(() => {
    setPageSeo(loadPageSeo());
  }, []);

  const updatePageSeo = useCallback((id: string, data: { seoTitle?: string; seoDescription?: string }) => {
    setPageSeo((prev) => {
      const next = { ...prev, [id]: data };
      savePageSeo(next);
      return next;
    });
  }, []);

  const rows: SeoRow[] = [
    ...STATIC_PAGES.map((p) => {
      const seo = pageSeo[p.id] || {};
      return {
        type: 'page' as const,
        id: p.id,
        title: p.title,
        path: p.path,
        seoTitle: seo.seoTitle,
        seoDescription: seo.seoDescription,
      };
    }),
    ...newsList.map((n) => ({
      type: 'news' as const,
      id: n.id,
      title: n.title,
      seoTitle: n.seoTitle,
      seoDescription: n.seoDescription,
    })),
    ...products.map((p) => ({
      type: 'product' as const,
      id: p.id,
      title: p.name,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    })),
  ];

  const filteredRows = typeFilter === 'all' ? rows : rows.filter((r) => r.type === typeFilter);

  const missingCount = rows.filter((r) => !r.seoTitle || !r.seoDescription).length;
  const pageCount = rows.filter((r) => r.type === 'page').length;
  const newsCount = rows.filter((r) => r.type === 'news').length;
  const productCount = rows.filter((r) => r.type === 'product').length;

  const startEdit = (row: SeoRow) => {
    setEditingKey(`${row.type}-${row.id}`);
    setDraftTitle(row.seoTitle ?? row.title);
    setDraftDescription(row.seoDescription ?? '');
  };

  const saveEdit = (row: SeoRow) => {
    if (row.type === 'page') {
      updatePageSeo(row.id, { seoTitle: draftTitle, seoDescription: draftDescription });
    } else if (row.type === 'news') {
      updateNewsArticle(row.id, { seoTitle: draftTitle, seoDescription: draftDescription } as any);
    } else {
      updateProduct(row.id, { seoTitle: draftTitle, seoDescription: draftDescription } as any);
    }
    setEditingKey(null);
  };

  const typeColors: Record<ContentType, string> = {
    page: 'bg-blue-50 text-blue-700',
    news: 'bg-violet-50 text-violet-700',
    product: 'bg-amber-50 text-amber-700',
  };

  const typeLabels: Record<ContentType, string> = {
    page: 'Page',
    news: 'Article',
    product: 'Produit',
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO"
        description="Configure SEO title and meta description for every page, article, and product on the site."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Content" value={rows.length} icon={Search} accent="blue" />
        <StatCard label="Missing SEO" value={missingCount} icon={AlertTriangle} accent="amber" />
        <StatCard label="Complete" value={rows.length - missingCount} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Static Pages" value={pageCount} icon={Globe} accent="slate" />
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 w-fit">
        {([
          { key: 'all', label: `Tout (${rows.length})` },
          { key: 'page', label: `Pages (${pageCount})` },
          { key: 'news', label: `Articles (${newsCount})` },
          { key: 'product', label: `Produits (${productCount})` },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              typeFilter === tab.key ? 'bg-white shadow-sm text-usm-blue-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Content</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Path</th>
                <th className="py-3 px-4">SEO Title</th>
                <th className="py-3 px-4">Meta Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => {
                const key = `${row.type}-${row.id}`;
                const isEditing = editingKey === key;
                const complete = row.seoTitle && row.seoDescription;
                return (
                  <tr key={key} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="py-2.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">{row.title}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[row.type]}`}>
                        {typeLabels[row.type]}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[10px]">{row.path || '—'}</td>
                    <td className="py-2.5 px-4 max-w-[220px]">
                      {isEditing ? (
                        <input type="text" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 outline-none focus:border-usm-blue-primary" />
                      ) : (
                        <span className="text-slate-600 truncate block">{row.seoTitle || <em className="text-slate-300">Not set</em>}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 max-w-[260px]">
                      {isEditing ? (
                        <textarea rows={2} value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 outline-none focus:border-usm-blue-primary resize-none" />
                      ) : (
                        <span className="text-slate-600 line-clamp-2 block">{row.seoDescription || <em className="text-slate-300">Not set</em>}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${complete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {complete ? 'Complete' : 'Missing'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => saveEdit(row)} className="px-2.5 py-1 bg-usm-blue-primary text-white rounded font-bold cursor-pointer text-[10px]">Save</button>
                          <button onClick={() => setEditingKey(null)} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded font-bold cursor-pointer text-[10px]">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(row)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold cursor-pointer text-[10px]">Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
