'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/i18n';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export const Contact: React.FC = () => {
  const { language, clubSettings } = useApp();

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clubSettings.address)}`;

  const infoCards = [
    {
      icon: MapPin,
      label: tr(language, 'Address', 'Adresse', 'العنوان'),
      value: clubSettings.address,
      href: mapsHref,
      cta: tr(language, 'Open in Maps', 'Ouvrir dans Maps', 'فتح في الخرائط'),
    },
    {
      icon: Phone,
      label: tr(language, 'Phone', 'Téléphone', 'الهاتف'),
      value: clubSettings.contactPhone,
      href: `tel:${clubSettings.contactPhone.replace(/\s+/g, '')}`,
      cta: tr(language, 'Call', 'Appeler', 'اتصال'),
    },
    {
      icon: Mail,
      label: tr(language, 'Email', 'E-mail', 'البريد الإلكتروني'),
      value: clubSettings.contactEmail,
      href: `mailto:${clubSettings.contactEmail}`,
      cta: tr(language, 'Send an email', 'Envoyer un e-mail', 'إرسال بريد'),
    },
  ];

  const socialLinks = [
    { label: 'Facebook', href: clubSettings.facebook },
    { label: 'Instagram', href: clubSettings.instagram },
    { label: 'YouTube', href: clubSettings.youtube },
  ].filter((s) => s.href);

  return (
    <main className="min-h-screen usm-premium-bg text-usm-blue-dark">
      <header className="border-b border-[#DDE8F8] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/25 bg-usm-blue-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-usm-blue-primary">
            <Mail size={13} /> {tr(language, 'Get in touch', 'Contact', 'اتصل بنا')}
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
            {tr(language, 'Contact Union Sportive Monastirienne', "Contacter l'Union Sportive Monastirienne", 'اتصل بالاتحاد الرياضي المنستيري')}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#5B6B82]">
            {tr(
              language,
              'Questions about matches, membership, the boutique or partnerships? Reach the club directly below.',
              'Une question sur les matchs, l’abonnement, la boutique ou un partenariat ? Contactez le club directement ci-dessous.',
              'هل لديك سؤال حول المباريات أو الاشتراك أو المتجر أو الشراكات؟ تواصل مع النادي مباشرة أدناه.'
            )}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {infoCards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : undefined}
              rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
              className="group flex flex-col rounded-2xl border border-[#DDE8F8] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-usm-blue-primary/40 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-usm-blue-primary/10 text-usm-blue-primary">
                <card.icon size={19} />
              </span>
              <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#5B6B82]">{card.label}</span>
              <span className="mt-1.5 break-words text-sm font-bold text-usm-blue-dark">{card.value}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-usm-blue-primary">
                {card.cta} <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-10 rounded-2xl border border-[#DDE8F8] bg-white p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-usm-blue-dark">
              {tr(language, 'Follow the club', 'Suivre le club', 'تابع النادي')}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DDE8F8] px-4 py-2 text-xs font-bold text-usm-blue-dark transition-colors hover:border-usm-blue-primary hover:text-usm-blue-primary"
                >
                  <ExternalLink size={13} /> {s.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
