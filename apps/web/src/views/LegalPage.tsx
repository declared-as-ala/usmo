'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Cookie, Mail, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api-client';

type LegalPageKey = 'privacy' | 'terms' | 'cookies';
type LegalPageData = { key: LegalPageKey; title: string; content: string; updatedAt?: string };

const LEGAL_LINKS: { key: LegalPageKey; href: string; label: string; icon: any }[] = [
  { key: 'privacy', href: '/confidentialite', label: 'Confidentialité', icon: ShieldCheck },
  { key: 'terms', href: '/conditions-utilisation', label: 'Conditions d’utilisation', icon: FileText },
  { key: 'cookies', href: '/cookies', label: 'Cookies', icon: Cookie },
];

export function LegalPage({ pageKey, fallbackTitle }: { pageKey: LegalPageKey; fallbackTitle: string }) {
  const [page, setPage] = useState<LegalPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getLegalPage(pageKey)
      .then((data: LegalPageData) => {
        if (!cancelled) setPage(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  const title = page?.title || fallbackTitle;
  const rawContent = page?.content || '';

  // Parse raw text into structured numbered sections if format is "1. Title\nContent"
  const sections = rawContent
    .split(/(?=\n\s*\d+\.\s+)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen usm-premium-bg text-usm-blue-dark pt-28 pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Tabs between Legal Documents */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LEGAL_LINKS.map((item) => {
            const isActive = item.key === pageKey;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-usm-blue-primary text-white shadow-md'
                    : 'bg-white border border-[#DDE8F8] text-slate-600 hover:text-usm-blue-primary hover:border-usm-blue-primary/40 shadow-2xs'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <article className="bg-white border border-[#DDE8F8] rounded-3xl shadow-xl overflow-hidden">
          {/* Header section with brand styling */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#061A3A] to-[#0d56db] text-white p-8 sm:p-12">
            {/* Ambient glows */}
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-usm-teal-accent/15 blur-[60px] pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 h-36 w-36 rounded-full bg-white/5 blur-[40px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-usm-teal-accent backdrop-blur-md">
                <ShieldCheck size={14} /> Union Sportive Monastirienne • Cadre Légal
              </span>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl text-white uppercase tracking-wide">
                {title}
              </h1>
              {page?.updatedAt && (
                <p className="text-xs font-semibold text-slate-300">
                  Dernière révision officielle : {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Structured Content Area */}
          <div className="p-8 sm:p-12 space-y-8">
            {rawContent ? (
              sections.length > 1 ? (
                <div className="space-y-6">
                  {sections.map((sec, idx) => {
                    const firstLineEnd = sec.indexOf('\n');
                    const header = firstLineEnd !== -1 ? sec.substring(0, firstLineEnd).trim() : sec;
                    const body = firstLineEnd !== -1 ? sec.substring(firstLineEnd).trim() : '';

                    return (
                      <section
                        key={idx}
                        className="rounded-2xl border border-slate-100 bg-[#F8FAFD] p-6 sm:p-8 hover:border-usm-blue-primary/30 transition-colors"
                      >
                        <h2 className="text-lg sm:text-xl font-display font-black text-usm-blue-dark tracking-wide mb-4 flex items-start gap-3">
                          <span className="flex h-7 w-7 rounded-lg bg-usm-blue-primary/10 border border-usm-blue-primary/20 items-center justify-center text-xs font-black text-usm-blue-primary shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{header.replace(/^\d+\.\s*/, '')}</span>
                        </h2>
                        {body && (
                          <div className="whitespace-pre-line text-sm leading-7 text-[#41536C] font-normal pl-0 sm:pl-10">
                            {body}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="whitespace-pre-line text-sm leading-8 text-[#33455F] font-medium">
                  {rawContent}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="skeleton-loader h-5 w-3/4 rounded-md" />
                <div className="skeleton-loader h-4 w-full rounded-md" />
                <div className="skeleton-loader h-4 w-5/6 rounded-md" />
                <div className="skeleton-loader h-4 w-2/3 rounded-md" />
              </div>
            )}

            {/* Official Contact & Registry Box */}
            <div className="rounded-2xl border border-usm-blue-primary/20 bg-usm-blue-soft/50 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-usm-blue-dark">
                  Questions relatives aux aspects juridiques et données ?
                </h3>
                <p className="text-xs text-slate-500">
                  Le secrétariat général de l’US Monastir se tient à votre entière disposition.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-usm-blue-primary">
                  <a href="mailto:contact@usmonastir.org.tn" className="inline-flex items-center gap-1.5 hover:underline">
                    <Mail size={13} /> contact@usmonastir.org.tn
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <MapPin size={13} /> Avenue Ibn El Jazzar, 5000 Monastir, Tunisie
                  </span>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-md"
              >
                <span>Contacter le club</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
