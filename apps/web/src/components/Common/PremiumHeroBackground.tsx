'use client';

import React from 'react';

type OverlayStrength = 'light' | 'medium' | 'strong';

interface PremiumHeroBackgroundProps {
  imageUrl: string;
  mobileImageUrl?: string;
  /** Retained for compatibility; banners now display without a color overlay. */
  overlayStrength?: OverlayStrength;
  /** CSS background-position value, e.g. 'center', 'center 30%' */
  focalPoint?: string;
  /** Retained for compatibility; no artificial color glow is rendered. */
  showBlueGlow?: boolean;
  /** Retained for compatibility; no artificial color accent is rendered. */
  showBlueAccent?: boolean;
  /** Retained for compatibility; the source image is no longer filtered. */
  imageBrightness?: number;
  /** `contain` keeps the complete artwork visible; `cover` fills and may crop. */
  fit?: 'cover' | 'contain';
  className?: string;
  /** Zoom animation on the image (matches the homepage heroZoom keyframe) */
  animate?: boolean;
}

/** Renders banner artwork without color overlays or filters. */
export const PremiumHeroBackground: React.FC<PremiumHeroBackgroundProps> = ({
  imageUrl,
  mobileImageUrl,
  focalPoint = 'center',
  fit = 'cover',
  className = '',
  animate = false,
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className={`absolute inset-0 bg-no-repeat ${animate ? 'animate-[heroZoom_25s_ease-out_infinite_alternate]' : ''}`}
        style={{
          backgroundImage: mobileImageUrl ? undefined : `url("${imageUrl}")`,
          backgroundPosition: focalPoint,
          backgroundSize: fit,
        }}
      >
        {mobileImageUrl && (
          <picture className="block h-full w-full">
            <source media="(max-width: 639px)" srcSet={mobileImageUrl} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
              style={{ objectPosition: focalPoint }}
            />
          </picture>
        )}
      </div>
    </div>
  );
};
