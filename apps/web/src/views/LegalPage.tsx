'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api-client';

type LegalPageKey = 'privacy' | 'terms' | 'cookies';
type LegalPageData = { key: LegalPageKey; title: string; content: string; updatedAt?: string };

export function LegalPage({ pageKey, fallbackTitle }: { pageKey: LegalPageKey; fallbackTitle: string }) {
  const [page, setPage] = useState<LegalPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getLegalPage(pageKey).then((data: LegalPageData) => { if (!cancelled) setPage(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, [pageKey]);

  const title = page?.title || fallbackTitle;
  const content = page?.content || '';

  return (
    <main className="min-h-screen usm-premium-bg text-usm-blue-dark pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <article className="bg-white border border-[#DDE8F8] rounded-3xl shadow-2xl overflow-hidden">
          {/* Header section with brand colors */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#061A3A] to-[#0d56db] text-white p-8 sm:p-12">
            {/* Ambient luxury glows */}
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-usm-teal-accent/15 blur-[60px] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-usm-teal-accent">
                <ShieldCheck size={13} /> Informations légales
              </span>
              <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl text-white uppercase tracking-wide">
                {title}
              </h1>
              {page?.updatedAt && (
                <p className="mt-3 text-xs font-semibold text-slate-300">
                  Dernière mise à jour : {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-8 sm:p-12">
            {content ? (
              <div className="whitespace-pre-line text-sm leading-8 text-[#33455F] font-medium">
                {content}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="skeleton-loader h-4 w-3/4 rounded" />
                <div className="skeleton-loader h-4 w-full rounded" />
                <div className="skeleton-loader h-4 w-5/6 rounded" />
                <div className="skeleton-loader h-4 w-2/3 rounded" />
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
