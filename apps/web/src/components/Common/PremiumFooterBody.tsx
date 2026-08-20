'use client';

import Link from 'next/link';
import { ArrowUpRight, Download, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Logo } from './Logo';
import { tr, AppLanguage } from '../../utils/i18n';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

type Props = {
  language: AppLanguage;
  year: number;
  settings: { facebook?: string; instagram?: string; address?: string; contactPhone?: string; contactEmail?: string };
  navigate: (screen: string) => void;
  install: () => void;
};

export function PremiumFooterBody({ language, year, settings, navigate, install }: Props) {
  const ar = language === 'ar';

  const linkGroups = [
    {
      title: tr(language, 'The Club', 'Le club', 'النادي'),
      links: [
        [tr(language, 'News', 'Actualités', 'الأخبار'), 'news'],
        [tr(language, 'History & Honors', 'Histoire & palmarès', 'التاريخ والتتويجات'), 'histoire']
      ]
    },
    {
      title: tr(language, 'USM Experience', 'Expérience USM', 'تجربة الاتحاد'),
      links: [
        [tr(language, 'Fan Zone', 'Fan Zone', 'منطقة الأحباء'), 'fanzone'],
        [tr(language, 'USM Media', 'USM Media', 'إعلام الاتحاد'), 'media'],
        [tr(language, 'Stadium Guide', 'Guide du stade', 'دليل الملعب'), 'stadium']
      ]
    },
    {
      title: tr(language, 'Institutional', 'Institutionnel', 'المؤسسة'),
      links: [
        [tr(language, 'Sponsors', 'Partenaires', 'المستشهرون'), 'sponsors'],
        [tr(language, 'Contact Us', 'Nous contacter', 'اتصل بنا'), 'contact']
      ]
    },
  ];

  return (
    <div className="relative overflow-hidden bg-usm-blue-dark">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-usm-blue-primary/10 blur-[120px]"/>
      <div className="mx-auto max-w-7xl px-4 pb-7 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <button onClick={() => navigate('home')} className="flex min-h-12 items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-usm-blue-primary">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-usm-blue-primary/25 bg-usm-blue-primary/10"><Logo size={39} variant="color"/></span>
              <span>
                <strong className="block text-lg font-black tracking-wide text-white">US MONASTIR</strong>
                <small className="text-[10px] uppercase tracking-[.18em] text-usm-blue-light">
                  {tr(language, 'Since 1923', 'Depuis 1923', 'منذ 1923')}
                </small>
              </span>
            </button>
            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
              {ar
                ? 'الاتحاد الرياضي المنستيري، تاريخ من الشغف والطموح والإنجازات في كرة القدم وكرة السلة.'
                : tr(
                    language,
                    'More than a club, a shared history. Union Sportive Monastirienne has made a whole city vibrate since 1923.',
                    'Plus qu’un club, une histoire partagée. L’Union Sportive Monastirienne fait vibrer toute une ville depuis 1923.',
                    'الاتحاد الرياضي المنستيري، تاريخ من الشغف والطموح والإنجازات في كرة القدم وكرة السلة.'
                  )}
            </p>
            <div className="mt-6 flex gap-2">
              <Social href="https://www.facebook.com/usmonastir.official/" label="Facebook"><FacebookIcon/></Social>
              <Social href="https://www.instagram.com/usmonastir.official" label="Instagram"><InstagramIcon/></Social>
              <Social href="https://x.com/USMonastir_1923" label="X"><XIcon/></Social>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {linkGroups.map(group => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-xs font-extrabold uppercase tracking-[.16em] text-white">{group.title}</h2>
                <span className="mt-3 block h-0.5 w-7 bg-usm-blue-primary"/>
                <ul className="mt-5 space-y-3">
                  {group.links.map(([label, screen]) => (
                    <li key={screen}>
                      <button onClick={() => navigate(screen)} className="inline-flex min-h-6 items-center gap-1 text-sm text-slate-400 transition hover:translate-x-1 hover:text-usm-blue-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-usm-blue-primary">
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-b border-white/10 py-9 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-3">
            <Contact
              icon={<MapPin size={17}/>}
              label={tr(language, 'Our Address', 'Notre adresse', 'العنوان')}
              value={settings.address || tr(language, 'Monastir, Tunisia', 'Monastir, Tunisie', 'المنستير، تونس')}
            />
            <Contact
              icon={<Phone size={17}/>}
              label={tr(language, 'Phone', 'Téléphone', 'الهاتف')}
              value={settings.contactPhone || '—'}
            />
            <Contact
              icon={<Mail size={17}/>}
              label={tr(language, 'E-mail', 'E-mail', 'البريد الإلكتروني')}
              value={settings.contactEmail || '—'}
            />
          </div>
          <div className="rounded-2xl border border-usm-blue-primary/20 bg-usm-blue-primary/10 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-usm-blue-primary"><Send size={17}/></span>
              <div>
                <h2 className="text-sm font-extrabold text-white">
                  {tr(language, 'Stay at the Heart of the Club', 'Restez au cœur du club', 'ابق في قلب النادي')}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {tr(language, 'News, matches, and official announcements.', 'Actualités, matchs et annonces officielles.', 'الأخبار، المباريات والإعلانات الرسمية.')}
                </p>
              </div>
            </div>
            <form onSubmit={e => e.preventDefault()} className="mt-4 flex">
              <label htmlFor="footer-email" className="sr-only">
                {tr(language, 'Your email address', 'Votre adresse e-mail', 'عنوان بريدك الإلكتروني')}
              </label>
              <input
                id="footer-email"
                required
                type="email"
                placeholder={tr(language, 'Your email address', 'Votre adresse e-mail', 'عنوان بريدك الإلكتروني')}
                className="min-w-0 flex-1 rounded-l-xl border border-white/10 bg-usm-blue-dark px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-usm-blue-primary"
              />
              <button aria-label={tr(language, 'Subscribe to newsletter', 'S’inscrire à la newsletter', 'الاشتراك في النشرة الإخبارية')} className="grid min-h-12 w-12 place-items-center rounded-r-xl bg-usm-blue-primary transition hover:bg-usm-blue-hover">
                <ArrowUpRight size={17}/>
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Union Sportive Monastirienne. {tr(language, 'All rights reserved.', 'Tous droits réservés.', 'جميع الحقوق محفوظة.')}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/confidentialite" className="hover:text-usm-blue-light">
              {tr(language, 'Privacy Policy', 'Confidentialité', 'سياسة الخصوصية')}
            </Link>
            <Link href="/conditions-utilisation" className="hover:text-usm-blue-light">
              {tr(language, 'Terms of Use', 'Conditions d’utilisation', 'شروط الاستخدام')}
            </Link>
            <Link href="/cookies" className="hover:text-usm-blue-light">
              {tr(language, 'Cookies', 'Cookies', 'ملفات تعريف الارتباط')}
            </Link>
            <button onClick={install} className="flex items-center gap-1.5 font-bold text-usm-blue-light hover:text-white">
              <Download size={13}/> {tr(language, 'Install the Application', 'Installer l’application', 'تثبيت التطبيق')}
            </button>
          </div>
        </div>

        <div className="flex justify-center pt-5">
          <a
            href="https://ibrandtunisia.tn/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.03] py-2 pe-5 ps-2 transition-all hover:-translate-y-0.5 hover:border-usm-accent-gold/40 hover:bg-white/[.06]"
          >
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ibrand-footer.jpg" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {tr(language, 'Powered by', 'Propulsé par', 'بدعم من')}{' '}
              <span className="font-black text-slate-300 group-hover:text-usm-accent-gold transition-colors">iBrand Tunisia</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-slate-300 transition hover:border-usm-blue-primary/50 hover:bg-usm-blue-primary/10 hover:text-usm-blue-light">{children}</a>; }
function Contact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex gap-3"><span className="mt-0.5 text-usm-blue-primary">{icon}</span><div className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span><span className="mt-1 block break-words text-xs leading-5 text-slate-300">{value}</span></div></div>; }
