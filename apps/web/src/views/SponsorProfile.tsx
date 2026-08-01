'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api-client';
import { useApp } from '../context/AppContext';
import { SponsorLogo } from '../components/Common/SponsorLogo';
import { ExternalLink, Handshake, ArrowLeft, Sparkles } from 'lucide-react';

interface Sponsor {
  _id: string; name: string; category: string; logo?: string;
  story?: string; storyAr?: string; storyFr?: string;
  offer?: string; offerAr?: string; offerFr?: string; link?: string;
}

const categoryNames: Record<string, string> = {
  Main: 'Partenaire majeur', Official: 'Partenaire officiel', Technical: 'Partenaire technique',
  Media: 'Partenaire média', Academy: 'Partenaire académie',
};

export const SponsorProfile: React.FC<{ slug: string }> = ({ slug }) => {
  const router = useRouter();
  const { language } = useApp();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.getSponsorBySlug(slug)
      .then((data) => setSponsor(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const storyOf = (sp: Sponsor) => language === 'ar' ? sp.storyAr || sp.story : language === 'fr' ? sp.storyFr || sp.story : sp.story;
  const offerOf = (sp: Sponsor) => language === 'ar' ? sp.offerAr || sp.offer : language === 'fr' ? sp.offerFr || sp.offer : sp.offer;

  if (loading) {
    return (
      <div className="usm-premium-bg min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-usm-blue-primary border-usm-border rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !sponsor) {
    return (
      <div className="usm-premium-bg min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-sm text-slate-500">Partenaire introuvable.</p>
        <button onClick={() => router.push('/sponsors')} className="usm-btn-primary px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider">Retour aux partenaires</button>
      </div>
    );
  }

  return (
    <div className="usm-premium-bg min-h-screen text-usm-blue-dark pb-20 pt-24 lg:pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <button onClick={() => router.push('/sponsors')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-usm-blue-primary cursor-pointer">
          <ArrowLeft size={14} /> Tous les partenaires
        </button>

        <div className="usm-card rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-8">
          <div className="shrink-0 h-32 w-32 rounded-2xl bg-usm-blue-soft flex items-center justify-center p-6">
            <SponsorLogo name={sponsor.name} logo={sponsor.logo} size={90} variant="dark" className="max-w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide text-usm-blue-primary bg-usm-blue-primary/10 px-2.5 py-1 rounded-full mb-3">
              <Handshake size={11} /> {categoryNames[sponsor.category] || sponsor.category}
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-usm-blue-dark uppercase tracking-wide">{sponsor.name}</h1>
            {storyOf(sponsor) && <p className="mt-4 text-sm text-slate-600 leading-relaxed">{storyOf(sponsor)}</p>}
            {sponsor.link && (
              <a href={sponsor.link} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-black text-usm-blue-primary uppercase tracking-wider hover:underline">
                Visiter le site <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {offerOf(sponsor) && (
          <div className="usm-card rounded-2xl p-6 flex items-start gap-3">
            <Sparkles size={18} className="text-usm-blue-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black text-usm-blue-dark uppercase tracking-wide mb-1">Offre supporters</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{offerOf(sponsor)}</p>
            </div>
          </div>
        )}

        <div className="usm-card rounded-2xl p-8 text-center">
          <p className="text-sm font-bold text-usm-blue-dark mb-4">Votre marque aussi peut rejoindre l’écosystème USM.</p>
          <button onClick={() => router.push('/sponsors')} className="usm-btn-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
            Devenir partenaire
          </button>
        </div>
      </div>
    </div>
  );
};
