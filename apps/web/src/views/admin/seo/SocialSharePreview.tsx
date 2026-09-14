'use client';

import React, { useState } from 'react';
import { Globe, Smartphone, Monitor, Share2, MessageCircle } from 'lucide-react';
import { getPublicAbsoluteUrl } from '../../../lib/seo/publicUrl';

interface SocialSharePreviewProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  siteName?: string;
}

export const SocialSharePreview: React.FC<SocialSharePreviewProps> = ({
  title,
  description,
  path,
  image,
  siteName = 'US Monastir',
}) => {
  const [platform, setPlatform] = useState<'google' | 'facebook' | 'whatsapp' | 'twitter'>('google');
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');

  const domain = 'www.usmonastir.tn';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `https://${domain}${cleanPath}`;
  const resolvedImageUrl = getPublicAbsoluteUrl(image);

  const displayTitle = title || `${siteName} — Site Officiel`;
  const displayDesc =
    description ||
    "Retrouvez toute l'actualité officielle, la boutique, les effectifs et les résultats de l'Union Sportive Monastirienne.";

  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
      {/* Platform Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setPlatform('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              platform === 'google'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google
          </button>
          <button
            type="button"
            onClick={() => setPlatform('facebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              platform === 'facebook'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Facebook
          </button>
          <button
            type="button"
            onClick={() => setPlatform('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              platform === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setPlatform('twitter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              platform === 'twitter'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="font-mono font-bold text-xs">𝕏</span>
            X / Twitter
          </button>
        </div>

        {platform === 'google' && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setGoogleDevice('desktop')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                googleDevice === 'desktop' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400'
              }`}
              title="Aperçu Ordinateur"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setGoogleDevice('mobile')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                googleDevice === 'mobile' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400'
              }`}
              title="Aperçu Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 1. GOOGLE SEARCH PREVIEW */}
      {platform === 'google' && (
        <div
          className={`bg-white border border-slate-200 rounded-xl p-4 shadow-xs font-sans transition-all ${
            googleDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
              USM
            </div>
            <div className="text-[12px] text-slate-600 leading-none truncate">
              <span className="font-medium text-slate-900">{siteName}</span>
              <span className="mx-1 text-slate-400">›</span>
              <span className="text-slate-500">{cleanPath.replace(/^\//, '') || 'accueil'}</span>
            </div>
          </div>
          <h3 className="text-blue-800 hover:underline cursor-pointer font-medium text-base leading-snug break-words mb-1">
            {displayTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {displayDesc}
          </p>
        </div>
      )}

      {/* 2. FACEBOOK PREVIEW */}
      {platform === 'facebook' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="aspect-[1200/630] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedImageUrl}
              alt="Facebook Open Graph Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback placeholder
                (e.target as HTMLImageElement).src = '/logo.webp';
              }}
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
              1200 × 630
            </div>
          </div>
          <div className="p-3 bg-[#F0F2F5] border-t border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5 truncate">
              {domain}
            </div>
            <div className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">
              {displayTitle}
            </div>
            <div className="text-xs text-slate-600 line-clamp-2 leading-normal">
              {displayDesc}
            </div>
          </div>
        </div>
      )}

      {/* 3. WHATSAPP PREVIEW */}
      {platform === 'whatsapp' && (
        <div className="max-w-sm mx-auto bg-[#ECE5DD] p-3 rounded-2xl shadow-inner">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200/70">
            <div className="aspect-[1200/630] w-full bg-slate-200 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImageUrl}
                alt="WhatsApp Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.webp';
                }}
              />
            </div>
            <div className="p-2.5 space-y-1">
              <div className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                {displayTitle}
              </div>
              <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {displayDesc}
              </div>
              <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-1 truncate">
                <Globe className="w-2.5 h-2.5 shrink-0" />
                {fullUrl}
              </div>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500 mt-1 font-mono">
            19:23 ✓✓
          </div>
        </div>
      )}

      {/* 4. X / TWITTER PREVIEW */}
      {platform === 'twitter' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="aspect-[1200/630] w-full bg-slate-100 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedImageUrl}
              alt="Twitter Card Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.webp';
              }}
            />
          </div>
          <div className="p-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 truncate mb-0.5">{domain}</div>
            <div className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
              {displayTitle}
            </div>
            <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {displayDesc}
            </div>
          </div>
        </div>
      )}

      <div className="text-[11px] text-slate-400 text-center italic">
        Aperçu approximatif généré à partir des balises Open Graph et Méta actuelles.
      </div>
    </div>
  );
};
