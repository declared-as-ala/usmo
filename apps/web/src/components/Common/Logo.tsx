import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'color' | 'white' | 'gold';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 60, variant = 'color' }) => {
  // If variant is white/gold, we can apply css filters to make it white or gold, but rendering the official full color logo is the best practice!
  const getFilterClass = () => {
    if (variant === 'white') return 'brightness-0 invert';
    if (variant === 'gold') return 'sepia brightness-90 saturate-200 hue-rotate-[10deg]';
    return '';
  };

  return (
    <img
      src="/logo.webp"
      alt="Union Sportive Monastirienne Official Crest"
      width={size}
      height={size}
      className={`object-contain pointer-events-none select-none ${getFilterClass()} ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
};
