'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Check, Filter, Heart, MessageCircle,
  PackageCheck, Search, ShieldCheck, ShoppingBag, SlidersHorizontal,
  Truck, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';

type SortOption = 'order' | 'date_desc' | 'popularity_desc' | 'price_asc' | 'price_desc';

const formatTND = (millimes: number) => `${((millimes || 0) / 1000).toFixed(3)} DT`;
const stockFor = (product: any) => (product.variants || []).reduce((sum: number, item: any) => sum + (item.stock || 0), 0);
const hasBadge = (product: any, badge: string) => product.badges?.some((item: string) => item.toLowerCase() === badge.toLowerCase());

function BoutiqueProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const router = useRouter();
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const id = product._id || product.id;
  const stock = stockFor(product);
  const soldOut = stock <= 0 || product.status === 'archived';
  const liked = wishlist.includes(id);
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const sizes = Array.from(new Set((product.variants || []).filter((item: any) => item.stock > 0).map((item: any) => item.size))).slice(0, 4);
  const coverImage = product.coverImage || product.image;
  const hoverImage = (product.images || []).find((url: string) => url && url !== coverImage);

  const add = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (soldOut) return;
    addToCart({ ...product, id, image: coverImage, price: formatTND(product.price) }, (sizes[0] as string) || 'Unique');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.18) }}
      onClick={() => router.push(`/product/${product.slug}`)}
      className="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-[#DDE8F8] bg-white shadow-[0_18px_50px_-38px_rgba(2,8,20,.55)] transition duration-300 hover:-translate-y-1 hover:border-[#0D63FF] hover:shadow-[0_26px_60px_-34px_rgba(2,8,20,.5)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F7FA]">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={product.nameFr || product.name}
              className={`w-full h-full object-contain p-4 transition-opacity duration-500 ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.035] duration-500'}`}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="grid h-full place-items-center text-[#8290a4]"><ShoppingBag size={34} /></div>
        )}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {hasBadge(product, 'new') && <span className="rounded-full bg-[#0D63FF] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">Nouveau</span>}
            {hasBadge(product, 'limited') && <span className="rounded-full bg-[#0D63FF] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">Limité</span>}
            {discount > 0 && <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-usm-blue-dark">−{discount}%</span>}
          </div>
          <button aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'} onClick={(event) => { event.stopPropagation(); toggleWishlist(id); }} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/70 bg-white/90 text-[#020814] shadow-sm backdrop-blur transition hover:bg-white hover:text-[#0D63FF]">
            <Heart size={17} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-red-500' : ''} />
          </button>
        </div>
        {soldOut && <div className="absolute inset-0 grid place-items-center bg-white/55 backdrop-blur-[2px]"><span className="rounded-full border border-white/25 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[.15em] text-usm-blue-dark">Épuisé</span></div>}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-base font-black text-[#020814] sm:text-lg">{formatTND(product.price)}</p>
          {product.oldPrice > product.price && <p className="font-mono text-[10px] text-[#8793a5] line-through">{formatTND(product.oldPrice)}</p>}
        </div>
        <p className="mt-2 text-[9px] font-black uppercase tracking-[.18em] text-[#7A8AA0]">{product.category || 'Boutique officielle'}</p>
        <h3 className="mt-1 min-h-11 line-clamp-2 font-display text-base font-black leading-snug text-[#020814] sm:text-lg">{product.nameFr || product.name}</h3>
        {sizes.length > 0 && <div className="mt-3 flex items-center gap-1.5">{sizes.map(size => <span key={String(size)} className="grid min-w-7 place-items-center rounded-md border border-[#dce3ed] px-1.5 py-1 text-[9px] font-bold text-[#53627a]">{String(size)}</span>)}</div>}
        <div className="mt-4 border-t border-[#e6eaf0] pt-4">
          <button
            type="button"
            disabled={soldOut}
            onClick={add}
            aria-label={`Ajouter ${product.nameFr || product.name} au panier`}
            className="mt-2.5 flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-2xl bg-[#0D63FF] px-2 py-1.5 text-center text-[10px] font-black uppercase leading-tight tracking-tight text-white shadow-[0_10px_24px_-14px_rgba(13,99,255,.7)] transition-all hover:bg-[#0052D9] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D63FF] disabled:cursor-not-allowed disabled:bg-[#c7d2e0] disabled:text-white/80 disabled:shadow-none disabled:active:scale-100 sm:gap-2 sm:px-3 sm:text-[11px] sm:tracking-normal"
          >
            <ShoppingBag size={15} className="shrink-0 sm:size-4" />
            <span className="min-w-0">{soldOut ? 'Épuisé' : 'Ajouter au panier'}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductSkeleton() {
  return <div className="overflow-hidden rounded-[1.5rem] border border-[#DDE8F8] bg-white"><div className="skeleton-loader aspect-[4/5]" /><div className="space-y-3 p-5"><div className="skeleton-loader h-2 w-1/3 rounded" /><div className="skeleton-loader h-5 w-4/5 rounded" /><div className="skeleton-loader h-10 w-full rounded" /></div></div>;
}

export const OfficialCatalog: React.FC = () => {
  const { clubSettings } = useApp();
  const catalogueRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banner, setBanner] = useState<any>(null);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('order');
  const [inStock, setInStock] = useState(false);
  const [badge, setBadge] = useState('');
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    api.getHomepageSettings()
      .then(settings => setBanner(settings?.boutiqueBanner || null))
      .catch(() => setBanner(null))
      .finally(() => setSettingsLoading(false));

    Promise.all([api.getProducts({ sort: 'order_asc', limit: 100 }), api.getCategories()])
      .then(([catalogue, categoryData]) => {
        setProducts(catalogue.products || []);
        setCategories(categoryData || []);
      })
      .catch((requestError: any) => setError(requestError.message || 'Impossible de charger la boutique.'))
      .finally(() => setCatalogueLoading(false));
  }, []);

  const filtered = useMemo(() => products.filter(product => {
    const searchable = `${product.name || ''} ${product.nameFr || ''} ${product.description || ''}`.toLowerCase();
    return (category === 'all' || product.category === category)
      && (!search.trim() || searchable.includes(search.trim().toLowerCase()))
      && (!inStock || stockFor(product) > 0)
      && (!badge || hasBadge(product, badge));
  }).sort((a, b) => sort === 'price_asc' ? a.price - b.price : sort === 'price_desc' ? b.price - a.price : sort === 'popularity_desc' ? (b.views || 0) - (a.views || 0) : sort === 'date_desc' ? new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() : 0), [products, category, search, inStock, badge, sort]);

  const desktopBannerImage = banner?.desktopImageUrl || banner?.imageUrl || '';
  const hasAdminImage = Boolean(banner?.isActive && desktopBannerImage);

  const reset = () => { setCategory('all'); setBadge(''); setInStock(false); setSearch(''); };
  const browse = (slug = 'all') => { setCategory(slug); requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  const activeFilterCount = [category !== 'all', Boolean(badge), inStock, Boolean(search.trim())].filter(Boolean).length;

  // A plain JSX value (not a component defined during render) — same filter
  // fields are reused verbatim in both the desktop sidebar and mobile drawer.
  const filterFields = (
    <div className="space-y-5">
      <div><label htmlFor="boutique-category" className="mb-2 block text-[10px] font-black uppercase tracking-[.16em] text-[#637089]">Catégorie</label><select id="boutique-category" value={category} onChange={event => setCategory(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#d4dbe5] bg-white px-3 text-sm font-bold text-[#020814] outline-none focus:border-[#0057ff]"><option value="all">Toutes les catégories</option>{categories.map((item: any) => <option key={item._id || item.slug} value={item.slug}>{item.nameFr || item.name}</option>)}</select></div>
      <div><label htmlFor="boutique-badge" className="mb-2 block text-[10px] font-black uppercase tracking-[.16em] text-[#637089]">Sélection</label><select id="boutique-badge" value={badge} onChange={event => setBadge(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#d4dbe5] bg-white px-3 text-sm font-bold text-[#020814] outline-none focus:border-[#0057ff]"><option value="">Tous les produits</option><option value="new">Nouveautés</option><option value="bestseller">Meilleures ventes</option><option value="limited">Édition limitée</option><option value="official">Produits officiels</option></select></div>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#d4dbe5] bg-white px-3 text-sm font-bold text-[#020814]"><input checked={inStock} onChange={event => setInStock(event.target.checked)} type="checkbox" className="size-4 accent-[#0057ff]" />En stock uniquement</label>
      {(category !== 'all' || badge || inStock || search) && <button onClick={reset} className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#0057ff] hover:text-[#020814]"><X size={15} />Effacer les filtres</button>}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-usm-blue-dark">
      {/* Compact, text-first hero — no full-bleed image or oversized min-height standing
          between the visitor and the product grid. The decorative photo only shows on
          desktop (fixed, capped height so it can't dictate the row's height at wide
          viewports), and the search/filter bar lives inside this same section so there's
          no second block of section padding stacked on top of the hero's own. */}
      <section className="relative isolate overflow-hidden bg-white text-usm-blue-dark">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-usm-blue-primary/10 blur-[110px] sm:h-96 sm:w-96" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-5 pt-24 sm:px-8 sm:pb-6 sm:pt-28 lg:px-12 lg:pb-7 lg:pt-28">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-10">
            <div className="max-w-xl">
              <h1 className="break-words font-display text-3xl font-black uppercase leading-[.95] tracking-[-.02em] text-[#020814] sm:text-4xl lg:text-4xl">
                LA BOUTIQUE OFFICIELLE DE L’US MONASTIR
              </h1>
              <p className="mt-2.5 max-w-lg break-words text-sm leading-6 text-[#5B6B82] sm:text-base lg:mt-3">
                {banner?.description || 'Découvrez les maillots, vêtements et accessoires officiels de l’US Monastir. Affichez vos couleurs et vivez votre passion au quotidien.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mt-4">
                {/* Trust signals — one compact inline row instead of the old 4-row,
                    full-width strip that used to push the catalogue down ~250px. */}
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] font-bold text-[#5B6B82]">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#0D63FF]" />Articles officiels</span>
                  <span className="inline-flex items-center gap-1.5"><Truck size={13} className="text-[#0D63FF]" />Livraison</span>
                  <span className="hidden items-center gap-1.5 lg:inline-flex"><MessageCircle size={13} className="text-[#0D63FF]" />Assistance</span>
                </div>
              </div>
            </div>

            {/* Fixed, capped height — decoupled from column width so a wide desktop
                viewport can't force a tall image the way an aspect-ratio class would. */}
            <div className="relative hidden lg:block">
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-usm-blue-primary/10 blur-2xl" />
              <div className="relative h-48 w-full overflow-hidden rounded-[1.5rem] border border-usm-border shadow-[0_20px_50px_-24px_rgba(13,99,255,0.35)] xl:h-56">
                {!settingsLoading && (
                  <img
                    src={hasAdminImage ? desktopBannerImage : '/banners/boutique_hero.webp'}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick category chips — one tap jumps straight into a filtered grid,
              faster than scrolling to the sidebar and smarter than a generic
              "explore categories" button that just scrolled to the same spot. */}
          {categories.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:mt-5">
              <button
                onClick={() => browse('all')}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
                  category === 'all' ? 'border-[#0D63FF] bg-[#0D63FF] text-white' : 'border-[#DDE8F8] bg-white text-usm-blue-dark hover:border-[#0D63FF]/40'
                }`}
              >
                Tout voir
              </button>
              {categories.map((item: any) => (
                <button
                  key={item._id || item.slug}
                  onClick={() => browse(item.slug)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
                    category === item.slug ? 'border-[#0D63FF] bg-[#0D63FF] text-white' : 'border-[#DDE8F8] bg-white text-usm-blue-dark hover:border-[#0D63FF]/40'
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>{item.nameFr || item.name}
                </button>
              ))}
            </div>
          )}

          {/* Search / sort / mobile-filters — lives in the hero now instead of a
              second bordered section, removing a whole extra block of section
              padding that used to sit between the hero and the actual grid. */}
          <div id="catalogue" ref={catalogueRef} className="scroll-mt-20 mt-5 rounded-[1.75rem] border border-[#DDE8F8] bg-white p-3 shadow-sm sm:p-4 lg:mt-6">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f7d91]" size={18} />
                <label htmlFor="catalogue-search" className="sr-only">Rechercher un produit</label>
                <input id="catalogue-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un maillot, un accessoire…" className="min-h-12 w-full rounded-2xl border border-transparent bg-white pl-12 pr-4 text-sm text-[#020814] outline-none transition focus:border-[#0D63FF] sm:min-h-14 sm:text-base" />
              </div>
              <select aria-label="Trier les produits" value={sort} onChange={event => setSort(event.target.value as SortOption)} className="min-h-12 w-full rounded-2xl border border-transparent bg-white px-4 text-sm font-bold text-[#020814] outline-none focus:border-[#0D63FF] sm:min-h-14 lg:w-auto">
                <option value="order">Recommandés</option>
                <option value="date_desc">Nouveautés</option>
                <option value="popularity_desc">Plus populaires</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
              <button onClick={() => setMobileFilters(true)} className="relative inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-usm-blue-dark ring-1 ring-inset ring-[#DDE8F8] sm:min-h-14 lg:hidden lg:w-auto">
                <SlidersHorizontal size={17} />Filtres
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#0D63FF] text-[10px] font-black text-white">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#DDE8F8] bg-[#F5F7FA] py-6 sm:py-8 lg:py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
            <aside className="hidden rounded-[1.5rem] border border-[#DDE8F8] bg-white p-5 shadow-sm lg:block">
              <div className="mb-5 flex items-center gap-2 text-sm font-black"><Filter size={16} />Filtrer la boutique</div>
              {filterFields}
            </aside>
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#5F6F84]"><span className="font-black text-usm-blue-dark">{filtered.length}</span> produit{filtered.length === 1 ? '' : 's'}</p>
                {activeFilterCount > 0 && <button onClick={reset} className="text-xs font-black text-[#0D63FF] hover:underline">Tout réinitialiser</button>}
              </div>
              {catalogueLoading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)}</div>
              ) : error ? (
                <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center text-sm font-bold text-red-700">{error}</div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{filtered.map((product, index) => <BoutiqueProductCard key={product._id || product.id} product={product} index={index} />)}</div>
              ) : (
                <div className="relative overflow-hidden rounded-[2rem] border border-[#DDE8F8] bg-white px-6 py-16 text-center">
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#0D63FF]" />
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-[#0D63FF]"><PackageCheck size={30} /></span>
                  <h3 className="mt-6 font-display text-3xl font-black uppercase">Aucune pièce trouvée</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6F84]">Modifiez votre recherche ou retrouvez immédiatement l’ensemble de la collection officielle.</p>
                  <button onClick={reset} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-usm-blue-dark transition hover:bg-[#0D63FF] hover:text-white">Voir tous les produits<ArrowRight size={16} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0D63FF] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-12 sm:px-8 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-white/80">Une question sur votre commande ?</p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">La boutique vous répond.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Tailles, disponibilité, retrait ou livraison : contactez directement l’équipe boutique.</p>
          </div>
          <a href={`mailto:${clubSettings.contactEmail}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#0D63FF] transition hover:bg-[#EEF5FF]"><MessageCircle size={18} />Contacter la boutique</a>
        </div>
      </section>

      <AnimatePresence>{mobileFilters && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileFilters(false)}><motion.div initial={{ y: 70 }} animate={{ y: 0 }} exit={{ y: 70 }} transition={{ duration: 0.25 }} onClick={event => event.stopPropagation()} className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-white p-6 text-usm-blue-dark"><div className="mb-6 flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#0D63FF]">Catalogue</p><h2 className="mt-1 font-display text-3xl font-black uppercase">Filtrer</h2></div><button aria-label="Fermer les filtres" onClick={() => setMobileFilters(false)} className="grid size-12 place-items-center rounded-full border border-[#DDE8F8] bg-[#F5F7FA]"><X size={18} /></button></div>{filterFields}<button onClick={() => setMobileFilters(false)} className="mt-7 min-h-14 w-full rounded-full bg-white text-sm font-black text-usm-blue-dark">Afficher {filtered.length} produit{filtered.length === 1 ? '' : 's'}</button></motion.div></motion.div>}</AnimatePresence>
    </main>
  );
};
