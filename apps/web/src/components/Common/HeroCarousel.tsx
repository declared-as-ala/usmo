'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumHeroBackground } from './PremiumHeroBackground';

export interface HeroSlideData {
  _id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  overlayStrength?: 'light' | 'medium' | 'strong';
  textPosition?: 'left' | 'center' | 'right';
}

interface HeroCarouselProps {
  slides: HeroSlideData[];
  intervalMs?: number;
  /** Extra content rendered inside each slide's text column (e.g. stat chips) — receives the active slide. */
  renderExtra?: (slide: HeroSlideData, index: number) => React.ReactNode;
}

const ALIGN_CLASSES: Record<NonNullable<HeroSlideData['textPosition']>, string> = {
  left: 'items-start text-left rtl:items-end rtl:text-right',
  center: 'items-center text-center',
  right: 'items-end text-right rtl:items-start rtl:text-left',
};

const READABILITY_SCRIMS: Record<NonNullable<HeroSlideData['textPosition']>, string> = {
  left: 'bg-gradient-to-r from-black/75 via-black/35 to-transparent',
  center: 'bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.58),transparent_68%)]',
  right: 'bg-gradient-to-l from-black/75 via-black/35 to-transparent',
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, intervalMs = 6000, renderExtra }) => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const goTo = useCallback((next: number) => {
    setIndex(((next % total) + total) % total);
  }, [total]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance
  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setTimeout(next, intervalMs);
    return () => clearTimeout(id);
  }, [index, paused, total, intervalMs, next]);

  // Keyboard navigation when the carousel has focus
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) (delta < 0 ? next : prev)();
    touchStartX.current = null;
  };

  if (total === 0) return null;
  const slide = slides[index];
  const textPosition = slide.textPosition || 'left';
  const align = ALIGN_CLASSES[textPosition];

  const go = (link?: string) => {
    if (!link) return;
    if (link.startsWith('http')) window.open(link, '_blank');
    else router.push(link);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[85vh] overflow-hidden outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="absolute inset-0 bg-slate-950"
        >
          <PremiumHeroBackground
            imageUrl={slide.backgroundImage}
            mobileImageUrl={slide.mobileBackgroundImage}
            overlayStrength={slide.overlayStrength || 'medium'}
            showBlueGlow
            animate
          />
        </motion.div>
      </AnimatePresence>

      {/* Neutral contrast only: preserves the photograph's hue while keeping copy legible. */}
      <div className={`pointer-events-none absolute inset-0 z-[1] ${READABILITY_SCRIMS[textPosition]}`} />

      <div className="relative h-full flex items-center z-10 pt-20 lg:pt-0">
        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide._id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`max-w-2xl flex flex-col ${align}`}
            >
              {slide.badgeText && (
                <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-white uppercase mb-5 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-usm-blue-primary shadow-[0_0_8px_rgba(13,99,255,0.9)]" />
                  {slide.badgeText}
                </span>
              )}
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white uppercase tracking-wider leading-[0.95] [text-shadow:0_4px_20px_rgba(0,0,0,0.9)]">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <h2 className="font-display font-extrabold text-white/95 text-lg sm:text-2xl tracking-widest mt-4 uppercase [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                  {slide.subtitle}
                </h2>
              )}
              {renderExtra?.(slide, index)}
              {(slide.primaryCtaText || slide.secondaryCtaText) && (
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  {slide.primaryCtaText && (
                    <button
                      onClick={() => go(slide.primaryCtaLink)}
                      className="px-8 py-3.5 bg-usm-blue-primary hover:bg-usm-blue-hover text-white font-black tracking-wider uppercase rounded-xl transition-all shadow-[0_12px_30px_-8px_rgba(13,99,255,0.65)] hover:scale-105 cursor-pointer text-sm"
                    >
                      {slide.primaryCtaText}
                    </button>
                  )}
                  {slide.secondaryCtaText && (
                    <button
                      onClick={() => go(slide.secondaryCtaLink)}
                      className="px-8 py-3.5 bg-white/5 border border-white/20 hover:border-usm-blue-primary/60 hover:bg-white/10 text-white font-black tracking-wider uppercase rounded-xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer text-sm"
                    >
                      {slide.secondaryCtaText}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Diapositive précédente"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/15 backdrop-blur-md text-white/80 hover:text-usm-blue-primary hover:border-usm-blue-primary/50 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Diapositive suivante"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/15 backdrop-blur-md text-white/80 hover:text-usm-blue-primary hover:border-usm-blue-primary/50 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Carousel indicator — counter, progress bar, dots */}
      {total > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 rounded-full bg-[#040b1c]/70 border border-white/10 backdrop-blur-md px-4 py-2.5">
          <span className="text-[11px] font-bold tracking-wider text-white/70 tabular-nums">
            <span className="text-usm-teal-accent">{String(index + 1).padStart(1, '0')}</span> / {total}
          </span>
          <span className="h-3 w-px bg-white/15" />
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s._id}
                onClick={() => goTo(i)}
                aria-label={`Aller à la diapositive ${i + 1}`}
                aria-current={i === index}
                className="relative h-1.5 rounded-full bg-usm-blue-light/25 overflow-hidden transition-all duration-300 cursor-pointer"
                style={{ width: i === index ? 28 : 6 }}
              >
                {i === index && !paused && (
                  <motion.span
                    key={`${slide._id}-progress`}
                    className="absolute inset-y-0 left-0 bg-usm-teal-accent rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: intervalMs / 1000, ease: 'linear' }}
                  />
                )}
                {i === index && paused && <span className="absolute inset-0 bg-usm-teal-accent rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
