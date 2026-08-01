'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { Plus, X, Trash2, Pencil, Image as ImageIcon, AlertCircle, Layers, Megaphone, Save } from 'lucide-react';
import { api } from '../../lib/api-client';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { MediaLibrary } from '../../components/Admin/MediaLibrary';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

const BADGES = ['new', 'bestseller', 'limited', 'lowStock', 'soldOut', 'official'];
const SPORTS = ['football', 'basketball', 'club', 'academy', 'fans'];
const DEFAULT_BOUTIQUE_BANNER = {
  isActive: true,
  eyebrow: 'BOUTIQUE OFFICIELLE',
  title: 'Votre campagne boutique',
  description: 'Ajoutez un titre, une image et un appel à l’action pour prévisualiser cette bannière.',
  imageUrl: '/banners/boutique_hero.webp',
  desktopImageUrl: '/banners/boutique_hero.webp',
  mobileImageUrl: '/banners/boutique_hero.webp',
  ctaLabel: 'Découvrir',
  ctaHref: '/boutique#catalogue',
};

const emptyForm = {
  name: '',
  nameFr: '',
  nameAr: '',
  price: '',
  oldPrice: '',
  coverImage: '',
  images: [] as string[],
  category: 'jerseys',
  sport: 'football',
  season: '2025/26',
  sizes: 'S, M, L, XL',
  stock: 20,
  status: 'published' as 'published' | 'draft' | 'archived',
  description: '',
};

export default function AdminBoutique() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // API State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(() => searchParams.get('new') === '1');
  const [form, setForm] = useState(emptyForm);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'product' | 'category' | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', coverImage: '', active: true });
  const [boutiqueBanner, setBoutiqueBanner] = useState(DEFAULT_BOUTIQUE_BANNER);
  const [bannerSaveState, setBannerSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [bannerSaveMessage, setBannerSaveMessage] = useState('');

  // Load products, categories from NestJS backend
  const loadCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, cats, homepage] = await Promise.all([
        api.getAdminProducts(),
        api.getAdminCategories(),
        api.getHomepageSettings(),
      ]);
      setProducts(prodData.products || []);
      setCategories(cats || []);
      if (homepage?.boutiqueBanner) {
        const saved = homepage.boutiqueBanner;
        setBoutiqueBanner({
          isActive: saved.isActive !== false,
          eyebrow: saved.eyebrow?.trim() || DEFAULT_BOUTIQUE_BANNER.eyebrow,
          title: saved.title?.trim() || DEFAULT_BOUTIQUE_BANNER.title,
          description: saved.description?.trim() || DEFAULT_BOUTIQUE_BANNER.description,
          imageUrl: saved.desktopImageUrl?.trim() || saved.imageUrl?.trim() || '',
          desktopImageUrl: saved.desktopImageUrl?.trim() || saved.imageUrl?.trim() || '',
          mobileImageUrl: saved.mobileImageUrl?.trim() || '',
          ctaLabel: saved.ctaLabel?.trim() || DEFAULT_BOUTIQUE_BANNER.ctaLabel,
          ctaHref: saved.ctaHref?.trim() || DEFAULT_BOUTIQUE_BANNER.ctaHref,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le catalogue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/admin/boutique');
      openAddForm();
    }
  }, [searchParams, router]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const saveBoutiqueBanner = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setBannerSaveState('saving');
    setBannerSaveMessage('');
    const payload = {
      ...boutiqueBanner,
      eyebrow: boutiqueBanner.eyebrow.trim() || DEFAULT_BOUTIQUE_BANNER.eyebrow,
      title: boutiqueBanner.title.trim() || DEFAULT_BOUTIQUE_BANNER.title,
      description: boutiqueBanner.description.trim() || DEFAULT_BOUTIQUE_BANNER.description,
      imageUrl: boutiqueBanner.desktopImageUrl.trim(),
      desktopImageUrl: boutiqueBanner.desktopImageUrl.trim(),
      mobileImageUrl: boutiqueBanner.mobileImageUrl.trim(),
      ctaLabel: boutiqueBanner.ctaLabel.trim() || DEFAULT_BOUTIQUE_BANNER.ctaLabel,
      ctaHref: boutiqueBanner.ctaHref.trim() || DEFAULT_BOUTIQUE_BANNER.ctaHref,
    };
    try {
      const updated = await api.updateHomepageSettings({ boutiqueBanner: payload });
      if (!updated?.boutiqueBanner) throw new Error('La réponse du serveur ne contient pas la bannière enregistrée.');
      setBoutiqueBanner({ ...payload, ...updated.boutiqueBanner });
      setBannerSaveState('saved');
      setBannerSaveMessage('Bannière publiée. Rechargez la boutique pour voir la mise à jour.');
      window.setTimeout(() => setBannerSaveState('idle'), 2500);
    } catch (err: any) {
      setBannerSaveState('error');
      setBannerSaveMessage(err.message || 'Impossible d’enregistrer la bannière boutique. Vérifiez votre session administrateur.');
    }
  };

  const openEditForm = (p: any) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      nameFr: p.nameFr || '',
      nameAr: p.nameAr || '',
      price: (p.price / 1000).toFixed(3),
      oldPrice: p.oldPrice ? (p.oldPrice / 1000).toFixed(3) : '',
      coverImage: p.coverImage || '',
      images: (p.images || []).filter((url: string) => url !== p.coverImage),
      category: p.category || 'jerseys',
      sport: p.sport || 'football',
      season: p.season || '2025/26',
      sizes: p.variants ? p.variants.map((v: any) => v.size).join(', ') : 'S, M, L, XL',
      stock: p.variants ? p.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) : (p.stock || 0),
      status: p.status || 'published',
      description: p.description || '',
    });
    setShowForm(true);
  };

  // Convert input price strings (e.g. "85.000" or "85") to millimes
  const parsePriceToMillimes = (val: string): number => {
    const cleanVal = val.replace(/[^\d.]/g, '');
    return Math.round(parseFloat(cleanVal) * 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.coverImage) return;

    try {
      const priceMillimes = parsePriceToMillimes(form.price);
      const oldPriceMillimes = form.oldPrice ? parsePriceToMillimes(form.oldPrice) : undefined;
      
      const sizesArray = form.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Construct variants model with simple default values
      const variants = sizesArray.map((size, idx) => ({
        id: `${editingId || 'new'}-${size}-${idx}`,
        sku: `SKU-${form.name.slice(0, 3).toUpperCase()}-${size}-${idx}`,
        size,
        color: 'Bleu',
        colorHex: '#0D63FF',
        stock: Math.round(form.stock / sizesArray.length), // divide stock among sizes
      }));

      const productPayload = {
        name: form.name,
        nameFr: form.nameFr || form.name,
        nameAr: form.nameAr || form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: `SKU-${form.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        price: priceMillimes,
        oldPrice: oldPriceMillimes,
        coverImage: form.coverImage,
        images: form.images,
        category: form.category,
        sport: form.sport,
        season: form.season,
        variants: variants,
        status: form.status,
        description: form.description,
        descriptionFr: form.description,
        descriptionAr: form.description,
        lowStockThreshold: 5,
      };

      if (editingId) {
        await api.updateProduct(editingId, productPayload);
      } else {
        await api.createProduct(productPayload);
      }
      
      setShowForm(false);
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const openAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', slug: '', coverImage: '', active: true });
    setShowCategoryForm(true);
  };

  const openEditCategory = (c: any) => {
    setEditingCategoryId(c._id || c.id);
    setCategoryForm({ name: c.name || '', slug: c.slug || '', coverImage: c.coverImage || '', active: c.active !== false });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (categoryForm.slug || categoryForm.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      if (editingCategoryId) {
        const updated = await api.updateCategory(editingCategoryId, {
          name: categoryForm.name, nameFr: categoryForm.name, nameAr: categoryForm.name,
          slug, coverImage: categoryForm.coverImage, active: categoryForm.active,
        });
        setCategories((current) => current.map((c) => (c._id || c.id) === editingCategoryId ? updated : c));
      } else {
        const created = await api.createCategory({ name: categoryForm.name, nameFr: categoryForm.name, nameAr: categoryForm.name, slug, icon: 'category', coverImage: categoryForm.coverImage, active: categoryForm.active, displayOrder: categories.length + 1 });
        setCategories((current) => [...current, created]);
        setForm((current) => ({ ...current, category: created.slug }));
      }
      setCategoryForm({ name: '', slug: '', coverImage: '', active: true });
      setEditingCategoryId(null);
      setShowCategoryForm(false);
    } catch (err: any) { alert(err.message || 'Impossible d’enregistrer la catégorie'); }
  };

  const handleToggleCategoryActive = async (c: any) => {
    try {
      const updated = await api.updateCategory(c._id || c.id, { active: !c.active });
      setCategories((current) => current.map((cat) => (cat._id || cat.id) === (c._id || c.id) ? updated : cat));
    } catch (err: any) { alert(err.message || 'Impossible de changer le statut'); }
  };

  const handleDeleteCategory = (c: any) => {
    requestConfirmation({ title: 'Supprimer cette catégorie ?', message: `La catégorie « ${c.name} » sera supprimée définitivement.`, confirmLabel: 'Supprimer', onConfirm: async () => { try { await api.deleteCategory(c._id || c.id); setCategories(current => current.filter(cat => (cat._id || cat.id) !== (c._id || c.id))); } catch (err: any) { alert(err.message || 'Impossible de supprimer la catégorie'); } } });
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      // Find the current product to get its variants
      const prod = products.find(p => p._id === id);
      if (!prod) return;

      const variants = prod.variants || [];
      if (variants.length > 0) {
        // divide the manual stock override equally among sizes
        const updatedVariants = variants.map((v: any) => ({
          ...v,
          stock: Math.max(0, Math.round(newStock / variants.length)),
        }));
        await api.updateProduct(id, { variants: updatedVariants });
      } else {
        await api.updateProduct(id, { stock: newStock });
      }
      
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Impossible de mettre à jour le stock');
    }
  };

  const handleUpdateStatus = async (id: string, active: boolean) => {
    try {
      await api.updateProduct(id, { status: active ? 'published' : 'draft' });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Impossible de changer le statut');
    }
  };

  const handleDelete = (id: string, name: string) => {
    requestConfirmation({ title: 'Supprimer ce produit ?', message: `Le produit « ${name} » sera supprimé définitivement.`, confirmLabel: 'Supprimer', onConfirm: async () => { try { await api.deleteProduct(id); loadCatalogData(); } catch (err: any) { alert(err.message || 'Erreur lors de la suppression'); } } });
  };

  const toggleBadge = async (id: string, badge: string, currentBadges?: string[]) => {
    const list = currentBadges || [];
    const updated = list.includes(badge) ? list.filter(b => b !== badge) : [...list, badge];
    try {
      await api.updateProduct(id, { badges: updated });
      loadCatalogData();
    } catch (err: any) {
      alert(err.message || 'Impossible de changer les badges');
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 min-h-screen">
      <AdminPageHeader
        title="Boutique USM Catalog"
        description="Dashboard de gestion du catalogue boutique, des stocks et de la visibilité des produits."
        actions={
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={14} /> Ajouter un Produit
          </button>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-[#061a36] to-[#0a3165] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-amber-300"><Megaphone size={18} /></span>
            <div><h2 className="text-sm font-black uppercase tracking-wide">Bannière principale boutique</h2><p className="mt-1 text-xs text-slate-300">Cette campagne devient le visuel principal en haut de la page Boutique.</p></div>
          </div>
          <button form="boutique-banner-form" type="submit" disabled={bannerSaveState === 'saving'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-xs font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60"><Save size={15} /> {bannerSaveState === 'saving' ? 'Publication…' : 'Publier la bannière'}</button>
        </div>
        <form id="boutique-banner-form" onSubmit={saveBoutiqueBanner} className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-700 sm:col-span-2"><input type="checkbox" checked={boutiqueBanner.isActive} onChange={event => setBoutiqueBanner(current => ({ ...current, isActive: event.target.checked }))} className="size-4 accent-usm-blue-primary" />Afficher cette bannière sur la boutique</label>
            <label className="text-xs font-bold text-slate-500">Surtitre<input value={boutiqueBanner.eyebrow} onChange={event => setBoutiqueBanner(current => ({ ...current, eyebrow: event.target.value }))} placeholder="EX. ÉDITION MATCHDAY" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-usm-blue-primary" /></label>
            <label className="text-xs font-bold text-slate-500">Titre *<input value={boutiqueBanner.title} onChange={event => setBoutiqueBanner(current => ({ ...current, title: event.target.value }))} placeholder="EX. Maillots officiels 2025/26" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-usm-blue-primary" /></label>
            <label className="text-xs font-bold text-slate-500 sm:col-span-2">Description<textarea value={boutiqueBanner.description} onChange={event => setBoutiqueBanner(current => ({ ...current, description: event.target.value }))} rows={3} placeholder="Présentez la campagne en une phrase forte." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-usm-blue-primary" /></label>
            <label className="text-xs font-bold text-slate-500">Libellé CTA<input value={boutiqueBanner.ctaLabel} onChange={event => setBoutiqueBanner(current => ({ ...current, ctaLabel: event.target.value }))} placeholder="Découvrir" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-usm-blue-primary" /></label>
            <label className="text-xs font-bold text-slate-500">Lien CTA<input value={boutiqueBanner.ctaHref} onChange={event => setBoutiqueBanner(current => ({ ...current, ctaHref: event.target.value }))} placeholder="/boutique?categorie=maillots" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-usm-blue-primary" /></label>
            <div><p className="mb-2 text-xs font-bold text-slate-500">Bannière web <span className="font-normal text-slate-400">(recommandé 1920×900)</span></p><MediaUploader folder="banners/boutique/desktop" currentUrl={boutiqueBanner.desktopImageUrl} label="Importer la bannière web" onUpload={(file) => setBoutiqueBanner(current => ({ ...current, imageUrl: file.url, desktopImageUrl: file.url }))} onRemove={() => setBoutiqueBanner(current => ({ ...current, imageUrl: '', desktopImageUrl: '' }))} /></div>
            <div><p className="mb-2 text-xs font-bold text-slate-500">Bannière mobile <span className="font-normal text-slate-400">(recommandé 900×1200)</span></p><MediaUploader folder="banners/boutique/mobile" currentUrl={boutiqueBanner.mobileImageUrl} label="Importer la bannière mobile" onUpload={(file) => setBoutiqueBanner(current => ({ ...current, mobileImageUrl: file.url }))} onRemove={() => setBoutiqueBanner(current => ({ ...current, mobileImageUrl: '' }))} /></div>
            <p role={bannerSaveState === 'error' ? 'alert' : 'status'} aria-live="polite" className={`min-h-5 text-xs font-bold sm:col-span-2 ${bannerSaveState === 'error' ? 'text-red-600' : bannerSaveState === 'saved' ? 'text-emerald-700' : 'text-slate-500'}`}>{bannerSaveMessage}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px] lg:grid-cols-1">
            <div className="relative min-h-52 overflow-hidden rounded-2xl bg-slate-950 p-5 text-white">{boutiqueBanner.desktopImageUrl && <img src={boutiqueBanner.desktopImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}<div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/15" /><span className="absolute right-3 top-3 rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold uppercase">Web</span><div className="relative flex h-full flex-col justify-end"><p className="text-[9px] font-black uppercase tracking-[.2em] text-amber-300">{boutiqueBanner.eyebrow}</p><p className="mt-2 text-2xl font-black uppercase leading-none">{boutiqueBanner.title}</p><p className="mt-3 text-xs leading-5 text-slate-300">{boutiqueBanner.description}</p></div></div>
            <div className="relative min-h-52 overflow-hidden rounded-2xl bg-slate-950 p-4 text-white lg:mx-auto lg:w-36">{(boutiqueBanner.mobileImageUrl || boutiqueBanner.desktopImageUrl) && <img src={boutiqueBanner.mobileImageUrl || boutiqueBanner.desktopImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" /><span className="absolute right-2 top-2 rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold uppercase">Mobile</span><div className="relative flex h-full flex-col justify-end"><p className="text-[8px] font-black uppercase text-amber-300">{boutiqueBanner.eyebrow}</p><p className="mt-1 text-sm font-black uppercase leading-tight">{boutiqueBanner.title}</p></div></div>
          </div>
        </form>
      </section>

      {/* Categories Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Layers size={16} className="text-usm-blue-primary" />
          <h3 className="text-sm font-black text-slate-900">Catégories</h3>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catégories</h4>
            <button
              onClick={openAddCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Plus size={12} /> Ajouter
            </button>
          </div>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune catégorie.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((c) => (
                <div key={c._id || c.id} className={`group relative border rounded-xl overflow-hidden ${c.active === false ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
                  <div className="relative aspect-video bg-slate-100">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={22} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEditCategory(c)} aria-label="Modifier" className="flex size-8 items-center justify-center rounded-lg bg-white/90 text-slate-700 hover:bg-white cursor-pointer"><Pencil size={13} /></button>
                      <button onClick={() => handleDeleteCategory(c)} aria-label="Supprimer" className="flex size-8 items-center justify-center rounded-lg bg-white/90 text-red-600 hover:bg-white cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{c.slug}</p>
                    </div>
                    <button
                      onClick={() => handleToggleCategoryActive(c)}
                      title={c.active === false ? 'Activer' : 'Désactiver'}
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer transition-colors ${c.active === false ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                    >
                      {c.active === false ? 'Inactive' : 'Active'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading / Error / Products Table */}
      {loading ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <div className="h-8 w-8 border-4 border-t-usm-blue-primary border-slate-100 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Chargement du catalogue...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-slate-700 text-sm font-semibold">{error}</p>
          <button onClick={loadCatalogData} className="mt-4 px-4 py-2 bg-usm-blue-primary text-white text-xs font-bold rounded-lg">
            Réessayer
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Prix</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const stockSum = p.variants ? p.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) : (p.stock || 0);
                  const isPublished = p.status === 'published';
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors text-slate-800">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={p.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 max-w-[220px] truncate block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-650 font-bold uppercase">{p.category}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{(p.price / 1000).toFixed(3)} DT</td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={stockSum}
                          onChange={(e) => handleUpdateStock(p._id, Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-mono outline-none focus:border-usm-blue-primary text-slate-800"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => handleUpdateStatus(p._id, !isPublished)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                            isPublished ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {BADGES.map((b) => {
                            const active = p.badges?.includes(b);
                            return (
                              <button
                                key={b}
                                onClick={() => toggleBadge(p._id, b, p.badges)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors ${
                                  active ? 'bg-usm-blue-dark text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                {b}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditForm(p)}
                            className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prix (DT) *</label>
                  <input required type="text" placeholder="85.000" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ancien Prix (DT)</label>
                  <input type="text" placeholder="110.000" value={form.oldPrice} onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Statut</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800">
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Image principale *</label>
                <MediaUploader compact folder={`products/${editingId || 'new'}/main`} currentUrl={form.coverImage} onUpload={(file) => setForm((current) => ({ ...current, coverImage: file.url }))} onRemove={() => setForm((current) => ({ ...current, coverImage: '' }))} />
                <button type="button" onClick={() => setMediaPickerTarget('product')} className="mt-2 min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:border-usm-blue-primary">Choisir une image existante</button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                  Photos supplémentaires <span className="font-normal text-slate-400">(affichées au survol de la carte et dans la galerie de la fiche produit)</span>
                </label>
                {form.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {form.images.map((url, idx) => (
                      <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-red-600 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <MediaUploader
                  key={form.images.length}
                  compact
                  folder={`products/${editingId || 'new'}/gallery`}
                  onUpload={(file) => setForm((current) => ({ ...current, images: [...current.images, file.url] }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800">
                    {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={openAddCategory} className="mt-1 min-h-11 text-xs font-bold text-usm-blue-primary hover:underline">+ Nouvelle catégorie</button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Section Sport</label>
                  <select value={form.sport} onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800">
                    {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tailles (séparées par virgules)</label>
                <input type="text" value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary text-slate-800" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none text-slate-800" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2">
                {editingId ? 'Sauvegarder' : 'Ajouter le Produit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setShowCategoryForm(false)}>
          <form onSubmit={handleSaveCategory} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">{editingCategoryId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowCategoryForm(false)} className="flex size-11 items-center justify-center rounded-xl hover:bg-slate-100"><X size={18} /></button>
            </div>
            <label className="block text-sm font-semibold text-slate-700">Nom *<input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
            <label className="block text-sm font-semibold text-slate-700">Slug<input value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} placeholder="généré automatiquement" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
            <MediaUploader folder="categories" currentUrl={categoryForm.coverImage} label="Ajouter l'image de la catégorie" onUpload={(file) => setCategoryForm({ ...categoryForm, coverImage: file.url })} />
            <button type="button" onClick={() => setMediaPickerTarget('category')} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold">Choisir dans la médiathèque</button>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={categoryForm.active} onChange={(event) => setCategoryForm({ ...categoryForm, active: event.target.checked })} className="size-4" />
              Catégorie active (visible sur la boutique)
            </label>
            <button className="min-h-11 w-full rounded-xl bg-usm-blue-primary px-4 text-sm font-bold text-white">
              {editingCategoryId ? 'Enregistrer' : 'Créer la catégorie'}
            </button>
          </form>
        </div>
      )}

      <MediaLibrary isOpen={mediaPickerTarget !== null} onClose={() => setMediaPickerTarget(null)} typeFilter="image" onSelect={(file) => { if (mediaPickerTarget === 'product') setForm((current) => ({ ...current, coverImage: file.url })); else if (mediaPickerTarget === 'category') setCategoryForm((current) => ({ ...current, coverImage: file.url })); setMediaPickerTarget(null); }} />
    </div>
  );
}
