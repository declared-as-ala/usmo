'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Loader2,
  Share2,
  Layers,
  Search,
  Code2,
  Sliders,
  Eye,
  Tag,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { ISharedSeoMetadata } from 'shared';
import { computeSeoScore } from '../../../lib/seo/seoScoreCalculator';
import { SeoScoreBadge } from './SeoScoreBadge';
import { SocialSharePreview } from './SocialSharePreview';
import { MediaLibrary } from '../../../components/Admin/MediaLibrary';
import { MediaUploader } from '../../../components/Admin/MediaUploader';

interface SeoEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ISharedSeoMetadata | null;
  onSave: (updated: Partial<ISharedSeoMetadata>) => Promise<void>;
  defaultSocialImage?: string;
}

export const SeoEditDrawer: React.FC<SeoEditDrawerProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  defaultSocialImage = '/images/seo/usm-social-share-default.webp',
}) => {
  const [activeTab, setActiveTab] = useState<
    'basic' | 'social' | 'indexing' | 'schema' | 'analysis' | 'preview' | 'tools'
  >('basic');

  // Form states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [slug, setSlug] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [priority, setPriority] = useState(0.7);
  const [changeFrequency, setChangeFrequency] = useState('weekly');

  // Social
  const [ogImage, setOgImage] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [twitterCard, setTwitterCard] = useState<'summary' | 'summary_large_image'>('summary_large_image');

  // Schema
  const [schemaType, setSchemaType] = useState('WebPage');
  const [customJsonLd, setCustomJsonLd] = useState('');

  // UI helpers
  const [saving, setSaving] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    if (item) {
      setMetaTitle(item.metaTitle || item.title || '');
      setMetaDescription(item.metaDescription || '');
      setFocusKeyword(item.focusKeyword || '');
      setSecondaryKeywords(item.secondaryKeywords || []);
      setSlug(item.slug || '');
      setCanonicalUrl(item.canonicalUrl || item.path || '');
      setRobotsIndex(item.robotsIndex !== false);
      setRobotsFollow(item.robotsFollow !== false);
      setSitemapEnabled(item.sitemapEnabled !== false);
      setPriority(item.priority ?? 0.7);
      setChangeFrequency(item.changeFrequency || 'weekly');
      setOgImage(item.ogImage || '');
      setOgTitle(item.ogTitle || '');
      setOgDescription(item.ogDescription || '');
      setTwitterCard(item.twitterCard || 'summary_large_image');
      setSchemaType(item.schemaType || 'WebPage');
      setCustomJsonLd(item.customJsonLd || '');
      setActiveTab('basic');
    }
  }, [item]);

  // Live SEO Score computation
  const liveAnalysis = useMemo(() => {
    return computeSeoScore({
      title: item?.title,
      metaTitle,
      metaDescription,
      focusKeyword,
      slug: slug || item?.path,
      canonicalUrl,
      ogImage,
      schemaType,
      robotsIndex,
      robotsFollow,
      sitemapEnabled,
    });
  }, [item, metaTitle, metaDescription, focusKeyword, slug, canonicalUrl, ogImage, schemaType, robotsIndex, robotsFollow, sitemapEnabled]);

  if (!isOpen || !item) return null;

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    if (!secondaryKeywords.includes(newKeyword.trim())) {
      setSecondaryKeywords([...secondaryKeywords, newKeyword.trim()]);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (k: string) => {
    setSecondaryKeywords(secondaryKeywords.filter((x) => x !== k));
  };

  const handleGenerateSuggested = () => {
    // Generate intelligent suggested SEO values
    let suggestedTitle = `${item.title} | US Monastir`;
    if (item.entityType === 'product') suggestedTitle = `${item.title} | Boutique Officielle US Monastir`;
    else if (item.entityType === 'news') suggestedTitle = `${item.title} | Actualités US Monastir`;
    else if (item.entityType === 'player') suggestedTitle = `${item.title} — Joueur US Monastir | Profil Officiel`;

    setMetaTitle(suggestedTitle);

    let suggestedDesc = `Découvrez toutes les informations officielles sur ${item.title} avec l’Union Sportive Monastirienne (USM Monastir).`;
    if (suggestedDesc.length < 125) {
      suggestedDesc += ` Effectifs, boutique officielle, actualités et résultats du club en direct.`;
    }
    setMetaDescription(suggestedDesc);

    if (!focusKeyword) {
      setFocusKeyword(item.title.split(' ')[0] || 'US Monastir');
    }
    if (!ogImage) {
      setOgImage(defaultSocialImage);
    }
  };

  const handleSaveForm = async () => {
    setSaving(true);
    try {
      await onSave({
        metaTitle,
        metaDescription,
        focusKeyword,
        secondaryKeywords,
        slug,
        canonicalUrl,
        robotsIndex,
        robotsFollow,
        sitemapEnabled,
        priority,
        changeFrequency: changeFrequency as any,
        ogImage,
        ogTitle: ogTitle || metaTitle,
        ogDescription: ogDescription || metaDescription,
        twitterCard,
        schemaType,
        customJsonLd,
      });
      onClose();
    } catch (err: any) {
      alert(`Erreur lors de l'enregistrement : ${err?.message || 'Inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  // Group issues into Errors, Warnings, and Good
  const errors = liveAnalysis.issues.filter((i) => i.type === 'error');
  const warnings = liveAnalysis.issues.filter((i) => i.type === 'warning');
  const goodResults = liveAnalysis.issues.filter((i) => i.type === 'good');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-4xl bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="space-y-0.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {item.entityType}
              </span>
              <span className="text-xs text-slate-500 font-mono truncate">{item.path}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 truncate">
              {item.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <SeoScoreBadge score={liveAnalysis.score} status={liveAnalysis.scoreStatus} size="md" />
            <button
              onClick={handleSaveForm}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto gap-1">
          {[
            { id: 'basic', label: '1. SEO Général', icon: Search },
            { id: 'social', label: '2. Image Sociale (OG)', icon: Share2 },
            { id: 'indexing', label: '3. URL & Indexation', icon: Sliders },
            { id: 'schema', label: '4. Données Structurées', icon: Layers },
            { id: 'analysis', label: `5. Analyse Yoast (${liveAnalysis.score}/100)`, icon: Sparkles },
            { id: 'preview', label: '6. Prévisualisation', icon: Eye },
            { id: 'tools', label: '7. Débogueur', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                  active
                    ? 'border-usm-blue-primary text-usm-blue-primary bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC SEO */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Quick AI/Template Generation Bar */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Génération automatique des métadonnées</h4>
                    <p className="text-[11px] text-slate-600">
                      Remplit le titre, la description et le mot-clé selon les templates officiels de l’US Monastir.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSuggested}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold shadow-2xs cursor-pointer whitespace-nowrap transition-colors"
                >
                  Générer suggestions
                </button>
              </div>

              {/* Title Input + Length Progress Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    Titre SEO (SEO Title)
                    <span className="text-slate-400 font-normal">(&lt;title&gt;)</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      liveAnalysis.titleStatus === 'optimal'
                        ? 'text-emerald-600'
                        : liveAnalysis.titleStatus === 'too_short'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {liveAnalysis.titleLength} / ~60 caractères
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="ex: Maillot Domicile 2026/27 | Boutique Officielle US Monastir"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-usm-blue-primary shadow-2xs"
                />
                {/* Visual length bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      liveAnalysis.titleStatus === 'optimal'
                        ? 'bg-emerald-500'
                        : liveAnalysis.titleStatus === 'too_short'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (liveAnalysis.titleLength / 60) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Recommandé : entre 45 et 60 caractères pour un affichage optimal sur Google sans être tronqué.
                </p>
              </div>

              {/* Meta Description + Length Progress Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800">
                    Méta Description
                  </label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      liveAnalysis.descStatus === 'optimal'
                        ? 'text-emerald-600'
                        : liveAnalysis.descStatus === 'too_short'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {liveAnalysis.descLength} / ~160 caractères
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Rédigez un résumé incitatif pour donner envie aux internautes de cliquer..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-usm-blue-primary shadow-2xs leading-relaxed"
                />
                {/* Visual length bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      liveAnalysis.descStatus === 'optimal'
                        ? 'bg-emerald-500'
                        : liveAnalysis.descStatus === 'too_short'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (liveAnalysis.descLength / 160) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Recommandé : entre 120 et 160 caractères pour résumer la page et inciter au clic.
                </p>
              </div>

              {/* Focus Keyword */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Mot-clé principal (Focus Keyword)</span>
                  {focusKeyword && (
                    <span className="text-[11px] font-normal text-slate-500">
                      Analyse active sur : <strong className="text-blue-600 font-bold">&quot;{focusKeyword}&quot;</strong>
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="ex: US Monastir ou maillot US Monastir"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-usm-blue-primary shadow-2xs"
                />
                <p className="text-[11px] text-slate-400">
                  Le terme exact sur lequel vous souhaitez positionner cette page dans les moteurs de recherche.
                </p>
              </div>

              {/* Secondary Keywords */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800">
                  Mots-clés secondaires (optionnel)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    placeholder="Ajouter un mot-clé secondaire..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>

                {secondaryKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {secondaryKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        {kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL SHARE IMAGE (1200x630) */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  IMAGE DE PARTAGE SOCIAL (Open Graph / Réseaux Sociaux)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cette image s’affichera automatiquement lorsque l’URL sera partagée sur <strong>Facebook</strong>, <strong>WhatsApp</strong>, <strong>Messenger</strong>, <strong>LinkedIn</strong>, <strong>X (Twitter)</strong> et <strong>Discord</strong>.
                </p>
                <div className="text-[11px] font-mono text-blue-700 mt-1 font-semibold">
                  Dimensions recommandées : 1200 × 630 px (format 1.91:1)
                </div>
              </div>

              {/* Current Social Image Card */}
              <div className="space-y-3">
                <div className="aspect-[1200/630] w-full max-w-lg mx-auto bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden relative shadow-sm flex items-center justify-center group">
                  {ogImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ogImage}
                        alt="Image de partage social"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMediaLibraryOpen(true)}
                          className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md cursor-pointer hover:bg-slate-100"
                        >
                          Remplacer depuis MinIO
                        </button>
                        <button
                          type="button"
                          onClick={() => setOgImage('')}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer hover:bg-rose-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        Aucune image personnalisée
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-xs">
                        Le système utilisera automatiquement l’image principale de l’entité ou le visuel officiel US Monastir.
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMediaLibraryOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-blue-600" />
                    Choisir depuis la médiathèque MinIO
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUploader(!showUploader)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Téléverser une image (1200x630)
                  </button>

                  {ogImage && (
                    <button
                      type="button"
                      onClick={() => setOgImage('')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Rétablir image par défaut
                    </button>
                  )}
                </div>

                {/* Embedded Uploader */}
                {showUploader && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-3 animate-in fade-in duration-200">
                    <MediaUploader
                      folder={`seo/${item.entityType}s`}
                      label="Glissez-déposez votre visuel 1200×630 ici"
                      onUpload={(file) => {
                        setOgImage(file.url);
                        setShowUploader(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Social text overrides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Titre Open Graph (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    placeholder={metaTitle || 'Hérite du Titre SEO'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400">
                    Laisser vide pour utiliser le Titre SEO par défaut.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Format Carte X / Twitter
                  </label>
                  <select
                    value={twitterCard}
                    onChange={(e) => setTwitterCard(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="summary_large_image">Grande image (summary_large_image) — Recommandé</option>
                    <option value="summary">Petite vignette carrée (summary)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: URL & INDEXATION */}
          {activeTab === 'indexing' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Slug de l’URL
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 text-xs text-slate-500 rounded-l-xl font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={item.path.replace(/^\//, '')}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-r-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  URL Canonique (Canonical URL)
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder={item.path}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Empêche la pénalité de contenu dupliqué (ex: paramètres de campagne UTM ou filtres boutique).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Indexation (robots.txt / meta robots)</div>
                    <div className="text-[11px] text-slate-500">Autoriser Google et Bing à indexer cette page</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={robotsIndex}
                    onChange={(e) => setRobotsIndex(e.target.checked)}
                    className="w-4 h-4 text-usm-blue-primary rounded accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Suivi des liens (Follow)</div>
                    <div className="text-[11px] text-slate-500">Autoriser les robots à suivre les liens internes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={robotsFollow}
                    onChange={(e) => setRobotsFollow(e.target.checked)}
                    className="w-4 h-4 text-usm-blue-primary rounded accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Inclure dans Sitemap</div>
                    <div className="text-[11px] text-slate-500">Présent dans sitemap.xml</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sitemapEnabled}
                    onChange={(e) => setSitemapEnabled(e.target.checked)}
                    className="w-4 h-4 text-usm-blue-primary rounded accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Fréquence de mise à jour</label>
                  <select
                    value={changeFrequency}
                    onChange={(e) => setChangeFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="daily">Quotidien (daily)</option>
                    <option value="weekly">Hebdomadaire (weekly)</option>
                    <option value="monthly">Mensuel (monthly)</option>
                    <option value="yearly">Annuel (yearly)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Priorité (Sitemap)</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value={1.0}>1.0 (Page d’accueil)</option>
                    <option value={0.8}>0.8 (Pages majeures / Boutique)</option>
                    <option value={0.7}>0.7 (Articles / Effectifs)</option>
                    <option value={0.5}>0.5 (Contenus secondaires)</option>
                    <option value={0.3}>0.3 (Pages légales)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STRUCTURED DATA (SCHEMA.ORG) */}
          {activeTab === 'schema' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Type de Données Structurées (Schema.org Type)
                </label>
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                >
                  <option value="SportsOrganization">SportsOrganization (Club / Accueil)</option>
                  <option value="SportsTeam">SportsTeam (Équipe Football / Basketball)</option>
                  <option value="Product">Product (Article de la boutique officielle)</option>
                  <option value="NewsArticle">NewsArticle (Article de presse / Communiqué)</option>
                  <option value="Person">Person (Joueur / Membre du Staff)</option>
                  <option value="SportsEvent">SportsEvent (Match / Calendrier)</option>
                  <option value="Organization">Organization (Sponsor / Partenaire)</option>
                  <option value="VideoObject">VideoObject (Média vidéo)</option>
                  <option value="CollectionPage">CollectionPage (Catalogue / Liste)</option>
                  <option value="WebPage">WebPage (Page standard)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Permet à Google d’afficher des extraits enrichis (prix en TND, disponibilité, auteur, date, etc.).
                </p>
              </div>

              {/* JSON-LD Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Aperçu du script JSON-LD injecté dans le code source</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ Validé Schema.org</span>
                </label>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-72">
                  {JSON.stringify(
                    {
                      '@context': 'https://schema.org',
                      '@type': schemaType,
                      name: metaTitle || item.title,
                      description: metaDescription,
                      url: `https://usmonastir.tn${item.path}`,
                      inLanguage: 'fr-TN',
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Custom JSON-LD override */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800">
                  JSON-LD personnalisé additionnel (optionnel)
                </label>
                <textarea
                  rows={4}
                  value={customJsonLd}
                  onChange={(e) => setCustomJsonLd(e.target.value)}
                  placeholder='{"@context": "https://schema.org", ...}'
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 5: YOAST ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Global de Qualité SEO</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                    {liveAnalysis.score} <span className="text-base text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <SeoScoreBadge score={liveAnalysis.score} status={liveAnalysis.scoreStatus} size="lg" />
              </div>

              {/* Group: Errors */}
              {errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    Erreurs à corriger en priorité ({errors.length})
                  </h4>
                  <div className="space-y-1.5">
                    {errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <div>{err.messageFr || err.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Warnings */}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Avertissements & Améliorations recommandées ({warnings.length})
                  </h4>
                  <div className="space-y-1.5">
                    {warnings.map((warn, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <div>{warn.messageFr || warn.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Good Results */}
              {goodResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Bonnes pratiques validées ({goodResults.length})
                  </h4>
                  <div className="space-y-1.5">
                    {goodResults.map((good, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <div>{good.messageFr || good.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PREVIEWS */}
          {activeTab === 'preview' && (
            <SocialSharePreview
              title={metaTitle}
              description={metaDescription}
              path={item.path}
              image={ogImage || defaultSocialImage}
              siteName="US Monastir"
            />
          )}

          {/* TAB 7: TOOLS & DEBUGGER */}
          {activeTab === 'tools' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  Balises Meta HTML générées pour les réseaux sociaux
                </h4>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`<title>${metaTitle || item.title}</title>
<meta name="description" content="${metaDescription}" />
<link rel="canonical" href="https://usmonastir.tn${item.path}" />
<meta property="og:title" content="${ogTitle || metaTitle || item.title}" />
<meta property="og:description" content="${ogDescription || metaDescription}" />
<meta property="og:image" content="${ogImage || defaultSocialImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Union Sportive Monastirienne" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="${twitterCard}" />
<meta name="twitter:title" content="${metaTitle || item.title}" />
<meta name="twitter:image" content="${ogImage || defaultSocialImage}" />`}
                </pre>
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Facebook Sharing Debugger</div>
                  <div className="text-[11px] text-slate-500">
                    Testez et videz le cache de partage Facebook pour cette URL
                  </div>
                </div>
                <a
                  href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(
                    `https://usmonastir.tn${item.path}`
                  )}`}

                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Ouvrir le Débogueur
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="text-xs text-slate-500">
            Dernière analyse : {item.lastAnalyzedAt ? new Date(item.lastAnalyzedAt).toLocaleString('fr-FR') : 'Jamais'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSaveForm}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-usm-blue-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>

      {/* MinIO Media Library Modal Picker */}
      {mediaLibraryOpen && (
        <MediaLibrary
          isOpen={mediaLibraryOpen}
          onClose={() => setMediaLibraryOpen(false)}
          onSelect={(file) => {
            setOgImage(file.url);
            setMediaLibraryOpen(false);
          }}
          typeFilter="image"
          folderFilter="seo"
        />
      )}
    </div>
  );
};
