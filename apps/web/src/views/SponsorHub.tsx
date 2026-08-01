'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, BarChart3, Check, ChevronRight, Download, ExternalLink,
  Globe2, Handshake, LineChart, Mail, ShieldCheck, Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { SponsorLogo } from '../components/Common/SponsorLogo';

type Sponsor = {
  _id: string; name: string; slug?: string; category: string; logo?: string; story?: string;
  storyAr?: string; storyFr?: string; link?: string;
  metrics?: { impressions: number; clicks: number; ctr: number };
};

const emptyLeadForm = { company: '', contactName: '', email: '', objective: 'Partenaire majeur', message: '' };

const categoryNames: Record<string, string> = {
  Main: 'Partenaire majeur', Official: 'Partenaire officiel', Technical: 'Partenaire technique',
  Media: 'Partenaire média', Academy: 'Partenaire académie',
};

const CATEGORY_FILTERS = ['all', 'Main', 'Official', 'Technical', 'Media', 'Academy'] as const;

export const SponsorHub = () => {
  const { language } = useApp();
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [activeTab, setActiveTab] = useState<'public' | 'dashboard'>('public');
  const [categoryFilter, setCategoryFilter] = useState<(typeof CATEGORY_FILTERS)[number]>('all');
  const [selectedSponsorId, setSelectedSponsorId] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSponsors().then((data: Sponsor[]) => {
      setSponsors(data);
      setSelectedSponsorId(current => current || data[0]?._id || '');
    }).catch(() => setSponsors([])).finally(() => setLoading(false));
  }, []);

  const activeSponsor = useMemo(
    () => sponsors.find(s => s._id === selectedSponsorId) || sponsors[0],
    [sponsors, selectedSponsorId],
  );

  const visibleSponsors = useMemo(
    () => categoryFilter === 'all' ? sponsors : sponsors.filter(s => s.category === categoryFilter),
    [sponsors, categoryFilter],
  );

  const storyOf = (sponsor: Sponsor) => language === 'ar'
    ? sponsor.storyAr || sponsor.story
    : language === 'fr' ? sponsor.storyFr || sponsor.story : sponsor.story;

  const downloadKit = () => router.push('/telechargements?category=press-kit');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitting(true);
    setLeadError('');
    try {
      await api.createPartnerLead(leadForm);
      setContactSubmitted(true);
    } catch (err: any) {
      setLeadError(err.message || 'Échec de l’envoi. Merci de réessayer.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  return <div className="min-h-screen bg-white text-usm-blue-dark">
    <section className="relative overflow-hidden bg-gradient-to-b from-usm-blue-soft to-white pb-14 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-usm-blue-primary/10 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/30 bg-usm-blue-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-usm-blue-primary"><Sparkles size={13}/> L’écosystème USM</span>
        <h1 className="mt-6 max-w-3xl text-4xl font-black uppercase leading-[.95] tracking-tight sm:text-6xl lg:text-7xl">Nos <span className="text-usm-blue-primary">Partenaires</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#5B6B82] sm:text-lg">Des marques ambitieuses réunies autour d’une même énergie : faire rayonner l’Union Sportive Monastirienne, sur le terrain et bien au-delà.</p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Stat value={`${sponsors.length || '—'}`} label="Partenaires actifs" icon={<Handshake size={18}/>}/>
          <Stat value="2" label="Disciplines majeures" icon={<ShieldCheck size={18}/>}/>
          <Stat value="1923" label="Depuis toujours" icon={<LineChart size={18}/>}/>
          <Stat value="Global" label="Rayonnement" icon={<Globe2 size={18}/>}/>
        </div>
      </div>
    </section>

    <nav aria-label="Sections partenaires" className="sticky top-20 z-30 border-b border-usm-border bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <Tab active={activeTab === 'public'} onClick={() => setActiveTab('public')} icon={<Handshake size={16}/>} label="Nos partenaires"/>
        <Tab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 size={16}/>} label="Espace performance"/>
      </div>
    </nav>

    {activeTab === 'public' ? <main>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-usm-blue-primary">Ils nous font confiance</p><h2 className="mt-2 text-2xl font-black sm:text-4xl">Des alliances qui font avancer le club.</h2></div>
          <p className="max-w-md text-sm leading-6 text-[#5B6B82]">Chaque partenariat est une histoire de confiance, de performance et d’impact durable.</p>
        </div>

        {!loading && sponsors.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORY_FILTERS.filter(c => c === 'all' || sponsors.some(s => s.category === c)).map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`min-h-10 rounded-full px-4 text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
                  categoryFilter === c ? 'bg-usm-blue-primary text-white shadow-[0_10px_25px_-10px_rgba(13,99,255,0.6)]' : 'border border-usm-border bg-white text-[#5B6B82] hover:border-usm-blue-primary/50 hover:text-usm-blue-primary'
                }`}
              >
                {c === 'all' ? 'Tous' : categoryNames[c] || c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-80 animate-pulse rounded-2xl bg-usm-blue-soft"/>)}</div>
        ) : visibleSponsors.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleSponsors.map((sp, index) => {
            const Wrapper = sp.slug ? Link : 'div';
            const wrapperProps = sp.slug ? { href: `/sponsors/${sp.slug}` } : {};
            return (
            <Wrapper key={sp._id} {...(wrapperProps as any)} className="group relative flex min-h-80 flex-col overflow-hidden rounded-2xl border border-usm-border bg-white shadow-[0_18px_45px_-32px_rgba(13,99,255,0.2)] transition duration-300 hover:-translate-y-1.5 hover:border-usm-blue-primary/50 hover:shadow-[0_28px_60px_-28px_rgba(13,99,255,0.35)]">
              <div className="relative m-2 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-usm-blue-soft/60 p-7">
                <div className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#5B6B82] shadow-sm">{categoryNames[sp.category] || sp.category}</div>
                <SponsorLogo name={sp.name} logo={sp.logo} size={78} variant="dark" className="max-h-[78px] max-w-[78%] transition-transform duration-300 group-hover:scale-105"/>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
                <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold">{sp.name}</h3><span className="font-mono text-[10px] text-usm-blue-primary">0{index + 1}</span></div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5B6B82]">{storyOf(sp)}</p>
                <span className="mt-auto flex min-h-11 items-center justify-between border-t border-usm-border pt-4 text-xs font-bold text-[#5B6B82] transition group-hover:text-usm-blue-primary"><span>Découvrir la marque</span><ExternalLink size={14}/></span>
              </div>
            </Wrapper>
            );
          })}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-usm-blue-primary/30 bg-usm-blue-soft/40 p-14 text-center"><Handshake className="mx-auto text-usm-blue-primary" size={36}/><h3 className="mt-4 font-bold">Aucun partenaire dans cette catégorie pour le moment.</h3></div>
        )}
      </section>

      <section className="border-y border-usm-border bg-usm-blue-soft">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:py-24">
          <div>
            <span className="text-xs font-bold uppercase tracking-[.2em] text-usm-blue-primary">Construisons la suite ensemble</span>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight sm:text-5xl">Votre marque au cœur des émotions USM.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#5B6B82]">Associez votre entreprise à un club historique, une communauté engagée et des moments sportifs qui rassemblent toute une région.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2"><Benefit text="Visibilité matchday & digitale"/><Benefit text="Contenus de marque exclusifs"/><Benefit text="Football & basketball"/><Benefit text="Mesure claire des performances"/></div>
            <button onClick={downloadKit} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl border border-usm-blue-primary/40 bg-white px-5 text-xs font-bold text-usm-blue-primary transition hover:bg-usm-blue-primary hover:text-white"><Download size={15}/> Télécharger le media kit</button>
          </div>
          <div className="rounded-3xl border border-usm-border bg-white p-5 shadow-[0_24px_60px_-30px_rgba(13,99,255,0.25)] sm:p-7">
            <div className="flex items-center gap-3 border-b border-usm-border pb-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-usm-blue-primary text-white"><Mail size={19}/></span><div><h3 className="font-bold">Parlons de votre projet</h3><p className="text-xs text-[#7A8AA0]">Réponse de notre équipe sous 48h</p></div></div>
            {contactSubmitted ? <div role="status" className="py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={24}/></span><h4 className="mt-4 font-bold">Demande envoyée</h4><p className="mt-2 text-sm text-[#7A8AA0]">Notre équipe partenariat vous contactera prochainement.</p></div>
            : <form onSubmit={handleLeadSubmit} className="mt-6 space-y-4">
                {leadError && <p className="text-xs text-red-600">{leadError}</p>}
                <Field label="Entreprise"><input required type="text" value={leadForm.company} onChange={e => setLeadForm(f => ({...f, company: e.target.value}))} className="partner-input"/></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nom et prénom"><input required type="text" value={leadForm.contactName} onChange={e => setLeadForm(f => ({...f, contactName: e.target.value}))} className="partner-input"/></Field>
                  <Field label="E-mail professionnel"><input required type="email" value={leadForm.email} onChange={e => setLeadForm(f => ({...f, email: e.target.value}))} className="partner-input"/></Field>
                </div>
                <Field label="Votre objectif">
                  <select value={leadForm.objective} onChange={e => setLeadForm(f => ({...f, objective: e.target.value}))} className="partner-input">
                    <option>Partenaire majeur</option><option>Activation digitale</option><option>Partenaire technique</option><option>Académie & jeunesse</option>
                  </select>
                </Field>
                <Field label="Votre message"><textarea rows={4} value={leadForm.message} onChange={e => setLeadForm(f => ({...f, message: e.target.value}))} className="partner-input resize-none"/></Field>
                <button disabled={leadSubmitting} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-usm-blue-primary px-5 text-sm font-bold text-white transition hover:bg-usm-blue-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usm-blue-primary">
                  {leadSubmitting ? 'Envoi…' : 'Envoyer ma demande'} <ArrowRight size={16}/>
                </button>
              </form>}
          </div>
        </div>
      </section>
    </main> : <Dashboard sponsors={sponsors} active={activeSponsor} selected={selectedSponsorId} onSelect={setSelectedSponsorId}/>}
  </div>;
};

function Stat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-usm-border bg-white p-4 shadow-[0_10px_25px_-18px_rgba(13,99,255,0.25)] sm:p-5"><span className="text-usm-blue-primary">{icon}</span><strong className="mt-3 block text-xl font-black sm:text-2xl">{value}</strong><span className="mt-1 block text-[10px] uppercase tracking-wider text-[#7A8AA0]">{label}</span></div>; }
function Tab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button onClick={onClick} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-xs font-bold transition cursor-pointer ${active ? 'bg-usm-blue-primary text-white' : 'text-[#5B6B82] hover:bg-usm-blue-soft hover:text-usm-blue-primary'}`}>{icon}{label}</button>; }
function Benefit({ text }: { text: string }) { return <div className="flex items-center gap-3 rounded-xl border border-usm-border bg-white p-4 text-sm text-[#071A30]"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-usm-blue-primary/15 text-usm-blue-primary"><Check size={13}/></span>{text}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-[#5B6B82]">{label}</span>{children}</label>; }

function Dashboard({ sponsors, active, selected, onSelect }: { sponsors: Sponsor[]; active?: Sponsor; selected: string; onSelect: (id: string) => void }) {
  if (!active) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-[#7A8AA0]">Aucune campagne active.</div>;
  const metrics = active.metrics || { impressions: 0, clicks: 0, ctr: 0 };
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8"><aside className="rounded-2xl border border-usm-border bg-white p-4"><p className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-usm-blue-primary">Campagnes actives</p><div className="space-y-2">{sponsors.map(s => <button key={s._id} onClick={() => onSelect(s._id)} className={`flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-bold transition cursor-pointer ${selected === s._id ? 'bg-usm-blue-primary text-white' : 'bg-usm-blue-soft/60 text-[#5B6B82] hover:bg-usm-blue-soft'}`}>{s.name}<ChevronRight size={14}/></button>)}</div></aside><section className="rounded-2xl border border-usm-border bg-white p-5 sm:p-7"><div className="flex items-center gap-4 border-b border-usm-border pb-6"><div className="flex h-16 w-28 items-center justify-center rounded-xl bg-usm-blue-soft/60 p-3"><SponsorLogo name={active.name} logo={active.logo} size={42} variant="dark" className="max-w-full"/></div><div><p className="text-[10px] uppercase tracking-wider text-usm-blue-primary">Performance partenaire</p><h2 className="mt-1 text-xl font-black">{active.name}</h2></div></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="Impressions" value={metrics.impressions.toLocaleString()}/><Metric label="Clics" value={metrics.clicks.toLocaleString()}/><Metric label="Taux de clic" value={`${metrics.ctr}%`}/></div><div className="mt-6 rounded-xl border border-usm-border bg-white p-6"><div className="flex items-center gap-2 text-sm font-bold"><LineChart size={17} className="text-usm-blue-primary"/> Répartition des impressions</div><div className="mt-7 space-y-5"><Progress label="Site officiel" value={55}/><Progress label="Match Center" value={30}/><Progress label="Fan Zone" value={15}/></div></div></section></main>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-usm-border bg-white p-5"><span className="text-[10px] uppercase tracking-wider text-[#7A8AA0]">{label}</span><strong className="mt-2 block text-2xl font-black text-usm-blue-primary">{value}</strong></div>; }
function Progress({ label, value }: { label: string; value: number }) { return <div><div className="mb-2 flex justify-between text-xs text-[#5B6B82]"><span>{label}</span><span>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-usm-blue-soft"><div className="h-full rounded-full bg-usm-blue-primary" style={{width: `${value}%`}}/></div></div>; }
