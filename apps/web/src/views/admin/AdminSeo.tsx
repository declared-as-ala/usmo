'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

type ContentType = 'news' | 'product';

interface SeoRow {
  type: ContentType;
  id: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default function AdminSeo() {
  const { newsList, updateNewsArticle, products, updateProduct } = useApp();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  const rows: SeoRow[] = [
    ...newsList.map((n) => ({ type: 'news' as const, id: n.id, title: n.title, seoTitle: n.seoTitle, seoDescription: n.seoDescription })),
    ...products.map((p) => ({ type: 'product' as const, id: p.id, title: p.name, seoTitle: p.seoTitle, seoDescription: p.seoDescription })),
  ];

  const missingCount = rows.filter((r) => !r.seoTitle || !r.seoDescription).length;

  const startEdit = (row: SeoRow) => {
    setEditingKey(`${row.type}-${row.id}`);
    setDraftTitle(row.seoTitle ?? row.title);
    setDraftDescription(row.seoDescription ?? '');
  };

  const saveEdit = (row: SeoRow) => {
    if (row.type === 'news') updateNewsArticle(row.id, { seoTitle: draftTitle, seoDescription: draftDescription });
    else updateProduct(row.id, { seoTitle: draftTitle, seoDescription: draftDescription });
    setEditingKey(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="SEO" description="Search title and meta description for every article and product." />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Content" value={rows.length} icon={Search} accent="blue" />
        <StatCard label="Missing SEO Fields" value={missingCount} icon={AlertTriangle} accent="amber" />
        <StatCard label="Complete" value={rows.length - missingCount} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Content</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">SEO Title</th>
                <th className="py-3 px-4">Meta Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const key = `${row.type}-${row.id}`;
                const isEditing = editingKey === key;
                const complete = row.seoTitle && row.seoDescription;
                return (
                  <tr key={key} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="py-2.5 px-4 font-bold text-slate-900 max-w-[200px] truncate">{row.title}</td>
                    <td className="py-2.5 px-4 text-slate-600 capitalize">{row.type}</td>
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
                        <button onClick={() => saveEdit(row)} className="px-2.5 py-1 bg-usm-blue-primary text-white rounded font-bold cursor-pointer">Save</button>
                      ) : (
                        <button onClick={() => startEdit(row)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold cursor-pointer">Edit</button>
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
