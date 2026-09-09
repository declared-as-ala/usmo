'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface LaunchStatusData {
  enabled: boolean;
  launchAt: string;
  serverTime: string;
  timezone: string;
  isUnlocked: boolean;
  unlocked?: boolean;
}

interface LaunchPageProps {
  initialStatus?: LaunchStatusData | null;
  onUnlocked: () => void;
  previewMode?: boolean;
  onExitPreview?: () => void;
}

interface TimeRemaining {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({
  initialStatus,
  onUnlocked,
  previewMode = false,
  onExitPreview,
}) => {
  const [status, setStatus] = useState<LaunchStatusData | null>(initialStatus || null);
  const [clockOffsetMs, setClockOffsetMs] = useState<number>(0);
  const [unlockedCelebration, setUnlockedCelebration] = useState(false);
  const hasTriggeredUnlockRef = useRef(false);

  // Fetch status and calculate clock skew between client and server
  const syncStatus = useCallback(async () => {
    try {
      const fetchStart = Date.now();
      const res = await fetch('/api/settings/site-launch', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) return;
      const data: LaunchStatusData = await res.json();
      const fetchEnd = Date.now();
      const latencyEstimate = (fetchEnd - fetchStart) / 2;

      // Server time estimated at fetchEnd
      const serverDate = new Date(data.serverTime).getTime();
      const offset = serverDate + latencyEstimate - fetchEnd;
      setClockOffsetMs(offset);
      setStatus(data);

      if (data.isUnlocked && !hasTriggeredUnlockRef.current) {
        hasTriggeredUnlockRef.current = true;
        setUnlockedCelebration(true);
        setTimeout(() => {
          onUnlocked();
        }, 1200);
      }
    } catch {
      // Fallback gracefully to default target if offline/api error
    }
  }, [onUnlocked]);

  useEffect(() => {
    syncStatus();
    // Re-sync with server every 15 seconds to stay perfectly calibrated
    const interval = setInterval(syncStatus, 15000);
    return () => clearInterval(interval);
  }, [syncStatus]);

  // Set title for the launch page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Union Sportive Monastirienne — Lancement Officiel à 19:23';
    }
  }, []);

  // Compute countdown using absolute timestamp + clock offset
  const calculateRemaining = useCallback((): TimeRemaining => {
    const targetMs = status?.launchAt
      ? new Date(status.launchAt).getTime()
      : new Date('2026-09-09T18:23:00.000Z').getTime();

    const nowWithOffset = Date.now() + clockOffsetMs;
    const diff = targetMs - nowWithOffset;

    if (diff <= 0) {
      return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { totalMs: diff, hours, minutes, seconds, isExpired: false };
  }, [status, clockOffsetMs]);

  const [time, setTime] = useState<TimeRemaining>(calculateRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      const rem = calculateRemaining();
      setTime(rem);

      if (rem.isExpired && !hasTriggeredUnlockRef.current) {
        hasTriggeredUnlockRef.current = true;
        setUnlockedCelebration(true);
        // Promptly re-validate with backend before removing gate
        syncStatus().finally(() => {
          setTimeout(() => {
            onUnlocked();
          }, 1400);
        });
      }
    }, 500);

    return () => clearInterval(timer);
  }, [calculateRemaining, syncStatus, onUnlocked]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative min-h-screen w-full bg-[#061A3A] text-white overflow-x-hidden flex flex-col justify-between selection:bg-[#0D63FF]/30 select-none">

      {/* Super Admin Preview Bar if active */}
      {previewMode && (
        <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Mode Aperçu Super Admin Actif (Cookie Sécurisé)</span>
          </div>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="bg-black/30 hover:bg-black/50 text-white px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              Quitter l&apos;Aperçu
            </button>
          )}
        </div>
      )}

      {/* Background Visual Layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Deep USM Blue radial glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-radial from-[#0D63FF]/25 via-[#0D63FF]/05 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-radial from-[#00D4FF]/10 via-[#0D63FF]/05 to-transparent blur-3xl" />

        {/* Subtle decorative stadium/atmosphere texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] bg-cover bg-center mix-blend-luminosity"
          style={{
            backgroundImage: "url('/banner-football.webp')",
          }}
        />

        {/* Geometric light lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-white/70 uppercase">
            Site Officiel • Édition 2026
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/50 bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <Clock size={13} className="text-[#00D4FF]" />
          <span>Heure de Tunis (UTC+1)</span>
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto">
        {/* Floating Club Crest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div className="absolute -inset-6 rounded-full bg-gradient-to-b from-[#0D63FF]/30 to-transparent blur-2xl" />
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-gradient-to-b from-white/10 to-white/[0.02] p-1 border border-white/20 shadow-[0_0_50px_rgba(13,99,255,0.35)] backdrop-blur-xl flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="Union Sportive Monastirienne"
              className="h-20 w-20 sm:h-28 sm:w-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
          </div>
        </motion.div>

        {/* Historic Badge "DEPUIS 1923" */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0D63FF]/20 via-[#00D4FF]/20 to-[#0D63FF]/20 border border-[#00D4FF]/30 text-[#00D4FF] text-xs font-black uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(13,99,255,0.2)] mb-6 backdrop-blur-md"
        >
          <Sparkles size={13} className="text-[#00D4FF]" />
          <span>DEPUIS 1923</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-white uppercase leading-[1.08] max-w-3xl"
        >
          Le Nouveau Site Officiel Arrive.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 text-base sm:text-xl font-medium text-white/80 max-w-xl"
        >
          Rendez-vous aujourd’hui à <span className="font-extrabold text-[#00D4FF]">19:23</span>.
        </motion.p>

        {/* COUNTDOWN TILES */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 sm:mt-12 w-full max-w-2xl"
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {/* Hours */}
            <div className="group relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 p-4 sm:p-7 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:border-[#0D63FF]/60 hover:scale-[1.02]">
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-radial from-[#0D63FF]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative font-mono font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {pad(time.hours)}
              </div>
              <div className="relative mt-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#00D4FF]/90">
                HEURES
              </div>
            </div>

            {/* Minutes */}
            <div className="group relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 p-4 sm:p-7 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:border-[#0D63FF]/60 hover:scale-[1.02]">
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-radial from-[#0D63FF]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative font-mono font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {pad(time.minutes)}
              </div>
              <div className="relative mt-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#00D4FF]/90">
                MINUTES
              </div>
            </div>

            {/* Seconds */}
            <div className="group relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 p-4 sm:p-7 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:border-[#0D63FF]/60 hover:scale-[1.02]">
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-radial from-[#0D63FF]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative font-mono font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {pad(time.seconds)}
              </div>
              <div className="relative mt-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#00D4FF]/90">
                SECONDES
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small Historical Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 sm:mt-10 text-xs sm:text-sm text-white/60 font-sans tracking-wide max-w-lg leading-relaxed italic"
        >
          « Un clin d’œil à 1923, année de fondation de l’Union Sportive Monastirienne. »
        </motion.p>
      </main>

      {/* Discreet Footer with Admin Link */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] text-xs text-white/45">
        <div>
          © {new Date().getFullYear()} Union Sportive Monastirienne. Tous droits réservés.
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-white/45 hover:text-white/80 transition-colors text-[11px] uppercase tracking-wider"
          >
            <Lock size={12} />
            <span>Accès Administration</span>
          </Link>
          <span className="text-white/20">•</span>
          <a
            href="https://ibrandtunisia.tn/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white/70 transition-colors text-[11px] tracking-wider"
          >
            Powered by iBrand Tunisia
          </a>
        </div>
      </footer>

      {/* Celebratory Transition Overlay upon reaching zero */}
      <AnimatePresence>
        {unlockedCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] bg-[#061A3A] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              className="relative mb-6"
            >
              <div className="absolute -inset-10 rounded-full bg-[#0D63FF]/40 blur-3xl animate-pulse" />
              <img
                src="/logo.webp"
                alt="USM"
                className="relative h-32 w-32 object-contain"
              />
            </motion.div>
            <h2 className="text-2xl sm:text-4xl font-display font-black uppercase text-white tracking-wider">
              Bienvenue sur le Site Officiel de l&apos;USM
            </h2>
            <p className="mt-3 text-sm text-[#00D4FF] font-mono tracking-widest uppercase">
              1923 — Ouverture en cours…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
