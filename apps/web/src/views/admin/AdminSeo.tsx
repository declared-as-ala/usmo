'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Share2,
  Sparkles,
  Download,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Layers,
  FileText,
  Sliders,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { SeoScoreBadge } from './seo/SeoScoreBadge';
import { SeoEditDrawer } from './seo/SeoEditDrawer';
import { ISharedSeoMetadata, ISharedSeoOverview, ISharedSeoRedirect, ISharedSeoNotFoundLog, ISharedSeoSettings } from 'shared';

export default function AdminSeo() {
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'health' | 'redirects' | '404' | 'settings'>('content');

  // Overview KPIs
  const [overview, setOverview] = useState<ISharedSeoOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Content List
  const [contentItems, setContentItems] = useState<ISharedSeoMetadata[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [duplicates, setDuplicates] = useState<Record<string, number>>({});
  const [loadingContent, setLoadingContent] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [missingFilter, setMissingFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer
  const [editingItem, setEditingItem] = useState<ISharedSeoMetadata | null>(null);

  // Redirects
  const [redirects, setRedirects] = useState<ISharedSeoRedirect[]>([]);
  const [loadingRedirects, setLoadingRedirects] = useState(false);
  const [newRedirectSource, setNewRedirectSource] = useState('');
  const [newRedirectDest, setNewRedirectDest] = useState('');
  const [newRedirectCode, setNewRedirectCode] = useState<301 | 302>(301);

  // 404s
  const [notFoundLogs, setNotFoundLogs] = useState<ISharedSeoNotFoundLog[]>([]);
  const [loading404, setLoading404] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ISharedSeoSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load Overview
  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const data = await api.getSeoOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load SEO overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Load Content
  const fetchContent = useCallback(async () => {
    try {
      setLoadingContent(true);
      const res = await api.getSeoContentList({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        missing: missingFilter || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      setContentItems(res.items || []);
      setTotalItems(res.total || 0);
      setDuplicates(res.duplicates || {});
    } catch (err) {
      console.error('Failed to load SEO content:', err);
    } finally {
      setLoadingContent(false);
    }
  }, [typeFilter, statusFilter, missingFilter, searchQuery]);

  // Load Redirects
  const fetchRedirects = useCallback(async () => {
    try {
      setLoadingRedirects(true);
      const data = await api.getSeoRedirects();
      setRedirects(data || []);
    } catch (err) {
      console.error('Failed to load redirects:', err);
    } finally {
      setLoadingRedirects(false);
    }
  }, []);

  // Load 404s
  const fetch404s = useCallback(async () => {
    try {
      setLoading404(true);
      const data = await api.getSeo404Logs();
      setNotFoundLogs(data || []);
    } catch (err) {
      console.error('Failed to load 404 logs:', err);
    } finally {
      setLoading404(false);
    }
  }, []);

  // Load Settings
  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.getSeoSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchContent();
  }, [fetchOverview, fetchContent]);

  useEffect(() => {
    if (activeMainTab === 'redirects') fetchRedirects();
    if (activeMainTab === '404') fetch404s();
    if (activeMainTab === 'settings') fetchSettings();
  }, [activeMainTab, fetchRedirects, fetch404s, fetchSettings]);

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (!confirm(`Confirmer l’action groupée : ${action} ?`)) return;
    try {
      await api.bulkSeoAction(action, selectedIds);
      setSelectedIds([]);
      await fetchContent();
      await fetchOverview();
    } catch (err: any) {
      alert(`Erreur : ${err?.message || 'Erreur'}`);
    }
  };

  // Re-analyze all
  const handleAnalyzeAll = async () => {
    try {
      await api.analyzeAllSeo();
      await fetchContent();
      await fetchOverview();
      alert('Analyse globale terminée avec succès !');
    } catch (err: any) {
      alert(`Erreur : ${err?.message || 'Erreur'}`);
    }
  };

  // Save drawer item
  const handleSaveDrawerItem = async (updated: Partial<ISharedSeoMetadata>) => {
    if (!editingItem) return;
    await api.updateSeoContentItem(editingItem.entityType, editingItem.entityId, updated);
    await api.revalidateSeoPath(editingItem.path);
    await fetchContent();
    await fetchOverview();
  };

  // Create redirect
  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRedirectSource || !newRedirectDest) return;
    try {
      await api.createSeoRedirect({
        sourcePath: newRedirectSource,
        destinationPath: newRedirectDest,
        statusCode: newRedirectCode,
        active: true,
      });
      setNewRedirectSource('');
      setNewRedirectDest('');
      await fetchRedirects();
      await fetchOverview();
    } catch (err: any) {
      alert(`Erreur : ${err?.message || 'Erreur'}`);
    }
  };

  // Delete redirect
  const handleDeleteRedirect = async (id: string) => {
    if (!confirm('Supprimer cette redirection ?')) return;
    try {
      await api.deleteSeoRedirect(id);
      await fetchRedirects();
    } catch (err: any) {
      alert(`Erreur : ${err?.message || 'Erreur'}`);
    }
  };

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      await api.updateSeoSettings(settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      await fetchOverview();
    } catch (err: any) {
      alert(`Erreur : ${err?.message || 'Erreur'}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const entityTypeCounts = {
    all: overview?.totalContent || 0,
    page: contentItems.filter((i) => i.entityType === 'page').length,
    news: contentItems.filter((i) => i.entityType === 'news').length,
    product: contentItems.filter((i) => i.entityType === 'product').length,
    player: contentItems.filter((i) => i.entityType === 'player').length,
    sponsor: contentItems.filter((i) => i.entityType === 'sponsor').length,
    media: contentItems.filter((i) => i.entityType === 'media').length,
    category: contentItems.filter((i) => i.entityType === 'category').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <AdminPageHeader
        title="SEO Management System"
        description="Centre de contrôle SEO professionnel inspiré de Yoast. Gérez les métadonnées, images de partage social (1200×630), scores de qualité, redirections et sitemap pour l'ensemble du site."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyzeAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Ré-analyser tout
            </button>
            <a
              href="/api/admin/seo/export"
              download="usm-seo-report.csv"
              className="flex items-center gap-1.5 px-3 py-2 bg-usm-blue-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter Rapport CSV
            </a>
          </div>
        }
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contenus SEO"
          value={overview?.totalContent ?? '...'}
          icon={Globe}
          accent="blue"
        />
        <StatCard
          label="Complétude Globale"
          value={`${overview?.completionRate ?? 0}%`}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Score Moyen Yoast"
          value={`${overview?.averageScore ?? 0}/100`}
          icon={Sparkles}
          accent={
            (overview?.averageScore || 0) >= 70
              ? 'emerald'
              : (overview?.averageScore || 0) >= 50
              ? 'amber'
              : 'red'
          }
        />
        <StatCard
          label="Images Sociales Manquantes"
          value={overview?.missingSocialImageCount ?? 0}
          icon={Share2}
          accent="amber"
        />
      </div>

      {/* Main Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-2 rounded-xl shadow-2xs">
        {[
          { id: 'content', label: `Contenus & Métadonnées (${totalItems})`, icon: FileText },
          { id: 'health', label: 'Santé Globale & Audit', icon: CheckCircle2 },
          { id: 'redirects', label: `Redirections 301/302 (${overview?.health.redirectsCount ?? 0})`, icon: Sliders },
          { id: '404', label: `Suivi Erreurs 404 (${overview?.health.unresolved404Count ?? 0})`, icon: AlertTriangle },
          { id: 'settings', label: 'Paramètres Globaux & Templates', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                active
                  ? 'border-usm-blue-primary text-usm-blue-primary bg-blue-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 1: CONTENT & METADATA
         ───────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === 'content' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Type tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { key: 'all', label: 'Tout' },
                  { key: 'page', label: 'Pages' },
                  { key: 'news', label: 'Articles' },
                  { key: 'product', label: 'Produits' },
                  { key: 'player', label: 'Joueurs' },
                  { key: 'sponsor', label: 'Sponsors' },
                  { key: 'media', label: 'Médias' },
                  { key: 'category', label: 'Catégories' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTypeFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      typeFilter === t.key
                        ? 'bg-white text-usm-blue-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre, slug, path..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-usm-blue-primary"
                />
              </div>
            </div>

            {/* Quick Diagnostic Filters */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtres rapides :
              </span>
              {[
                { key: '', label: 'Tous' },
                { key: 'title', label: '❌ Titre manquant' },
                { key: 'description', label: '❌ Description manquante' },
                { key: 'social_image', label: '⚠️ Image sociale manquante' },
                { key: 'focus_keyword', label: '⚠️ Mot-clé manquant' },
                { key: 'low_score', label: '🔴 Score faible (<50)' },
                { key: 'noindex', label: '🚫 Noindex' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setMissingFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                    missingFilter === f.key
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bulk actions bar if items are selected */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <span className="font-bold text-blue-900">
                  {selectedIds.length} élément(s) sélectionné(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkAction('generate_missing_titles')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Générer titres manquants
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAction('generate_missing_descriptions')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Générer descriptions manquantes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAction('apply_default_social_image')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Appliquer image sociale par défaut
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-slate-500 hover:text-slate-800 text-xs underline cursor-pointer"
                  >
                    Désélectionner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/50">
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === contentItems.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(contentItems.map((i) => i.id || (i as any)._id));
                          else setSelectedIds([]);
                        }}
                        className="rounded accent-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Contenu & Type</th>
                    <th className="py-3 px-4">Score Yoast</th>
                    <th className="py-3 px-4">Titre SEO (&lt;title&gt;)</th>
                    <th className="py-3 px-4">Méta Description</th>
                    <th className="py-3 px-4">Image Sociale (OG)</th>
                    <th className="py-3 px-4">Mot-Clé</th>
                    <th className="py-3 px-4">Indexation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingContent ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Chargement des métadonnées SEO...
                      </td>
                    </tr>
                  ) : contentItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Aucun contenu correspondant aux filtres sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    contentItems.map((item) => {
                      const id = item.id || (item as any)._id;
                      const isSelected = selectedIds.includes(id);
                      const titleDupCount = item.metaTitle ? duplicates[item.metaTitle.trim()] || 0 : 0;
                      const hasDuplicate = titleDupCount > 1;

                      return (
                        <tr key={id} className="hover:bg-slate-50/80 transition-colors align-top">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds([...selectedIds, id]);
                                else setSelectedIds(selectedIds.filter((x) => x !== id));
                              }}
                              className="rounded accent-blue-600 cursor-pointer mt-1"
                            />
                          </td>

                          {/* Content & Type */}
                          <td className="py-3 px-4 max-w-[220px]">
                            <div className="font-bold text-slate-900 truncate leading-snug">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">
                                {item.entityType}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono truncate">
                                {item.path}
                              </span>
                            </div>
                          </td>

                          {/* Score Yoast */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <SeoScoreBadge score={item.seoScore} status={item.scoreStatus} size="sm" />
                          </td>

                          {/* SEO Title */}
                          <td className="py-3 px-4 max-w-[200px]">
                            {item.metaTitle ? (
                              <div>
                                <div className="text-slate-800 font-medium truncate" title={item.metaTitle}>
                                  {item.metaTitle}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {item.metaTitle.length} car.
                                  </span>
                                  {hasDuplicate && (
                                    <span
                                      className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1 rounded font-semibold"
                                      title="Titre dupliqué sur plusieurs pages"
                                    >
                                      Duplication ({titleDupCount})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-rose-500 font-medium text-[11px]">Non défini</span>
                            )}
                          </td>

                          {/* Meta Description */}
                          <td className="py-3 px-4 max-w-[240px]">
                            {item.metaDescription ? (
                              <div>
                                <div className="text-slate-600 line-clamp-2 leading-relaxed" title={item.metaDescription}>
                                  {item.metaDescription}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                                  {item.metaDescription.length} car.
                                </span>
                              </div>
                            ) : (
                              <span className="text-rose-500 font-medium text-[11px]">Non définie</span>
                            )}
                          </td>

                          {/* Social Image */}
                          <td className="py-3 px-4">
                            {item.ogImage ? (
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-7 bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.ogImage}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">1200×630</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <Share2 className="w-3 h-3" /> Image globale
                              </span>
                            )}
                          </td>

                          {/* Focus Keyword */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {item.focusKeyword ? (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                                {item.focusKeyword}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">—</span>
                            )}
                          </td>

                          {/* Indexation & Schema */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span
                                className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  item.robotsIndex !== false
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {item.robotsIndex !== false ? 'Index' : 'Noindex'}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {item.schemaType || 'WebPage'}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setEditingItem(item)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-usm-blue-primary rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Éditer SEO
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 2: GLOBAL SEO HEALTH & AUDIT
         ───────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Checklist de Santé Technique SEO</h3>
            <p className="text-xs text-slate-500">
              Audit automatisé de l&apos;infrastructure SEO du site officiel Union Sportive Monastirienne.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Sitemap XML Dynamique Actif</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Disponible publiquement à l’adresse <code className="font-mono font-bold">/sitemap.xml</code>. Indexe uniquement les contenus publiés et valides.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Robots.txt Opérationnel</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Protège les sections sensibles (<code className="font-mono">/admin</code>, <code className="font-mono">/compte</code>, <code className="font-mono">/checkout</code>) et référence le sitemap.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Domaine Canonique Défini</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Les balises <code className="font-mono">&lt;link rel=&quot;canonical&quot;&gt;</code> sont générées en URLs absolues HTTPS pour éviter les doublons d’indexation.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Image Sociale Globale (Fallback 1200×630)</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Garantit qu’aucun lien partagé sur WhatsApp ou Facebook n’est privé de vignette.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Données Structurées Schema.org</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Schémas SportsOrganization, SportsTeam, Product, NewsArticle et Person injectés en JSON-LD côté serveur.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Titres Dupliqués Détectés : {overview?.duplicateTitlesCount ?? 0}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {overview?.duplicateTitlesCount
                      ? 'Certaines pages partagent le même titre SEO exact. Utilisez le filtre "Titre dupliqué" pour les personnaliser.'
                      : 'Aucun titre dupliqué détecté.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 3: REDIRECTS MANAGER (301 / 302)
         ───────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === 'redirects' && (
        <div className="space-y-6">
          {/* Add Redirect Card */}
          <form onSubmit={handleCreateRedirect} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Créer une nouvelle redirection URL
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-700">Ancien Chemin (Source)</label>
                <input
                  type="text"
                  value={newRedirectSource}
                  onChange={(e) => setNewRedirectSource(e.target.value)}
                  placeholder="/produit/ancien-maillot"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
              </div>

              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-700">Destination</label>
                <input
                  type="text"
                  value={newRedirectDest}
                  onChange={(e) => setNewRedirectDest(e.target.value)}
                  placeholder="/boutique/maillot-domicile"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-usm-blue-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Ajouter 301
                </button>
              </div>
            </div>
          </form>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/50">
                  <th className="py-3 px-4">Chemin Source</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Clics / Hits</th>
                  <th className="py-3 px-4">Dernier passage</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingRedirects ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Chargement des redirections...
                    </td>
                  </tr>
                ) : redirects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Aucune redirection active configurée.
                    </td>
                  </tr>
                ) : (
                  redirects.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.sourcePath}</td>
                      <td className="py-3 px-4 font-mono text-blue-600">{r.destinationPath}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {r.statusCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{r.hits || 0}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {r.lastHitAt ? new Date(r.lastHitAt).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRedirect(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 4: 404 LOGS & RESOLUTION
         ───────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === '404' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900">URLs 404 Fréquemment Demandées</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ces chemins ont été demandés par des utilisateurs ou des robots de recherche mais n’existent pas. Créez des redirections pour préserver le trafic.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/50">
                  <th className="py-3 px-4">URL 404 Demandée</th>
                  <th className="py-3 px-4">Occurrences (Hits)</th>
                  <th className="py-3 px-4">Dernière visite</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading404 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chargement des erreurs 404...
                    </td>
                  </tr>
                ) : notFoundLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune erreur 404 récente enregistrée.
                    </td>
                  </tr>
                ) : (
                  notFoundLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{log.path}</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">{log.hits}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.lastSeenAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        {log.resolved ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                            Redirigée ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold">
                            Non résolue
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!log.resolved && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewRedirectSource(log.path);
                              setActiveMainTab('redirects');
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Créer redirection
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 5: GLOBAL SETTINGS & TITLE TEMPLATES
         ───────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Paramètres SEO Globaux & Réseaux Sociaux</h3>
              <p className="text-xs text-slate-500">
                Templates de titres automatiques, domaine canonique et image de partage par défaut du club.
              </p>
            </div>
            {settingsSuccess && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                <Check className="w-3.5 h-3.5" /> Enregistré
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nom du Site (og:site_name)</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nom de l’Organisation (Schema.org)</label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Title Templates */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Templates de Titres SEO (Format Yoast)</h4>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Template par défaut</label>
                <input
                  type="text"
                  value={settings.titleTemplateDefault}
                  onChange={(e) => setSettings({ ...settings, titleTemplateDefault: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Template Produits (Boutique)</label>
                <input
                  type="text"
                  value={settings.titleTemplateProducts}
                  onChange={(e) => setSettings({ ...settings, titleTemplateProducts: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Template Actualités</label>
                <input
                  type="text"
                  value={settings.titleTemplateNews}
                  onChange={(e) => setSettings({ ...settings, titleTemplateNews: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Template Joueurs & Staff</label>
                <input
                  type="text"
                  value={settings.titleTemplatePlayers}
                  onChange={(e) => setSettings({ ...settings, titleTemplatePlayers: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Fallback Image */}
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Image Sociale Globale (1200×630)</label>
            <input
              type="text"
              value={settings.defaultSocialImage}
              onChange={(e) => setSettings({ ...settings, defaultSocialImage: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Utilisée pour toutes les pages sans visuel dédié lorsque l’URL est partagée sur WhatsApp ou Facebook.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-usm-blue-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </form>
      )}

      {/* SEO Edit Drawer */}
      <SeoEditDrawer
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSave={handleSaveDrawerItem}
        defaultSocialImage={overview?.health.defaultSocialImageConfigured ? '/images/seo/usm-social-share-default.webp' : undefined}
      />
    </div>
  );
}
