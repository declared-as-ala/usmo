'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { Logo } from './Logo';
import { Search, X, ShoppingCart, Trash2, Plus, Minus, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { tr } from '../../utils/i18n';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../../lib/api-client';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeScreen,
    setActiveScreen,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    t,
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    language,
    toast,
    hideToast,
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();
  const [appLoading, setAppLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; label: string; labelAr: string; href: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const handle = setTimeout(() => {
      api.search(searchQuery.trim())
        .then((data) => setSearchResults(data || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [isSearchOpen, searchQuery]);

  // Sync route path changes with AppContext active screen
  useEffect(() => {
    const route = pathname === '/' ? 'home' : pathname.substring(1).split('/')[0];
    const screen = route === 'actualites' ? 'news' : route;
    setActiveScreen(screen as any);
  }, [pathname, setActiveScreen]);

  // Simulate loader dismissal on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchResultClick = (result: { type: string; id: string; href?: string }) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (result.href) router.push(result.href);
    else if (result.type === 'news') router.push('/actualites');
  };

  return (
    <>
      {/* Official Startup Preloader Overlay */}
      {appLoading && (
        <div id="usm-loader">
          <div className="loader-glow" />
          <div className="loader-wrapper">
            <div className="loader-ring" />
            <img
              className="loader-logo"
              src="/logo.webp"
              alt="Union Sportive Monastirienne"
            />
          </div>
          <div className="loader-ar font-arabic text-3xl font-black text-white mt-8">الإتحاد الرياضي المنستيري</div>
          <div className="loader-fr font-display font-black text-sm tracking-[6px] text-white mt-2">UNION SPORTIVE MONASTIRIENNE</div>
          <div className="loader-desc text-[11px] font-sans tracking-widest text-white/65 mt-4">Building the Future • Honoring the Legacy</div>
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <a
            href="https://ibrandtunisia.tn/"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-medium tracking-widest text-white/35 hover:text-white/60 transition-colors"
          >
            Powered by iBrand Tunisia
          </a>
        </div>
      )}

      <div className="usm-premium-bg flex min-h-screen flex-col relative pb-24 lg:pb-0 text-usm-blue-dark">
        {/* Navigation Header */}
        <Header />

        {/* Dynamic page viewport rendering */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Brand Footer */}
        <Footer />

        {/* Mobile bottom navigations */}
        <MobileNav />

        {/* Global Search Overlay Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] bg-usm-blue-dark/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-usm-blue-soft border border-usm-border rounded-2xl shadow-2xl p-6 overflow-hidden">
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-usm-blue-primary rounded-full hover:bg-usm-blue-soft cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-display font-extrabold text-usm-blue-primary uppercase tracking-wider mb-4 border-b border-usm-border pb-2">
                USM Global Search
              </h3>

              <div className="relative flex items-center mb-6">
                <Search className="absolute left-4 text-usm-blue-primary" size={20} />
                <input
                  type="text"
                  autoFocus
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-usm-border focus:border-usm-blue-primary text-usm-blue-dark pl-12 pr-4 py-3 rounded-xl outline-none text-sm transition-all rtl:pl-4 rtl:pr-12"
                />
              </div>

              {/* Results listing */}
              {searchQuery && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold mb-2">
                    {searchLoading ? 'Recherche…' : `Search Results (${searchResults.length})`}
                  </p>
                  {searchResults.length > 0 ? (
                    searchResults.map((res, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchResultClick(res)}
                        className="w-full text-left rtl:text-right p-3 rounded-lg bg-usm-blue-soft hover:bg-usm-blue-primary/25 border border-usm-border flex justify-between items-center text-xs font-medium cursor-pointer transition-colors"
                      >
                        <span className="text-usm-blue-dark">{res.label}</span>
                        <span className="text-[10px] text-usm-blue-primary uppercase bg-usm-blue-primary/20 px-2 py-0.5 rounded">
                          {res.type}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">No matching entities found for this query.</p>
                  )}
                </div>
              )}
              {!searchQuery && (
                <div className="py-6 text-center text-xs text-slate-500">
                  Type above to query players, club news, or matches.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SHOPPING BAG SLIDE-OVER — right on desktop, bottom sheet on mobile */}
        {isCartOpen && (
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[90] transition-opacity duration-300"
          />
        )}
        <div
          className={`fixed z-[95] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
            inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-usm-blue-primary/15 p-6
            sm:right-0 sm:top-0 sm:bottom-0 sm:left-auto sm:inset-x-auto sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-t-0 sm:border-l sm:border-usm-blue-primary/15
            ${isCartOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}`}
        >
          <div className="flex flex-col h-full min-h-0 justify-between">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-usm-border pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-usm-blue-primary" size={20} />
                <h3 className="font-display font-black text-lg text-usm-blue-dark uppercase tracking-wider">
                  {tr(language, 'Supporter Bag', 'Sac Supporter', 'حقيبة المشجع')}
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-500 hover:text-usm-blue-primary rounded-full hover:bg-usm-blue-soft cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 min-h-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="h-20 w-20 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/20 flex items-center justify-center mb-4">
                    <ShoppingCart size={28} className="text-usm-blue-primary/70" />
                  </div>
                  <p className="text-sm font-bold text-usm-blue-dark">
                    {tr(language, 'Your supporter bag is waiting for its colors.', 'Votre sac supporter attend ses couleurs.', 'حقيبتك بانتظار ألوانها')}
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push('/boutique');
                    }}
                    className="mt-5 px-5 py-2.5 bg-usm-blue-primary text-white text-[11px] font-black uppercase tracking-wide rounded-full hover:bg-usm-blue-hover transition-colors cursor-pointer"
                  >
                    {tr(language, 'Explore the Collection', 'Découvrir la Collection', 'اكتشف المجموعة')}
                  </button>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-usm-blue-soft p-3 rounded-xl border border-usm-border">
                    <img src={item.product.image} className="w-12 h-12 object-cover rounded-lg border border-usm-border shrink-0" alt="" />
                    <div className="flex-1 min-w-0 mx-3">
                      <p className="font-bold truncate text-[12px] text-usm-blue-dark">
                        {tr(language, item.product.name, item.product.nameFr, item.product.nameAr)}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{item.size} • {item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-1 bg-usm-blue-soft hover:bg-usm-blue-soft rounded text-usm-blue-dark cursor-pointer"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="font-mono text-[11px] w-4 text-center text-usm-blue-dark">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-1 bg-usm-blue-soft hover:bg-usm-blue-soft rounded text-usm-blue-dark cursor-pointer"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="p-1 text-red-400 hover:text-red-500 rounded cursor-pointer ml-1 rtl:mr-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Redirect */}
            {cart.length > 0 && (
              <div className="border-t border-usm-border pt-4 mt-4 space-y-3 shrink-0">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {tr(
                    language,
                    'You are ready to reserve your official USM items.',
                    'Vous êtes prêt à réserver vos articles officiels USM.',
                    'أنت جاهز لحجز قطعك الرسمية من الاتحاد.'
                  )}
                </p>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-600">{tr(language, 'Total:', 'Total :', 'المجموع:')}</span>
                  <span className="text-usm-blue-primary text-lg font-mono">
                    {cart.reduce((sum, item) => {
                      const priceNum = parseFloat(item.product.price.replace(/[^\d.]/g, '')) || 0;
                      return sum + (priceNum * item.quantity);
                    }, 0)} TND
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/checkout');
                  }}
                  className="w-full py-3 bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-xs font-black uppercase rounded-xl text-center cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{tr(language, 'Continue Order', 'Continuer la Commande', 'متابعة الطلب')}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  {tr(
                    language,
                    'No online payment required. The official store will confirm your order.',
                    'Aucun paiement en ligne requis. La boutique officielle confirmera votre commande.',
                    'بدون دفع إلكتروني — سيقوم المتجر الرسمي بتأكيد طلبك.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PREMIUM TOAST NOTIFICATION — top-center, clear of the side/bottom cart drawer */}
        <div className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-[130] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
          <AnimatePresence>
            {toast.visible && (
              <motion.div
                key={toast.message}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="pointer-events-auto relative overflow-hidden bg-white/95 border border-usm-blue-primary/30 text-usm-blue-dark rounded-2xl shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3 p-4">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border ${
                      toast.type === 'error'
                        ? 'bg-red-500/15 border-red-500/30'
                        : toast.type === 'info'
                        ? 'bg-usm-blue-primary/15 border-usm-blue-primary/30'
                        : 'bg-emerald-500/15 border-emerald-500/30'
                    }`}
                  >
                    {toast.type === 'error' ? (
                      <AlertTriangle className="text-red-400" size={17} />
                    ) : toast.type === 'info' ? (
                      <Info className="text-usm-blue-light" size={17} />
                    ) : (
                      <CheckCircle2 className="text-emerald-400" size={17} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-usm-blue-primary tracking-wider">USM Boutique</p>
                    <p className="text-[12px] text-slate-700 mt-0.5 leading-snug">{toast.message}</p>
                  </div>
                  <button
                    onClick={hideToast}
                    className="shrink-0 p-1 text-slate-500 hover:text-usm-blue-primary rounded-full hover:bg-usm-blue-soft cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="h-[3px] w-full bg-usm-blue-soft">
                  <div
                    key={toast.message}
                    className={`h-full animate-toast-progress ${
                      toast.type === 'error' ? 'bg-red-400' : toast.type === 'info' ? 'bg-usm-blue-primary' : 'bg-emerald-400'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
