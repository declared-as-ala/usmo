'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import {
  Plus, X, Trash2, Pencil, Newspaper, FileEdit, Star,
  RefreshCw, AlertCircle, Loader2, CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

const CATEGORIES = ['Football', 'Basketball', 'Club', 'Academy', 'Announcements', 'Sponsors'] as const;
type Category = typeof CATEGORIES[number];

interface NewsArticle {
  _id: string;
  title: string;
  titleFr: string;
  titleAr: string;
  summary: string;
  summaryFr: string;
  summaryAr: string;
  content: string;
  contentFr: string;
  contentAr: string;
  image: string;
  category: Category;
  categoryAr: string;
  date: string;
  readTime: string;
  official: boolean;
  author: string;
  published: boolean;
  featured: boolean;
}

const emptyForm = {
  title: '',
  titleFr: '',
  titleAr: '',
  summary: '',
  summaryFr: '',
  summaryAr: '',
  content: '',
  contentFr: '',
  contentAr: '',
  image: '',
  category: 'Club' as Category,
  categoryAr: 'النادي',
  readTime: '3 min',
  author: 'Club Media Relations Office',
  official: false,
  published: true,
  featured: false,
};

const CATEGORY_AR_MAP: Record<Category, string> = {
  Football: 'كرة القدم',
  Basketball: 'كرة السلة',
  Club: 'النادي',
  Academy: 'الأكاديمية',
  Announcements: 'بلاغات رسمية',
  Sponsors: 'الرعاة',
};

export default function AdminNews() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Data state ──
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Filter state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'' | 'true' | 'false'>('');

  // ── Form state ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(() => searchParams.get('new') === '1');
  const [form, setForm] = useState(emptyForm);

  // ── Load articles from backend ──
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      if (publishedFilter !== '') params.published = publishedFilter;
      params.limit = 100;

      const data = await api.getAdminNews(params);
      setArticles(data.news || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les articles');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, publishedFilter]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/admin/news');
      openAddForm();
    }
  }, [searchParams, router]);

  // ── Form helpers ──
  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError(null);
    setSaveSuccess(false);
    setShowForm(true);
  };

  const openEditForm = (article: NewsArticle) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      titleFr: article.titleFr,
      titleAr: article.titleAr,
      summary: article.summary,
      summaryFr: article.summaryFr || article.summary,
      summaryAr: article.summaryAr || article.summary,
      content: article.content,
      contentFr: article.contentFr || article.content,
      contentAr: article.contentAr || article.content,
      image: article.image,
      category: article.category,
      categoryAr: article.categoryAr || CATEGORY_AR_MAP[article.category],
      readTime: article.readTime,
      author: article.author,
      official: article.official,
      published: article.published,
      featured: article.featured,
    });
    setSaveError(null);
    setSaveSuccess(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image || !form.summary) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {
      ...form,
      categoryAr: form.categoryAr || CATEGORY_AR_MAP[form.category],
      date: editingId
        ? articles.find(a => a._id === editingId)?.date || new Date().toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    };

    try {
      if (editingId) {
        const updated = await api.updateNews(editingId, payload);
        setArticles(prev => prev.map(a => a._id === editingId ? updated : a));
      } else {
        const created = await api.createNews(payload);
        setArticles(prev => [created, ...prev]);
        setTotal(t => t + 1);
      }
      setSaveSuccess(true);
      setTimeout(() => closeForm(), 800);
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (article: NewsArticle) => {
    try {
      const updated = await api.updateNews(article._id, { published: !article.published });
      setArticles(prev => prev.map(a => a._id === article._id ? updated : a));
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (article: NewsArticle) => {
    try {
      const updated = await api.updateNews(article._id, { featured: !article.featured });
      setArticles(prev => prev.map(a => a._id === article._id ? updated : a));
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleDelete = async (article: NewsArticle) => {
    requestConfirmation({ title: 'Supprimer cet article ?', message: `L’article « ${article.title} » sera supprimé définitivement.`, confirmLabel: 'Supprimer', onConfirm: async () => {
    try {
      await api.deleteNews(article._id);
      setArticles(prev => prev.filter(a => a._id !== article._id));
      setTotal(t => t - 1);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }}});
  };

  const publishedCount = articles.filter(a => a.published).length;
  const draftCount = articles.filter(a => !a.published).length;
  const featuredCount = articles.filter(a => a.featured).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsroom"
        description="Gérez les articles, annonces et rapports de match du club."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadArticles}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
              title="Rafraîchir"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Plus size={14} /> Créer un article
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total articles" value={total} icon={Newspaper} accent="blue" />
        <StatCard label="Publiés" value={publishedCount} icon={Newspaper} accent="emerald" />
        <StatCard label="Brouillons" value={draftCount} icon={FileEdit} accent="amber" />
        <StatCard label="À la une" value={featuredCount} icon={Star} accent="slate" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher un article…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/30"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/30"
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={publishedFilter}
          onChange={e => setPublishedFilter(e.target.value as '' | 'true' | 'false')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/30"
        >
          <option value="">Tous statuts</option>
          <option value="true">Publiés</option>
          <option value="false">Brouillons</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Officiel</th>
                  <th className="py-3 px-4">À la une</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map(article => (
                  <tr key={article._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.image}
                          alt=""
                          className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900 max-w-[240px] truncate">
                          {article.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{article.category}</td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-[140px] truncate">{article.author}</td>
                    <td className="py-2.5 px-4 text-slate-500">{article.date}</td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => handleTogglePublished(article)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                          article.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {article.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="py-2.5 px-4">
                      {article.official && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-usm-blue-primary/10 text-usm-blue-primary">
                          Officiel
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(article)}
                        className={`cursor-pointer transition-colors ${
                          article.featured ? 'text-usm-blue-primary' : 'text-slate-300 hover:text-slate-400'
                        }`}
                      >
                        <Star size={16} fill={article.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(article)}
                          className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(article)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Aucun article trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeForm}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Modifier l\'article' : 'Créer un article'}
              </h3>
              <button onClick={closeForm} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">

              {/* Title EN */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre (EN) *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                />
              </div>

              {/* Title FR + AR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre (FR)</label>
                  <input
                    type="text"
                    value={form.titleFr}
                    onChange={e => setForm(f => ({ ...f, titleFr: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.titleAr}
                    onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>

              {/* Category + Author + ReadTime */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={e => {
                      const cat = e.target.value as Category;
                      setForm(f => ({ ...f, category: cat, categoryAr: CATEGORY_AR_MAP[cat] }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Auteur</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Temps de lecture</label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image à la une (URL) *</label>
                <input
                  required
                  type="text"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                />
                {form.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.image}
                    alt="preview"
                    className="mt-2 h-24 w-full object-cover rounded-lg border border-slate-200"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              {/* Summary EN */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Résumé (EN) *</label>
                <textarea
                  required
                  rows={2}
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                />
              </div>

              {/* Summary FR + AR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Résumé (FR)</label>
                  <textarea
                    rows={2}
                    value={form.summaryFr}
                    onChange={e => setForm(f => ({ ...f, summaryFr: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Résumé (AR)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={form.summaryAr}
                    onChange={e => setForm(f => ({ ...f, summaryAr: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                  />
                </div>
              </div>

              {/* Content EN */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contenu complet (EN)</label>
                <textarea
                  rows={4}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                />
              </div>

              {/* Content FR + AR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contenu (FR)</label>
                  <textarea
                    rows={3}
                    value={form.contentFr}
                    onChange={e => setForm(f => ({ ...f, contentFr: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contenu (AR)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={form.contentAr}
                    onChange={e => setForm(f => ({ ...f, contentAr: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.official}
                    onChange={e => setForm(f => ({ ...f, official: e.target.checked }))}
                    className="accent-usm-blue-primary"
                  />
                  Annonce officielle du club
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                    className="accent-emerald-500"
                  />
                  Publier immédiatement
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="accent-usm-blue-primary"
                  />
                  À la une (homepage)
                </label>
              </div>

              {/* Save error */}
              {saveError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle size={13} /> {saveError}
                </div>
              )}

              {/* Save success */}
              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                  <CheckCircle2 size={13} /> Article sauvegardé avec succès !
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde…</>
                  : editingId ? 'Enregistrer les modifications' : 'Publier l\'article'
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
