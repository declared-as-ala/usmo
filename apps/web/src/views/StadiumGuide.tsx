'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '../lib/api-client';
import { MapPin, Users, Shield, Compass, ShieldCheck } from 'lucide-react';

interface StadiumPageContent {
  heroTitle: string; heroSubtitle: string; heroImage: string;
  safetyIntro: string; safetyRules: { title: string; description: string }[];
}
interface VenueRow {
  _id: string; name: string; sport: 'football' | 'basketball' | 'other';
  description: string; image?: string; capacity?: number; gates: string;
  address: string; directions: string; services: string[];
}

const SPORT_LABEL: Record<VenueRow['sport'], string> = {
  football: 'Venue Football', basketball: 'Arène Basketball', other: 'Site USM',
};

export const StadiumGuide: React.FC = () => {
  const [content, setContent] = useState<StadiumPageContent | null>(null);
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getStadiumPage(), api.getVenues()]).then(([page, v]) => {
      if (page.status === 'fulfilled') setContent(page.value);
      if (v.status === 'fulfilled') setVenues(v.value || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="usm-premium-bg min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-usm-blue-primary border-usm-border rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="usm-premium-bg min-h-screen text-usm-blue-dark pb-20 pt-24 lg:pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {/* HERO */}
        <section className="relative rounded-3xl overflow-hidden border border-usm-border min-h-[260px] flex items-end p-6 sm:p-10">
          {content?.heroImage ? (
            <Image src={content.heroImage} alt="" fill unoptimized className="object-cover brightness-[0.35]" />
          ) : (
            <div className="absolute inset-0 bg-usm-blue-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-usm-blue-dark via-usm-blue-dark/40 to-transparent" />
          <div className="relative z-10">
            <span className="text-[10px] bg-usm-blue-primary text-white font-black tracking-widest px-3 py-1 rounded-full uppercase">
              Guide matchday
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-wider mt-3">
              {content?.heroTitle || 'Stades & Salles USM'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-lg">
              {content?.heroSubtitle || 'Accès, capacité, protocoles de sécurité et itinéraires pour les enceintes du club.'}
            </p>
          </div>
        </section>

        {/* VENUES */}
        {venues.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">Aucun site publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {venues.map((venue) => (
              <div key={venue._id} className="usm-card rounded-3xl p-6 space-y-6">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-usm-blue-soft">
                  {venue.image ? (
                    <Image src={venue.image} alt={venue.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-usm-blue-primary/40"><MapPin size={32} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
                  <span className="absolute top-4 left-4 bg-usm-blue-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded tracking-wide">
                    {SPORT_LABEL[venue.sport]}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase">{venue.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{venue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div className="bg-usm-blue-soft p-3 rounded-xl flex items-center gap-2">
                    <Users size={16} className="text-usm-blue-primary shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">Capacité</span>
                      <strong>{venue.capacity ? `${venue.capacity.toLocaleString('fr-FR')} places` : '—'}</strong>
                    </div>
                  </div>
                  <div className="bg-usm-blue-soft p-3 rounded-xl flex items-center gap-2">
                    <Compass size={16} className="text-usm-blue-primary shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase">Portes</span>
                      <strong>{venue.gates || '—'}</strong>
                    </div>
                  </div>
                </div>

                {venue.services.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {venue.services.map((s) => (
                      <span key={s} className="text-[10px] font-bold text-usm-blue-primary bg-usm-blue-primary/10 px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                )}

                {(venue.address || venue.directions) && (
                  <div className="space-y-1 text-xs text-slate-500 border-t border-usm-border pt-4">
                    <strong className="text-usm-blue-dark block flex items-center gap-1.5"><MapPin size={12} className="text-usm-blue-primary" /> Accès & itinéraire</strong>
                    {venue.address && <p>{venue.address}</p>}
                    {venue.directions && <p>{venue.directions}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SAFETY PROTOCOLS */}
        {content && content.safetyRules && content.safetyRules.length > 0 && (
          <section className="usm-card rounded-3xl p-6 md:p-10 space-y-6">
            <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase border-b border-usm-border pb-4 flex items-center gap-2">
              <Shield className="text-usm-blue-primary" size={20} />
              Protocoles de sécurité matchday
            </h3>
            {content.safetyIntro && <p className="text-xs text-slate-500 leading-relaxed">{content.safetyIntro}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500 leading-relaxed">
              {content.safetyRules.map((rule, i) => (
                <div key={i} className="space-y-2">
                  <strong className="text-usm-blue-dark flex items-center gap-1.5"><ShieldCheck size={13} className="text-usm-blue-primary" /> {rule.title}</strong>
                  <p>{rule.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
