'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { Logo } from './Logo';
import { Search, Globe, User, Menu, X, ShoppingBag, ChevronDown, Bell, Zap, Award, CreditCard, LifeBuoy, Crown, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api-client';

const LANGUAGES: { code: 'en' | 'fr' | 'ar'; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'fr', label: 'Français', native: 'FR' },
  { code: 'ar', label: 'العربية', native: 'AR' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    language,
    setLanguage,
    activeScreen,
    setActiveScreen,
    setIsSearchOpen,
    t,
    userRole,
    isLoggedIn,
    username,
    fan,
    logout,
    cart,
    isCartOpen,
    setIsCartOpen,
  } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mainSponsors, setMainSponsors] = useState<{ name: string; lightLogo?: string; logo?: string; link?: string; websiteUrl?: string; _id?: string }[]>([]);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    api.getUnreadNotificationCount().then((count: number) => setUnreadCount(count || 0)).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    api.getSponsors({ homepage: true })
      .then((data: any[]) => {
        const mains = data.filter((s: any) => s.category === 'Main');
        setMainSponsors(mains);
      })
      .catch(() => {});
  }, []);

  const isPremiumMember = !!fan?.membershipSummary?.active;
  const initials = (username || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');
  const cartCount = (cart || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  type NavEntry =
    | { kind: 'link'; screen: typeof activeScreen; labelKey: string }
    | { kind: 'dropdown'; key: string; label: string; items: { screen: typeof activeScreen; labelKey: string; icon?: string }[] };

  const navGroups: NavEntry[] = [
    { kind: 'link', screen: 'home', labelKey: 'nav.home' },
    { kind: 'link', screen: 'boutique', labelKey: 'nav.boutique' },
    {
      kind: 'dropdown',
      key: 'teams',
      label: tr(language, 'Teams', 'Équipes', 'الفرق'),
      items: [
        { screen: 'football', labelKey: 'nav.football', icon: '/logo foot.png' },
        { screen: 'basketball', labelKey: 'nav.basketball', icon: '/logo basket.png' },
      ],
    },
    {
      kind: 'dropdown',
      key: 'club',
      label: tr(language, 'The Club', 'Le Club', 'النادي'),
      items: [
        { screen: 'histoire', labelKey: 'nav.history' },
        { screen: 'palmares', labelKey: 'nav.palmares' },
        { screen: 'legendes', labelKey: 'nav.legendes' },
        { screen: 'stadium', labelKey: 'nav.stadium' },
        { screen: 'contact', labelKey: 'nav.contact' },
      ],
    },
    { kind: 'link', screen: 'matches', labelKey: 'nav.matches' },
    { kind: 'link', screen: 'media', labelKey: 'nav.media' },
    { kind: 'link', screen: 'sponsors', labelKey: 'nav.partners' },
  ];

  const handleNavClick = (screen: typeof activeScreen) => {
    setActiveScreen(screen);
    setMobileMenuOpen(false);
    setMobileGroupOpen(null);
    setDropdownOpen(null);
  };

  const isDropdownActive = (items: { screen: typeof activeScreen }[]) =>
    items.some((i) => i.screen === activeScreen);

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-white">
      <div
        className={`relative bg-usm-blue-dark border-b border-usm-teal-accent/20 transition-shadow duration-500 ${
          scrolled ? 'shadow-[0_8px_30px_rgba(13,99,255,0.16)]' : 'shadow-[0_8px_30px_rgba(13,99,255,0.08)]'
        }`}
      >
        <div className="relative w-full px-2.5 xs:px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo lockup — crest medallion + two-line wordmark visible on all devices */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-3.5 md:gap-4 shrink min-w-0 cursor-pointer group"
              aria-label="US Monastir — Home"
            >
              <span className="relative flex h-[34px] w-[34px] xs:h-[38px] xs:w-[38px] sm:h-[48px] sm:w-[48px] md:h-[52px] md:w-[52px] items-center justify-center shrink-0">
                {/* soft blue aura, revealed on hover */}
                <span className="absolute -inset-1.5 rounded-full bg-[radial-gradient(circle,rgba(13,99,255,0.28),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {/* medallion ring framing the crest */}
                <span className="absolute inset-0 rounded-full ring-1 ring-white/12 group-hover:ring-usm-teal-accent/60 shadow-[0_0_0_3px_rgba(255,255,255,0.03)] transition-all duration-500" />
                <Logo
                  size={34}
                  variant="color"
                  className="relative rounded-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>
              <span className="hidden sm:block w-px self-stretch my-2 bg-gradient-to-b from-transparent via-usm-teal-accent/40 to-transparent shrink-0" />
              <div className="flex flex-col leading-none select-none text-left rtl:text-right min-w-0">
                <span className="font-display text-[11px] xs:text-[13px] sm:text-[14px] md:text-[15px] font-black tracking-[0.05em] xs:tracking-[0.10em] sm:tracking-[0.20em] text-white uppercase whitespace-nowrap">
                  US&nbsp;Monastir
                </span>
                <span className="mt-[2px] mb-[2px] sm:mt-[6px] sm:mb-[5px] h-px w-full bg-gradient-to-r rtl:bg-gradient-to-l from-usm-teal-accent/70 via-usm-teal-accent/25 to-transparent" />
                <span className="flex items-baseline gap-1 sm:gap-2 whitespace-nowrap min-w-0">
                  <span
                    className={`text-[6.5px] xs:text-[7.5px] sm:text-[8px] uppercase font-bold text-usm-teal-accent tracking-[0.02em] xs:tracking-[0.08em] sm:tracking-[0.18em] truncate max-w-[75px] xs:max-w-[120px] sm:max-w-none ${
                      language === 'ar' ? 'font-arabic text-[8px] xs:text-[9px]' : ''
                    }`}
                  >
                    {language === 'ar' ? 'الاتحاد الرياضي المنستيري' : 'Union Sportive Monastirienne'}
                  </span>
                  <span className="font-serif italic text-[8px] sm:text-xs text-white/50 shrink-0">1923</span>
                </span>
              </div>
            </button>

            {/* Desktop navigation — clean spacing, animated blue underline, dropdown groups */}
            <nav ref={dropdownRef} className="hidden lg:flex flex-1 items-center justify-center gap-1 px-4">
              {navGroups.map((entry) => {
                if (entry.kind === 'link') {
                  const isActive = activeScreen === entry.screen;
                  return (
                    <button
                      key={entry.screen}
                      onClick={() => handleNavClick(entry.screen)}
                      className="relative px-3.5 py-2 group cursor-pointer"
                    >
                      <span
                        className={`text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-300 ${
                          isActive ? 'text-usm-teal-accent' : 'text-white/70 group-hover:text-white'
                        }`}
                      >
                        {t(entry.labelKey)}
                      </span>
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active-underline"
                          className="absolute left-3 right-3 -bottom-0.5 h-[1.5px] bg-gradient-to-r from-transparent via-usm-teal-accent to-transparent"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      ) : (
                        <span className="nav-underline" />
                      )}
                    </button>
                  );
                }

                const isOpen = dropdownOpen === entry.key;
                const isActive = isDropdownActive(entry.items);
                return (
                  <div key={entry.key} className="relative">
                    <button
                      onClick={() => setDropdownOpen(isOpen ? null : entry.key)}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      className="relative flex items-center gap-1 px-3.5 py-2 group cursor-pointer"
                    >
                      <span
                        className={`text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors duration-300 ${
                          isActive || isOpen ? 'text-usm-teal-accent' : 'text-white/70 group-hover:text-white'
                        }`}
                      >
                        {entry.label}
                      </span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-usm-teal-accent' : 'text-white/50 group-hover:text-white'}`}
                      />
                      {isActive && !isOpen && <span className="nav-underline" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          role="menu"
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-1/2 -translate-x-1/2 rtl:translate-x-1/2 mt-2 w-52 bg-[#050d1e] border border-usm-teal-accent/25 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          {entry.items.map((item) => (
                            <button
                              key={item.screen}
                              role="menuitem"
                              onClick={() => handleNavClick(item.screen)}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors text-left rtl:text-right ${
                                activeScreen === item.screen
                                  ? 'text-usm-teal-accent bg-usm-teal-accent/10'
                                  : 'text-white/80 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {item.icon && (
                                <img src={item.icon} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                              )}
                              {t(item.labelKey)}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Main Partners — loaded from DB (desktop/tablet only) */}
            {mainSponsors.length > 0 && (
              <div className="hidden md:flex items-center gap-2 lg:gap-3 pl-3 lg:pl-5 border-l border-white/10 shrink-0">
                {mainSponsors.map((sponsor, i) => {
                  const logoUrl = sponsor.logo || sponsor.lightLogo;
                  return (
                    <React.Fragment key={sponsor._id || i}>
                      {i > 0 && <span className="w-px h-5 bg-white/10" />}
                      <a
                        href={sponsor.websiteUrl || sponsor.link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm hover:opacity-90 hover:scale-105 transition-all"
                        title={sponsor.name}
                      >
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt={sponsor.name}
                            className="h-5 max-w-[80px] object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-name')) {
                                const span = document.createElement('span');
                                span.className = 'fallback-name text-[11px] font-black tracking-wide text-slate-800';
                                span.innerText = sponsor.name;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-[11px] font-black tracking-wide text-slate-800">
                            {sponsor.name}
                          </span>
                        )}
                      </a>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0 ml-auto sm:ml-4">
              {/* Utility cluster — search, cart & notifications */}
              <div className="flex items-center h-8 sm:h-9 rounded-full border border-white/12 bg-white/[0.03] overflow-hidden shrink-0">
                {/* Search */}
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsCartOpen(false);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-white/75 hover:text-usm-blue-primary hover:bg-white/[0.06] transition-colors duration-300 cursor-pointer"
                  title={tr(language, 'Search', 'Recherche', 'بحث')}
                >
                  <Search size={14} className="sm:w-[15px] sm:h-[15px]" />
                </button>

                {/* Cart / Panier */}
                <span className="w-px h-3.5 sm:h-4 bg-white/10" />
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsSearchOpen(false);
                  }}
                  className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-white/75 hover:text-usm-blue-primary hover:bg-white/[0.06] transition-colors duration-300 cursor-pointer"
                  title={tr(language, 'Shopping Cart', 'Panier', 'سلة التسوق')}
                >
                  <ShoppingBag size={14} className="sm:w-[15px] sm:h-[15px]" />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 end-0.5 sm:top-1 sm:end-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0D63FF] text-[7px] font-black text-white ring-2 ring-[#040b1c]">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Supporter profile (authenticated) or Connexion / S'inscrire buttons (guests) */}
              {isLoggedIn ? (
                <div className="relative shrink-0" ref={profileRef}>
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setLangOpen(false);
                    }}
                    className="flex items-center justify-center sm:gap-2 h-8 w-8 sm:h-9 sm:w-auto sm:pl-1.5 sm:pr-3 rounded-full bg-white/[0.06] border border-white/15 hover:border-usm-blue-primary hover:bg-white/[0.1] transition-all cursor-pointer shrink-0"
                    title={username || 'Mon Compte'}
                  >
                    <span className="relative h-6 w-6 rounded-full bg-usm-blue-primary/20 border border-usm-blue-primary/50 flex items-center justify-center overflow-hidden shrink-0">
                      {fan?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fan.avatar} alt={username} className="h-full w-full object-cover" />
                      ) : initials ? (
                        <span className="text-[9px] font-black text-usm-teal-accent">{initials}</span>
                      ) : (
                        <User size={13} className="text-white/80" />
                      )}
                    </span>
                    <span className="hidden sm:inline text-[11px] font-semibold text-white tracking-wide max-w-[110px] truncate">
                      {username || 'Mon Compte'}
                    </span>
                    <ChevronDown size={12} className={`hidden sm:inline-block text-white/60 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-usm-blue-primary' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute right-0 rtl:left-0 rtl:right-auto mt-3 w-64 bg-white border border-usm-border rounded-2xl shadow-2xl p-4 z-50 text-usm-blue-dark"
                      >
                        <a
                          href="/compte"
                          onClick={(e) => {
                            e.preventDefault();
                            setProfileOpen(false);
                            window.location.href = '/compte';
                          }}
                          className="flex items-center gap-3 border-b border-usm-border pb-3 mb-3 hover:opacity-85 transition-opacity cursor-pointer block text-left rtl:text-right"
                        >
                          <div className="relative h-11 w-11 rounded-2xl bg-usm-blue-soft flex items-center justify-center border border-usm-border overflow-hidden shrink-0 shadow-sm">
                            {fan?.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={fan.avatar} alt={username} className="h-full w-full object-cover" />
                            ) : initials ? (
                              <span className="text-sm font-black text-usm-blue-primary">{initials}</span>
                            ) : (
                              <User size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-usm-blue-dark truncate uppercase tracking-tight">{username || fan?.name || 'Supporter USM'}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{fan?.email || ''}</p>
                            <span className="inline-block text-[9px] font-bold text-usm-blue-primary uppercase tracking-wider mt-0.5">
                              {tr(language, 'View Profile →', 'Voir mon profil →', 'عرض الحساب ←')}
                            </span>
                          </div>
                        </a>

                        <div className="space-y-1.5 mb-3">
                          {userRole === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="w-full block py-2 px-3 border border-usm-danger/40 text-usm-danger text-[11px] font-bold uppercase tracking-wider text-left rtl:text-right rounded-xl hover:bg-usm-danger/10 transition-all cursor-pointer"
                            >
                              {tr(language, 'Admin Panel', 'Panneau Admin', 'لوحة التحكم')}
                            </Link>
                          )}
                          <a
                            href="/compte"
                            onClick={(e) => {
                              e.preventDefault();
                              setProfileOpen(false);
                              window.location.href = '/compte';
                            }}
                            className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-usm-blue-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-usm-blue-primary/95 transition-all cursor-pointer shadow-md shadow-usm-blue-primary/25 text-left rtl:text-right"
                          >
                            <span className="flex items-center gap-2">
                              <User size={14} />
                              <span>{tr(language, 'My Profile', 'Mon profil', 'ملفي الشخصي')}</span>
                            </span>
                            <span className="text-[11px] font-black opacity-80">→</span>
                          </a>
                        </div>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="w-full py-2 px-3 bg-slate-100 hover:bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer"
                        >
                          {tr(language, 'Sign Out', 'Se déconnecter', 'تسجيل الخروج')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => router.push('/connexion')}
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3.5 rounded-full bg-white/[0.06] border border-white/15 hover:border-usm-blue-primary hover:text-usm-blue-primary text-white flex items-center justify-center sm:gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    title={tr(language, 'Sign In', 'CONNEXION', 'تسجيل الدخول')}
                  >
                    <User size={13} />
                    <span className="hidden sm:inline">{tr(language, 'Sign In', 'CONNEXION', 'تسجيل الدخول')}</span>
                  </button>
                  <button
                    onClick={() => router.push('/inscription')}
                    className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-full bg-usm-blue-primary hover:bg-[#0052D9] text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-usm-blue-primary/25 transition-all cursor-pointer shrink-0"
                  >
                    <span>{tr(language, 'Sign Up', "S'INSCRIRE", 'إنشاء حساب')}</span>
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-white/12 bg-white/[0.03] flex items-center justify-center text-white cursor-pointer shrink-0"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-[#071328] border-t border-usm-teal-accent/20 shadow-2xl text-white"
          >
            <div className="px-4 py-3 flex flex-col divide-y divide-white/5">
              {navGroups.map((entry, idx) => {
                if (entry.kind === 'link') {
                  const isActive = activeScreen === entry.screen;
                  return (
                    <motion.button
                      key={entry.screen}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      onClick={() => handleNavClick(entry.screen)}
                      className={`flex items-center gap-3 w-full text-left rtl:text-right px-3 min-h-[46px] cursor-pointer transition-colors ${
                        isActive
                          ? 'text-usm-teal-accent font-bold bg-white/[0.04] rounded-xl'
                          : 'text-white/80 hover:text-usm-teal-accent hover:bg-white/[0.02] rounded-xl'
                      }`}
                    >
                      <span className="text-xs font-bold tracking-wider uppercase">
                        {t(entry.labelKey)}
                      </span>
                    </motion.button>
                  );
                }

                const isGroupOpen = mobileGroupOpen === entry.key;
                const isGroupActive = isDropdownActive(entry.items);
                return (
                  <div key={entry.key} className="py-0.5">
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      onClick={() => setMobileGroupOpen(isGroupOpen ? null : entry.key)}
                      aria-expanded={isGroupOpen}
                      className={`flex items-center justify-between gap-3 w-full text-left rtl:text-right px-3 min-h-[46px] cursor-pointer transition-colors ${
                        isGroupActive || isGroupOpen
                          ? 'text-usm-teal-accent font-bold bg-white/[0.04] rounded-xl'
                          : 'text-white/80 hover:text-usm-teal-accent hover:bg-white/[0.02] rounded-xl'
                      }`}
                    >
                      <span className="text-xs font-bold tracking-wider uppercase">{entry.label}</span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-300 ${isGroupOpen ? 'rotate-180 text-usm-teal-accent' : 'text-white/40'}`}
                      />
                    </motion.button>
                    <AnimatePresence>
                      {isGroupOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pb-2 ps-4 space-y-1"
                        >
                          {entry.items.map((item) => {
                            const isSubActive = activeScreen === item.screen;
                            return (
                              <button
                                key={item.screen}
                                onClick={() => handleNavClick(item.screen)}
                                className={`flex w-full items-center gap-2.5 text-left rtl:text-right px-3 min-h-[42px] text-xs font-medium tracking-wide rounded-lg cursor-pointer transition-colors ${
                                  isSubActive
                                    ? 'text-usm-teal-accent bg-usm-teal-accent/15 font-bold'
                                    : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
                                }`}
                              >
                                {item.icon && (
                                  <img src={item.icon} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                                )}
                                <span>{t(item.labelKey)}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Mobile Cart Action */}
            <div className="px-4 py-2 border-t border-white/10 bg-[#050e1f]/40">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-usm-blue-primary/50 text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-usm-blue-primary/20 flex items-center justify-center text-usm-blue-primary">
                    <ShoppingBag size={14} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {tr(language, 'My Shopping Bag', 'Mon Panier', 'حقيبة التسوق')}
                  </span>
                </div>
                {cartCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0D63FF] text-white text-[10px] font-black shadow-sm">
                    {cartCount} {cartCount === 1 ? tr(language, 'item', 'article', 'منتج') : tr(language, 'items', 'articles', 'منتجات')}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {tr(language, 'Empty', 'Vide', 'فارغ')}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Official Partners */}
            {mainSponsors.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10 bg-[#050e1f]/50">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block mb-2">
                  {tr(language, 'Official Partners', 'Partenaires Officiels', 'الشركاء الرسميون')}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {mainSponsors.map((sponsor, i) => {
                    const logoUrl = sponsor.logo || sponsor.lightLogo;
                    return (
                      <a
                        key={sponsor._id || i}
                        href={sponsor.websiteUrl || sponsor.link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm"
                        title={sponsor.name}
                      >
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt={sponsor.name}
                            className="h-5 max-w-[80px] object-contain"
                          />
                        ) : (
                          <span className="text-[11px] font-black tracking-wide text-slate-800">
                            {sponsor.name}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Auth Actions */}
            <div className="p-4 border-t border-white/10 bg-[#050e1f]/80">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.04] rounded-xl border border-white/10">
                    <div className="h-9 w-9 rounded-full bg-usm-blue-primary/20 border border-usm-blue-primary/40 flex items-center justify-center text-usm-blue-primary font-bold text-xs shrink-0 overflow-hidden">
                      {fan?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fan.avatar} alt={username} className="h-full w-full object-cover" />
                      ) : initials ? (
                        initials
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{username || fan?.name || 'Utilisateur'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{fan?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/compte'); }}
                      className="py-2 text-[10px] font-bold uppercase tracking-wider text-center text-white bg-white/[0.06] hover:bg-usm-blue-primary rounded-lg transition-colors"
                    >
                      {tr(language, 'Profile', 'Profil', 'الملف')}
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/compte/profil'); }}
                      className="py-2 text-[10px] font-bold uppercase tracking-wider text-center text-white bg-white/[0.06] hover:bg-usm-blue-primary rounded-lg transition-colors"
                    >
                      {tr(language, 'Settings', 'Paramètres', 'الإعدادات')}
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/compte/securite'); }}
                      className="py-2 text-[10px] font-bold uppercase tracking-wider text-center text-white bg-white/[0.06] hover:bg-usm-blue-primary rounded-lg transition-colors"
                    >
                      {tr(language, 'Security', 'Sécurité', 'الأمان')}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  >
                    {tr(language, 'Sign Out', 'Déconnexion', 'تسجيل الخروج')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push('/connexion'); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/25 text-white font-bold text-xs uppercase tracking-wider hover:border-usm-blue-primary hover:text-usm-blue-primary transition-all"
                  >
                    <User size={14} />
                    <span>{tr(language, 'Sign In', 'Connexion', 'تسجيل الدخول')}</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push('/inscription'); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-usm-blue-primary hover:bg-[#0052D9] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    <span>{tr(language, 'Sign Up', "S'inscrire", 'إنشاء حساب')}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
