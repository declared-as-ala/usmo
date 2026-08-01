'use client';

import { ArrowUpRight, Handshake, MoveRight, ShieldCheck, Sparkles } from 'lucide-react';
import { SponsorLogo } from './SponsorLogo';

type Partner = { _id: string; name: string; category: string; logo?: string; link?: string; story?: string; storyFr?: string; storyAr?: string };
type Props = { sponsors: Partner[]; language: string; onExplore: () => void };
const labels: Record<string, string> = { Main: 'Partenaire majeur', Official: 'Partenaire officiel', Technical: 'Partenaire technique', Media: 'Partenaire média', Academy: 'Partenaire académie' };

export function PartnerShowcase({ sponsors, language, onExplore }: Props) {
  const main = sponsors.find(s => s.category === 'Main') || sponsors[0];
  const others = sponsors.filter(s => s._id !== main?._id).slice(0, 5);
  const ar = language === 'ar';
  const story = main && (ar ? main.storyAr : language === 'fr' ? main.storyFr || main.story : main.story);

  return <section className="relative mb-16 overflow-hidden rounded-[2rem] border border-[#0D63FF]/20 bg-white shadow-[0_36px_110px_-55px_rgba(0,87,255,.85)]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(0,87,255,.38),transparent_34%),radial-gradient(circle_at_7%_92%,rgba(244,196,48,.15),transparent_25%)]"/>
    <div className="pointer-events-none absolute inset-0 opacity-[.05] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:56px_56px]"/>
    <div className="relative px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header className="grid gap-6 border-b border-usm-border pb-9 lg:grid-cols-[1fr_420px] lg:items-end">
        <div><span className="inline-flex items-center gap-2 rounded-full border border-[#0D63FF]/25 bg-[#0D63FF]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-[#0D63FF]"><Sparkles size={13}/> {ar ? 'شركاؤنا' : 'Nos partenaires'}</span><h2 className="mt-4 max-w-2xl font-display text-3xl font-black uppercase leading-[.92] tracking-tight text-usm-blue-dark sm:text-5xl">{ar ? 'معًا، نصنع أداءً يتجاوز الملعب.' : 'Ensemble, nous allons plus loin.'}</h2></div>
        <p className="max-w-md text-sm leading-6 text-slate-600">{ar ? 'علامات تجارية رائدة تدعم طموح الاتحاد المنستيري وتشاركنا بناء مستقبل رياضي أقوى.' : 'Des entreprises de référence partagent notre ambition et contribuent chaque jour au rayonnement de l’US Monastir.'}</p>
      </header>

      {main && <a href={main.link || '#'} target={main.link ? '_blank' : undefined} rel="noreferrer" className="group mt-7 grid overflow-hidden rounded-2xl border border-usm-border bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#0D63FF]/55 lg:grid-cols-[340px_1fr]">
        <div className="relative flex min-h-56 items-center justify-center bg-white p-10"><span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0D63FF]">{ar ? 'الشريك الرئيسي' : 'Partenaire principal'}</span><SponsorLogo name={main.name} logo={main.logo} size={92} variant="dark" className="max-h-[92px] max-w-[75%] transition duration-300 group-hover:scale-105"/></div>
        <div className="relative flex flex-col justify-between overflow-hidden p-6 sm:p-9"><div className="absolute -right-8 -top-8 text-[150px] font-black leading-none text-usm-blue-dark/[.025]">01</div><div><div className="flex items-center gap-2 text-xs font-bold text-[#0D63FF]"><ShieldCheck size={15}/> {labels[main.category] || main.category}</div><h3 className="mt-4 font-display text-2xl font-black uppercase text-usm-blue-dark sm:text-4xl">{main.name}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{story}</p></div><span className="mt-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-usm-blue-dark">{ar ? 'اكتشف الشريك' : 'Découvrir le partenaire'} <ArrowUpRight size={15} className="text-[#0D63FF]"/></span></div>
      </a>}

      {others.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{others.map(partner => <a key={partner._id} href={partner.link || '#'} target={partner.link ? '_blank' : undefined} rel="noreferrer" aria-label={`${partner.name} — ${labels[partner.category] || partner.category}`} className="group flex min-h-44 flex-col overflow-hidden rounded-xl border border-usm-border bg-white transition duration-300 hover:-translate-y-1 hover:border-[#0D63FF] hover:shadow-xl hover:shadow-blue-950/40"><div className="flex flex-1 items-center justify-center px-6 py-7"><SponsorLogo name={partner.name} logo={partner.logo} size={54} variant="dark" className="max-h-[54px] max-w-[82%] transition duration-300 group-hover:scale-105"/></div><div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3"><span className="truncate text-[10px] font-extrabold uppercase tracking-wide text-slate-600">{labels[partner.category] || partner.category}</span><ArrowUpRight size={13} className="shrink-0 text-[#0057ff]"/></div></a>)}</div>}

      <div className="mt-7 flex flex-col gap-5 rounded-2xl border border-[#0D63FF]/20 bg-[#0D63FF]/[.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#0D63FF] text-white"><Handshake size={21}/></span><div><h3 className="font-extrabold text-usm-blue-dark">{ar ? 'اكتبوا الفصل القادم معنا' : 'Écrivons la prochaine victoire ensemble.'}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{ar ? 'اربط علامتك التجارية بجمهور شغوف ونادٍ تاريخي.' : 'Associez votre marque à une communauté passionnée et à un club historique.'}</p></div></div><button onClick={onExplore} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0D63FF] px-5 text-xs font-bold text-white transition hover:bg-usm-blue-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D63FF]">{ar ? 'عرض جميع الشركاء' : 'Découvrir les partenariats'} <MoveRight size={15}/></button></div>
      {sponsors.length === 0 && <div className="py-12 text-center text-sm text-slate-500">{ar ? 'سيتم عرض شركائنا قريبًا.' : 'Nos partenaires seront bientôt présentés ici.'}</div>}
    </div>
  </section>;
}
