'use client';

import React from 'react';
import { SeoScoreStatus } from 'shared';

interface SeoScoreBadgeProps {
  score: number;
  status?: SeoScoreStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SeoScoreBadge: React.FC<SeoScoreBadgeProps> = ({
  score,
  status,
  showLabel = true,
  size = 'md',
}) => {
  let effectiveStatus = status;
  if (!effectiveStatus) {
    if (score >= 90) effectiveStatus = 'excellent';
    else if (score >= 70) effectiveStatus = 'good';
    else if (score >= 50) effectiveStatus = 'needs_improvement';
    else effectiveStatus = 'poor';
  }

  const config = {
    excellent: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      labelFr: 'Excellent',
    },
    good: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      labelFr: 'Bon',
    },
    needs_improvement: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      labelFr: 'À améliorer',
    },
    poor: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      labelFr: 'Insuffisant',
    },
  }[effectiveStatus] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    labelFr: 'Non calculé',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs font-mono transition-all ${config.bg} ${sizeClasses}`}
      title={`Score SEO: ${score}/100 — ${config.labelFr}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span>{score}/100</span>
      {showLabel && <span className="font-sans font-medium text-[11px] opacity-85">({config.labelFr})</span>}
    </span>
  );
};
