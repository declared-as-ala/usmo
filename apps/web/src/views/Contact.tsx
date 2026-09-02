'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/i18n';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

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
      cta: tr(language, 'Call now', 'Appeler', 'اتصال'),
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
    { label: 'Facebook', href: clubSettings.facebook, icon: FacebookIcon },
    { label: 'Instagram', href: clubSettings.instagram, icon: InstagramIcon },
    { label: 'YouTube', href: clubSettings.youtube, icon: YoutubeIcon },
    { label: 'X / Twitter', href: clubSettings.twitter, icon: XIcon },
  ].filter((s) => s.href);

  return (
    <main className="usm-premium-bg min-h-screen pb-24 pt-24 text-usm-blue-dark lg:pt-28">
      {/* HERO */}
      <section className="relative mx-4 overflow-hidden rounded-3xl border border-usm-border sm:mx-6 lg:mx-auto lg:max-w-6xl">
        <div className="absolute inset-0 bg-usm-blue-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,99,255,0.35),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(212,175,55,0.18),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-usm-accent-gold/40 bg-usm-accent-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-usm-accent-gold">
            <Mail size={13} /> {tr(language, 'Get in touch', 'Contact', 'اتصل بنا')}
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-3xl font-black uppercase leading-tight tracking-wide text-white sm:text-5xl">
            {tr(language, 'Contact Union Sportive Monastirienne', "Contacter l'Union Sportive Monastirienne", 'اتصل بالاتحاد الرياضي المنستيري')}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">
            {tr(
              language,
              'Questions about matches, membership, the boutique or partnerships? Reach the club directly below.',
              'Une question sur les matchs, l’abonnement, la boutique ou un partenariat ? Contactez le club directement ci-dessous.',
              'هل لديك سؤال حول المباريات أو الاشتراك أو المتجر أو الشراكات؟ تواصل مع النادي مباشرة أدناه.'
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* INFO CARDS */}
        <div className="grid gap-5 sm:grid-cols-3">
          {infoCards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : undefined}
              rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
              className="usm-card group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all hover:-translate-y-1 hover:border-usm-blue-primary/50 hover:shadow-2xl hover:shadow-usm-blue-primary/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-usm-blue-primary/10 text-usm-blue-primary transition-colors group-hover:bg-usm-blue-primary group-hover:text-white">
                <card.icon size={20} />
              </span>
              <span className="mt-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{card.label}</span>
              <span className="mt-1.5 break-words text-base font-black text-usm-blue-dark">{card.value}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-usm-blue-primary">
                {card.cta} <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          ))}
        </div>

        {/* MAP + SOCIAL */}
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="usm-card overflow-hidden rounded-3xl lg:col-span-3">
            <div className="border-b border-usm-border px-6 py-5">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-usm-blue-dark">
                {tr(language, 'Find us', 'Nous trouver', 'موقعنا')}
              </h2>
            </div>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="group relative flex h-72 flex-col items-center justify-center gap-4 overflow-hidden bg-usm-blue-dark sm:h-80"
            >
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(13,99,255,0.4),transparent_60%)]" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-usm-blue-primary text-white shadow-[0_20px_50px_-15px_rgba(13,99,255,0.7)] transition-transform group-hover:scale-110">
                <MapPin size={28} />
              </span>
              <div className="relative text-center">
                <p className="max-w-xs px-6 text-sm font-bold text-white">{clubSettings.address}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-usm-blue-light">
                  {tr(language, 'Get directions', 'Itinéraire', 'الاتجاهات')}
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </a>
          </div>

          <div className="usm-card flex flex-col rounded-3xl p-6 lg:col-span-2">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-usm-blue-dark">
              {tr(language, 'Follow the club', 'Suivre le club', 'تابع النادي')}
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {tr(
                language,
                'Live updates, match-day content and behind-the-scenes moments.',
                'Actualités en direct, contenus jour de match et coulisses du club.',
                'تحديثات مباشرة ومحتوى يوم المباراة وكواليس النادي.'
              )}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {socialLinks.length === 0 ? (
                <p className="text-xs text-slate-400">
                  {tr(language, 'No social links configured yet.', 'Aucun réseau social configuré pour le moment.', 'لا توجد روابط تواصل اجتماعي بعد.')}
                </p>
              ) : (
                socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-usm-border bg-usm-blue-soft/40 px-4 py-3 text-sm font-bold text-usm-blue-dark transition-all hover:border-usm-blue-primary/50 hover:bg-usm-blue-primary/5"
                  >
                    <span className="flex items-center gap-3 text-usm-blue-primary">
                      <s.icon /> <span className="text-usm-blue-dark">{s.label}</span>
                    </span>
                    <ArrowUpRight size={15} className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-usm-blue-primary" />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
