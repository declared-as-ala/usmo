'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import {
  Home,
  Trophy,
  MoreHorizontal,
  ShoppingBag,
  Landmark,
  Map,
  Phone,
  Image as ImageIcon,
  Crown,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeScreen, setActiveScreen, t, language, isLoggedIn, logout } = useApp();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleTabClick = (screen: typeof activeScreen) => {
    setActiveScreen(screen);
    setShowMoreMenu(false);
  };

  const primaryTabs: { screen: typeof activeScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'home', label: t('nav.home'), icon: <Home size={19} strokeWidth={2} /> },
    { screen: 'matches', label: t('nav.matches'), icon: <Trophy size={19} strokeWidth={2} /> },
    { screen: 'boutique', label: t('nav.boutique'), icon: <ShoppingBag size={19} strokeWidth={2} /> },
  ];

  const moreItems: {
    key: string;
    screen?: typeof activeScreen;
    href?: string;
    action?: () => void;
    label: string;
    icon: React.ReactNode;
    highlight?: boolean;
  }[] = [
    {
      key: 'football',
      screen: 'football',
      label: 'Football',
      icon: <img src="/logo foot.png" alt="" className="h-[22px] w-[22px] rounded-full object-cover" />,
    },
    {
      key: 'basketball',
      screen: 'basketball',
      label: 'Basketball',
      icon: <img src="/logo basket.png" alt="" className="h-[22px] w-[22px] rounded-full object-cover" />,
    },
    { key: 'media', screen: 'media', label: 'USM Media', icon: <ImageIcon size={17} /> },
    { key: 'histoire', screen: 'histoire', label: 'Histoire', icon: <Landmark size={17} /> },
    { key: 'palmares', screen: 'palmares', label: 'Palmarès', icon: <Trophy size={17} /> },
    { key: 'legendes', screen: 'legendes', label: 'Légendes', icon: <Crown size={17} /> },
    { key: 'stadium', screen: 'stadium', label: 'Guide du stade', icon: <Map size={17} /> },
    { key: 'contact', screen: 'contact', label: 'Contact', icon: <Phone size={17} /> },
    {
      key: 'connexion',
      href: isLoggedIn ? undefined : '/connexion',
      action: isLoggedIn ? () => logout() : undefined,
      label: isLoggedIn
        ? tr(language, 'Sign Out', 'Déconnexion', 'تسجيل الخروج')
        : tr(language, 'Sign In', 'Connexion', 'تسجيل الدخول'),
      icon: isLoggedIn ? <LogOut size={16} className="text-red-500" /> : <LogIn size={16} className="text-usm-blue-primary" />,
      highlight: true,
    },
    {
      key: 'profil',
      href: '/compte',
      label: tr(language, 'My Profile', 'Mon Profil', 'ملفي الشخصي'),
      icon: <User size={16} className="text-usm-blue-primary" />,
      highlight: true,
    },
  ];

  const handleItemClick = (item: (typeof moreItems)[number]) => {
    setShowMoreMenu(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    } else if (item.screen) {
      setActiveScreen(item.screen);
    }
  };

  return (
    <>
      {/* Floating premium dock */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="relative flex items-center justify-around bg-white/90 backdrop-blur-xl border border-usm-blue-dark/15 rounded-[26px] shadow-[0_16px_40px_-12px_rgba(13,99,255,0.20)] px-1 py-2">
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-usm-blue-dark/40 to-transparent" />

          {primaryTabs.map((tab) => {
            const isActive = activeScreen === tab.screen;
            return (
              <button
                key={tab.screen}
                onClick={() => handleTabClick(tab.screen)}
                className="relative flex flex-col items-center justify-center flex-1 py-1.5 cursor-pointer"
              >
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute -top-0.5 h-1 w-1 rounded-full bg-usm-blue-dark shadow-[0_0_8px_2px_rgba(13,99,255,0.45)]"
                  />
                )}
                <motion.span
                  animate={{ scale: isActive ? 1.08 : 1, color: isActive ? '#061A3A' : '#5B6B82' }}
                  transition={{ duration: 0.25 }}
                >
                  {tab.icon}
                </motion.span>
                <span
                  className={`text-[9px] mt-1 font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-usm-blue-dark' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="relative flex flex-col items-center justify-center flex-1 py-1.5 cursor-pointer"
          >
            <motion.span
              animate={{ rotate: showMoreMenu ? 90 : 0, color: showMoreMenu ? '#061A3A' : '#5B6B82' }}
              transition={{ duration: 0.25 }}
            >
              <MoreHorizontal size={19} />
            </motion.span>
            <span
              className={`text-[9px] mt-1 font-semibold tracking-wide transition-colors duration-300 ${
                showMoreMenu ? 'text-usm-blue-dark' : 'text-slate-600'
              }`}
            >
              {t('nav.more')}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded "more" sheet */}
      <AnimatePresence>
        {showMoreMenu && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed bottom-24 left-3 right-3 z-40 bg-white/95 border border-usm-blue-dark/20 rounded-3xl shadow-2xl p-4 backdrop-blur-xl max-h-[82vh] overflow-y-auto"
            >
              <div className="w-8 h-1 rounded-full bg-usm-border mx-auto mb-3" />
              <div className="grid grid-cols-2 gap-2.5">
                {moreItems.map((item, idx) => (
                  <motion.button
                    key={item.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all min-w-0 ${
                      item.highlight
                        ? 'bg-usm-blue-soft/80 border-usm-blue-primary/25 text-usm-blue-dark hover:border-usm-blue-primary hover:bg-usm-blue-primary/10'
                        : 'bg-usm-blue-soft border-usm-border hover:border-usm-blue-dark/30 hover:bg-usm-blue-dark/10 text-slate-700 hover:text-usm-blue-dark'
                    }`}
                  >
                    <span
                      className={`h-7 w-7 rounded-full border flex items-center justify-center shrink-0 ${
                        item.highlight
                          ? 'bg-white border-usm-blue-primary/25 shadow-xs'
                          : 'bg-usm-blue-dark/10 border-usm-blue-dark/25 text-usm-blue-dark'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate text-xs font-semibold leading-tight">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
};
