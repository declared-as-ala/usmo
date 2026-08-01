'use client';

import React, { useState } from 'react';

interface SponsorLogoProps {
  name: string;
  logo?: string;
  /** Height in px — width is auto for real logos, or matched for the monogram fallback. */
  size?: number;
  className?: string;
  variant?: 'light' | 'dark';
}

/**
 * Renders a sponsor's real logo image, or a clean monogram badge if no logo URL is
 * available (or the image fails to load) — never a broken-image icon.
 */
export const SponsorLogo: React.FC<SponsorLogoProps> = ({
  name,
  logo,
  size = 40,
  className = '',
  variant = 'dark',
}) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !logo || failed;

  if (showFallback) {
    return (
      <span
        style={{ height: size, width: size }}
        className={`inline-flex items-center justify-center shrink-0 rounded-lg font-display font-black text-sm ${
          variant === 'light'
            ? 'bg-usm-blue-soft text-usm-blue-dark border border-usm-border'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}
        title={name}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={name}
      style={{ height: size }}
      onError={() => setFailed(true)}
      className={`w-auto object-contain ${className}`}
    />
  );
};
