'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Home, Trophy, Newspaper, Sparkles, MoreHorizontal, ShoppingBag, Landmark, Map, Shield, Users, Phone, Image as ImageIcon, Crown, FileText } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeScreen, setActiveScreen, t, isLoggedIn } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleTabClick = (screen: typeof activeScreen) => {
    setActiveScreen(screen);
    setShowMoreMenu(false);
  };

  const primaryTabs: { screen: typeof activeScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'home', label: t('nav.home'), icon: <Home size={19} strokeWidth={2} /> },
    { screen: 'matches', label: t('nav.matches'), icon: <Trophy size={19} strokeWidth={2} /> },
    { screen: 'news', label: 'News', icon: <Newspaper size={19} strokeWidth={2} /> },
    ...(isLoggedIn ? [{ screen: 'fanzone' as const, label: 'Fan Zone', icon: <Sparkles size={19} strokeWidth={2} /> }] : []),
  ];

  const moreItems: { screen: typeof activeScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'football', label: 'Football', icon: <Shield size={17} /> },
    { screen: 'basketball', label: 'Basketball', icon: <Trophy size={17} /> },
    { screen: 'equipe', label: 'Équipe', icon: <Users size={17} /> },
    { screen: 'media', label: 'USM Media', icon: <ImageIcon size={17} /> },
    { screen: 'histoire', label: 'Histoire', icon: <Landmark size={17} /> },
    { screen: 'palmares', label: 'Palmarès', icon: <Trophy size={17} /> },
    { screen: 'legendes', label: 'Légendes', icon: <Crown size={17} /> },
    { screen: 'telechargements', label: 'Téléchargements', icon: <FileText size={17} /> },
    { screen: 'boutique', label: 'Boutique', icon: <ShoppingBag size={17} /> },
    { screen: 'stadium', label: 'Guide du stade', icon: <Map size={17} /> },
    { screen: 'contact', label: 'Nous contacter', icon: <Phone size={17} /> },
  ];

  return (
    <>
      {/* Floating premium dock */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="relative flex items-center justify-around bg-white/90 backdrop-blur-xl border border-usm-teal-accent/15 rounded-[26px] shadow-[0_16px_40px_-12px_rgba(13,99,255,0.20)] px-1 py-2">
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-usm-teal-accent/40 to-transparent" />

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
                    className="absolute -top-0.5 h-1 w-1 rounded-full bg-usm-teal-accent shadow-[0_0_8px_2px_rgba(13,99,255,0.45)]"
                  />
                )}
                <motion.span
                  animate={{ scale: isActive ? 1.08 : 1, color: isActive ? '#3ed6d0' : '#5B6B82' }}
                  transition={{ duration: 0.25 }}
                >
                  {tab.icon}
                </motion.span>
                <span
                  className={`text-[9px] mt-1 font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-usm-teal-accent' : 'text-slate-600'
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
              animate={{ rotate: showMoreMenu ? 90 : 0, color: showMoreMenu ? '#3ed6d0' : '#5B6B82' }}
              transition={{ duration: 0.25 }}
            >
              <MoreHorizontal size={19} />
            </motion.span>
            <span
              className={`text-[9px] mt-1 font-semibold tracking-wide transition-colors duration-300 ${
                showMoreMenu ? 'text-usm-teal-accent' : 'text-slate-600'
              }`}
            >
              More
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
              className="lg:hidden fixed bottom-24 left-3 right-3 z-40 bg-white/95 border border-usm-teal-accent/20 rounded-3xl shadow-2xl p-4 backdrop-blur-xl"
            >
              <div className="w-8 h-1 rounded-full bg-usm-border mx-auto mb-3" />
              <div className="grid grid-cols-2 gap-2.5">
                {moreItems.map((item, idx) => (
                  <motion.button
                    key={item.screen}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => handleTabClick(item.screen)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-usm-blue-soft border border-usm-border hover:border-usm-teal-accent/30 hover:bg-usm-teal-accent/10 text-slate-700 hover:text-usm-teal-accent text-xs font-semibold cursor-pointer transition-all"
                  >
                    <span className="h-8 w-8 rounded-full bg-usm-teal-accent/10 border border-usm-teal-accent/25 flex items-center justify-center text-usm-teal-accent shrink-0">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
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
