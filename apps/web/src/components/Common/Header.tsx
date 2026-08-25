'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { Logo } from './Logo';
import { Search, Globe, User, Menu, X, ShoppingBag, ChevronDown, Bell, Zap, Award, CreditCard, LifeBuoy, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

  const isPremiumMember = !!fan?.membershipSummary?.active;
  const initials = (username || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');

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
    {
      kind: 'dropdown',
      key: 'teams',
      label: tr(language, 'Teams', 'Équipes', 'الفرق'),
      items: [
        { screen: 'football', labelKey: 'nav.football', icon: '/logo foot.png' },
        { screen: 'basketball', labelKey: 'nav.basketball', icon: '/logo basket.png' },
      ],
    },
    { kind: 'link', screen: 'matches', labelKey: 'nav.matches' },
    { kind: 'link', screen: 'news', labelKey: 'nav.news' },
    { kind: 'link', screen: 'media', labelKey: 'nav.media' },
    { kind: 'link', screen: 'boutique', labelKey: 'nav.boutique' },
    {
      kind: 'dropdown',
      key: 'club',
      label: tr(language, 'The Club', 'Le Club', 'النادي'),
      items: [
        { screen: 'histoire', labelKey: 'nav.history' },
        { screen: 'palmares', labelKey: 'nav.palmares' },
        { screen: 'legendes', labelKey: 'nav.legendes' },
        { screen: 'stadium', labelKey: 'nav.stadium' },
        { screen: 'telechargements', labelKey: 'nav.downloads' },
        { screen: 'contact', labelKey: 'nav.contact' },
      ],
    },
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
        <div className="relative w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo lockup — crest medallion + two-line wordmark visible on all devices */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3.5 md:gap-4 shrink-0 cursor-pointer group"
              aria-label="US Monastir — Home"
            >
              <span className="relative flex h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] md:h-[52px] md:w-[52px] items-center justify-center shrink-0">
                {/* soft blue aura, revealed on hover */}
                <span className="absolute -inset-1.5 rounded-full bg-[radial-gradient(circle,rgba(13,99,255,0.28),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {/* medallion ring framing the crest */}
                <span className="absolute inset-0 rounded-full ring-1 ring-white/12 group-hover:ring-usm-teal-accent/60 shadow-[0_0_0_3px_rgba(255,255,255,0.03)] transition-all duration-500" />
                <Logo
                  size={42}
                  variant="color"
                  className="relative rounded-full transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>
              <span className="hidden sm:block w-px self-stretch my-2 bg-gradient-to-b from-transparent via-usm-teal-accent/40 to-transparent shrink-0" />
              <div className="flex flex-col leading-none select-none text-left rtl:text-right min-w-0">
                <span className="font-display text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] font-black tracking-[0.14em] sm:tracking-[0.20em] text-white uppercase whitespace-nowrap">
                  US&nbsp;Monastir
                </span>
                <span className="mt-[4px] mb-[3px] sm:mt-[6px] sm:mb-[5px] h-px w-full bg-gradient-to-r rtl:bg-gradient-to-l from-usm-teal-accent/70 via-usm-teal-accent/25 to-transparent" />
                <span className="flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span
                    className={`text-[7px] xs:text-[7.5px] sm:text-[8px] uppercase font-bold text-usm-teal-accent tracking-[0.08em] sm:tracking-[0.18em] truncate max-w-[130px] xs:max-w-[160px] sm:max-w-none ${
                      language === 'ar' ? 'font-arabic text-[9px]' : ''
                    }`}
                  >
                    {language === 'ar' ? 'الاتحاد الرياضي المنستيري' : 'Union Sportive Monastirienne'}
                  </span>
                  <span className="font-serif italic text-[10px] sm:text-xs text-white/50 shrink-0">1923</span>
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

            {/* Actions */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {/* Utility cluster — search & notifications */}
              <div className="flex items-center h-9 rounded-full border border-white/12 bg-white/[0.03] overflow-hidden">
                {/* Search */}
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsCartOpen(false);
                  }}
                  className="h-9 w-9 flex items-center justify-center text-white/75 hover:text-usm-teal-accent hover:bg-white/[0.06] transition-colors duration-300 cursor-pointer"
                  title="Search"
                >
                  <Search size={15} />
                </button>

                {/* Notifications — logged-in fans only */}
                {isLoggedIn && (
                  <>
                    <span className="w-px h-4 bg-white/10" />
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/compte/notifications');
                      }}
                      className="relative h-9 w-9 flex items-center justify-center text-white/75 hover:text-usm-teal-accent hover:bg-white/[0.06] transition-colors duration-300 cursor-pointer"
                      title="Notifications"
                    >
                      <Bell size={15} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0.5 end-0.5 hidden sm:flex h-3.5 w-3.5 items-center justify-center rounded-full bg-usm-teal-accent text-[7px] font-black text-usm-blue-dark ring-2 ring-[#040b1c]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Supporter profile — shown once authenticated */}
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setLangOpen(false);
                    }}
                    className="flex items-center gap-2 pl-1.5 pr-3.5 h-9 rounded-full bg-usm-teal-accent/10 border border-usm-teal-accent/30 hover:border-usm-teal-accent/60 transition-all cursor-pointer"
                  >
                    <span className="relative h-6 w-6 rounded-full bg-usm-teal-accent/20 border border-usm-teal-accent/50 flex items-center justify-center overflow-hidden">
                      {fan?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fan.avatar} alt={username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-black text-usm-teal-accent">{initials}</span>
                      )}
                    </span>
                    <span className="hidden sm:inline text-[11px] font-semibold text-white tracking-wide max-w-[110px] truncate">
                      {username}
                    </span>
                    {isPremiumMember && <Crown size={11} className="text-usm-accent-gold hidden sm:inline" />}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 rtl:left-0 rtl:right-auto mt-3 w-64 bg-white border border-usm-teal-accent/25 rounded-2xl shadow-2xl p-4 z-50"
                      >
                        <div className="flex items-center gap-3 border-b border-usm-border pb-3 mb-3">
                          <div className="relative h-10 w-10 rounded-full bg-usm-teal-accent/15 flex items-center justify-center border border-usm-teal-accent/50 overflow-hidden shrink-0">
                            {fan?.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={fan.avatar} alt={username} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-usm-teal-accent">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-usm-blue-dark truncate">{username}</h4>
                            {isPremiumMember ? (
                              <p className="text-[9px] text-usm-accent-gold font-bold tracking-[0.1em] mt-0.5 flex items-center gap-1">
                                <Crown size={10} /> {tr(language, 'PREMIUM MEMBER', 'MEMBRE PREMIUM', 'عضو مميز')}
                              </p>
                            ) : (
                              <p className="text-[9px] text-usm-teal-accent/80 uppercase font-bold tracking-[0.15em] mt-0.5">
                                {userRole}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {userRole === 'admin' && (
                            <button
                              onClick={() => {
                                setProfileOpen(false);
                                handleNavClick('admin');
                              }}
                              className="col-span-2 py-2.5 border border-usm-danger/40 text-usm-danger text-[11px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-danger/10 transition-all cursor-pointer"
                            >
                              {tr(language, 'Open Control Panel', 'Ouvrir le Panneau Admin', 'فتح لوحة التحكم')}
                            </button>
                          )}
                          <button
                            onClick={() => { setProfileOpen(false); router.push('/compte'); }}
                            className="col-span-2 py-2.5 bg-usm-blue-soft text-usm-blue-dark text-[11px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-teal-accent/15 hover:text-usm-teal-accent transition-all cursor-pointer"
                          >
                            {tr(language, 'My Account', 'Mon compte', 'حسابي')}
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); handleNavClick('fanzone'); }}
                            className="py-2 bg-usm-blue-soft text-usm-blue-dark text-[10px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-teal-accent/15 hover:text-usm-teal-accent transition-all cursor-pointer"
                          >
                            {tr(language, 'Fan Zone', 'Fan Zone', 'منطقة الأحباء')}
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); router.push('/abonnement'); }}
                            className="py-2 bg-usm-blue-soft text-usm-blue-dark text-[10px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-teal-accent/15 hover:text-usm-teal-accent transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CreditCard size={11} /> {tr(language, 'Membership', 'Abonnement', 'الاشتراك')}
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); router.push('/compte/points'); }}
                            className="py-2 bg-usm-blue-soft text-usm-blue-dark text-[10px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-teal-accent/15 hover:text-usm-teal-accent transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Zap size={11} /> {tr(language, 'Points', 'Points', 'النقاط')}
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); router.push('/compte/badges'); }}
                            className="py-2 bg-usm-blue-soft text-usm-blue-dark text-[10px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-teal-accent/15 hover:text-usm-teal-accent transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Award size={11} /> {tr(language, 'Badges', 'Badges', 'الأوسمة')}
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); router.push('/compte/support'); }}
                            className="py-2 bg-usm-blue-soft text-usm-blue-dark text-[10px] font-bold uppercase tracking-wider text-center rounded-lg hover:bg-usm-teal-accent/15 hover:text-usm-teal-accent transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <LifeBuoy size={11} /> {tr(language, 'Support', 'Assistance', 'المساعدة')}
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="w-full py-2.5 bg-usm-teal-accent text-usm-blue-dark text-[11px] font-black uppercase tracking-wider text-center rounded-lg hover:bg-usm-blue-hover hover:text-white transition-all cursor-pointer"
                        >
                          {tr(language, 'Sign Out', 'Déconnexion', 'تسجيل الخروج')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-9 w-9 rounded-full border border-white/12 bg-white/[0.03] flex items-center justify-center text-white cursor-pointer"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
