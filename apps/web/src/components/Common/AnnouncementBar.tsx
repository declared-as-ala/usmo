'use client';

import React from 'react';
import Link from 'next/link';

interface AnnouncementBarProps {
  /** Optional custom text override */
  text?: string;
  /** Optional destination link (defaults to /boutique) */
  href?: string;
}

const DEFAULT_MESSAGE = '🔥 PRÉCOMMANDES OUVERTES 🔥 STOCK LIMITÉ 🔥 PRÉCOMMANDEZ MAINTENANT';

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  href = '/boutique',
}) => {
  // We repeat the phrase 6 times per track.
  // With 2 identical tracks translating from 0% to -50%, this provides a 100% seamless,
  // glitch-free infinite continuous loop on all screens (mobile up to 4K ultrawide).
  const repetitions = [0, 1, 2, 3, 4, 5];

  const renderTrack = (ariaHidden?: boolean) => (
    <div
      className="flex items-center shrink-0 whitespace-nowrap py-0.5"
      aria-hidden={ariaHidden}
    >
      {repetitions.map((i) => (
        <span key={i} className="inline-flex items-center">
          <span className="inline-flex items-center gap-1.5 xs:gap-2 mx-3.5 xs:mx-5 sm:mx-6 text-[10px] xs:text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] xs:tracking-[0.15em] text-white">
            <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] whitespace-nowrap">
              🔥 PRÉCOMMANDES OUVERTES
            </span>
            <span className="text-amber-400 font-black drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] whitespace-nowrap">
              🔥 STOCK LIMITÉ
            </span>
            <span className="text-[#38BDF8] font-black underline decoration-[#38BDF8]/60 underline-offset-2 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] whitespace-nowrap">
              🔥 PRÉCOMMANDEZ MAINTENANT
            </span>
          </span>
          <span
            className="text-[#0D63FF] text-xs font-black select-none opacity-80"
            aria-hidden="true"
          >
            •
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Annonce officielle US Monastir — Précommandes"
      className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-[#030B18] via-[#081B3A] to-[#030B18] border-b border-[#0D63FF]/30 shadow-[0_2px_14px_rgba(13,99,255,0.22)] select-none group"
    >
      {/* Subtle brand blue top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0D63FF]/60 to-transparent pointer-events-none" />

      {/* Left edge fade gradient mask (inspired by zen.com.tn ticker mask) */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-[#030B18] to-transparent z-10" />

      {/* Right edge fade gradient mask */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-[#030B18] to-transparent z-10" />

      {/* Clickable ticker marquee leading to official boutique */}
      <Link
        href={href}
        className="flex items-center h-8 sm:h-8.5 w-full cursor-pointer hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D63FF]"
        title="Précommander sur la Boutique Officielle USM"
      >
        <div className="flex w-max animate-usm-ticker">
          {renderTrack(false)}
          {renderTrack(true)}
        </div>
      </Link>
    </aside>
  );
};
