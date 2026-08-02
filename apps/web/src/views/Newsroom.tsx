'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarDays, ChevronRight, Clock3, Eye, Mail, MapPin,
  Play, ShieldCheck, Sparkles, Star, Trophy, Users,
} from 'lucide-react';
import { api } from '../lib/api-client';
import { PremiumHeroBackground } from '../components/Common/PremiumHeroBackground';

type Article = {
  _id?: string; id?: string; slug?: string; title: string; titleFr?: string; summary: string;
  summaryFr?: string; image: string; category: string; date: string; readTime: string;
  author?: string; official?: boolean; featured?: boolean; isBreaking?: boolean;
  showOnNewsHero?: boolean; contentType?: 'article' | 'video' | 'analysis'; views?: number;
  season?: string; videoEmbed?: string;
};

const categories = ['Tout', 'Football', 'Basketball', 'Club', 'Academy', 'Announcements', 'Interviews', 'Matchday', 'Transferts', 'Sponsors'];
const seasons = ['2025/2026', '2024/2025', '2023/2024', '2022/2023', '2021/2022'];

const articleHref = (article: Article) => `/actualites/${article.slug || article._id || article.id}`;
const titleOf = (article: Article) => article.titleFr || article.title;
const summaryOf = (article: Article) => article.summaryFr || article.summary;
const categoryLabel = (category: string) => category === 'Academy' ? 'Académie' : category === 'Announcements' ? 'Communiqué' : category;
const formatViews = (views = 0) => views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views);

/** Falls back to a branded placeholder while an article awaits real photography from the admin Media Library. */
function ArticleImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  if (!src) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-usm-blue-dark to-usm-blue-primary/60`}>
        <Trophy size={28} className="text-white/25" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

function Badge({ category }: { category: string }) {
  const tones: Record<string, string> = {
    Basketball: 'bg-orange-400 text-white', Academy: 'bg-emerald-400 text-white',
    Announcements: 'bg-red-500 text-white', Club: 'bg-[#0D63FF] text-white',
  };
  return <span className={`inline-flex rounded-sm px-2 py-1 text-[9px] font-black uppercase tracking-[.12em] ${tones[category] || 'bg-[#0D63FF] text-white'}`}>{categoryLabel(category)}</span>;
}

function Meta({ article, views = false, className = "text-[#5B6B82]" }: { article: Article; views?: boolean; className?: string }) {
  return <div className={`flex flex-wrap items-center gap-3 text-[10px] font-medium ${className}`}>
    <span className="flex items-center gap-1"><CalendarDays size={11} />{article.date}</span>
    <span className="flex items-center gap-1"><Clock3 size={11} />{article.readTime}</span>
    {views && <span className="flex items-center gap-1"><Eye size={11} />{formatViews(article.views)}</span>}
  </div>;
}

function NewsCard({ article, editorial = false }: { article: Article; editorial?: boolean }) {
  return <Link href={articleHref(article)} className={`group relative flex min-h-full overflow-hidden rounded-xl border border-[#DDE8F8] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#0D63FF] hover:bg-usm-blue-soft ${editorial ? 'min-h-64' : 'flex-col'}`}>
    <div className={`${editorial ? 'absolute inset-0' : 'relative aspect-[16/9]'} overflow-hidden bg-usm-blue-soft`}>
      <ArticleImage src={article.image} alt={titleOf(article)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className={`absolute inset-0 ${editorial ? 'bg-gradient-to-t from-white via-white/55 to-transparent' : 'bg-gradient-to-t from-white/50 to-transparent'}`} />
      <div className="absolute left-3 top-3"><Badge category={editorial ? 'Dossier' : article.category} /></div>
      {article.contentType === 'video' && <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#0D63FF] text-white"><Play size={17} fill="currentColor" /></span>}
    </div>
    <div className={`relative z-10 flex flex-1 flex-col p-4 ${editorial ? 'justify-end pt-32' : ''}`}>
      <h3 className={`${editorial ? 'text-xl' : 'text-[15px]'} font-extrabold leading-snug text-usm-blue-dark transition group-hover:text-[#0D63FF]`}>{titleOf(article)}</h3>
      {!editorial && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#5B6B82]">{summaryOf(article)}</p>}
      <div className="mt-4"><Meta article={article} views={article.contentType === 'video'} /></div>
    </div>
  </Link>;
}

function EmptyState({ error }: { error?: string }) {
  return <div className="col-span-full rounded-xl border border-dashed border-[#DDE8F8] bg-white px-6 py-16 text-center">
    <ShieldCheck className="mx-auto text-[#0D63FF]" size={36} />
    <h3 className="mt-4 text-lg font-bold text-usm-blue-dark">Aucune actualité disponible</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-[#5B6B82]">{error || 'Les nouvelles publications officielles apparaîtront ici.'}</p>
  </div>;
}

function Skeletons() {
  return <>{[0, 1, 2, 3].map(i => <div key={i} className="overflow-hidden rounded-xl border border-[#DDE8F8] bg-white"><div className="skeleton-loader aspect-video"/><div className="space-y-3 p-4"><div className="skeleton-loader h-4 w-3/4 rounded"/><div className="skeleton-loader h-3 w-full rounded"/><div className="skeleton-loader h-3 w-1/2 rounded"/></div></div>)}</>;
}

export function Newsroom() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('Tout');
  const [season, setSeason] = useState('2025/2026');
  const [visible, setVisible] = useState(6);

  useEffect(() => {
    api.getNews({ limit: 100 }).then((data: { news?: Article[] }) => setArticles(data.news || []))
      .catch(() => setError('Impossible de joindre la rédaction pour le moment. Réessayez dans quelques instants.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => category === 'Tout' ? articles : articles.filter(a => a.category === category), [articles, category]);
  const hero = articles.find(a => a.showOnNewsHero) || articles.find(a => a.featured) || articles[0];
  const breaking = articles.find(a => a.isBreaking) || articles.find(a => a.official) || articles[0];
  const featured = articles.filter(a => a.featured).slice(0, 4);
  const mostRead = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const videos = articles.filter(a => a.contentType === 'video' || /interview/i.test(a.category)).slice(0, 3);
  const analyses = articles.filter(a => a.contentType === 'analysis').slice(0, 3);
  const editorial = analyses.length ? analyses : articles.slice(0, 3);

  return <div className="min-h-screen usm-premium-bg text-usm-blue-dark" dir="ltr">
    <section className="relative isolate overflow-hidden border-b border-[#DDE8F8] bg-gradient-to-b from-[#F2F6FC] via-white to-transparent">
      {/* Abstract premium geometric background glows */}
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute left-10 top-20 -z-10 h-[300px] w-[300px] rounded-full bg-indigo-50/30 blur-[80px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-2xl text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0D63FF]/20 bg-[#0D63FF]/5 px-3.5 py-1.5 text-[10px] font-black tracking-[.18em] text-[#0D63FF]"><Sparkles size={11}/> NEWSROOM OFFICIELLE</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl text-[#071A30]">ACTUALITÉS <span className="text-[#0D63FF]">USM</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#5B6B82] sm:text-base">Toute l’actualité du club, les annonces officielles, les interviews et les temps forts du football et du basketball.</p>
        </div>
        {hero && <Link href={articleHref(hero)} className="group mt-8 grid max-w-5xl overflow-hidden rounded-2xl border border-[#DDE8F8] bg-white hover:border-[#0D63FF]/40 shadow-xl transition-all duration-300 md:grid-cols-[1.2fr_.8fr]">
          <div className="relative min-h-[280px] md:min-h-[380px] overflow-hidden"><ArticleImage src={hero.image} alt={titleOf(hero)} className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"/><div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-white/5 to-[#061A3A]/20"/></div>
          <div className="flex flex-col justify-center p-6 sm:p-10 bg-white"><div><Badge category={hero.category}/></div><h2 className="mt-4 text-xl font-black leading-tight sm:text-2xl text-usm-blue-dark transition duration-300 group-hover:text-[#0D63FF]">{titleOf(hero)}</h2><p className="mt-3 line-clamp-3 text-xs leading-5 text-[#5B6B82]">{summaryOf(hero)}</p><div className="mt-4"><Meta article={hero} className="text-[#5B6B82]" /></div><span className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#0D63FF] px-5 py-3 text-xs font-black uppercase text-white transition duration-300 group-hover:bg-[#0052D9] cursor-pointer shadow-md shadow-[#0D63FF]/10">Lire l’article <ArrowRight size={14}/></span></div>
        </Link>}
      </div>
    </section>

    {breaking && <div className="border-b border-[#DDE8F8] bg-usm-blue-soft"><div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-4 py-3 sm:px-6 lg:px-8"><span className="flex shrink-0 items-center gap-2 text-[10px] font-black text-[#0D63FF]"><Star size={13} fill="currentColor"/> À LA UNE</span><p className="min-w-0 flex-1 truncate text-xs text-[#071A30]">{titleOf(breaking)}</p><Link href={articleHref(breaking)} className="hidden shrink-0 items-center gap-1 text-[10px] font-bold text-[#0D63FF] sm:flex">Voir l’annonce <ChevronRight size={13}/></Link></div></div>}

    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0">{categories.map(item => <button key={item} onClick={() => {setCategory(item); setVisible(6);}} className={`min-h-11 shrink-0 rounded-full border px-4 text-[11px] font-bold transition ${category === item ? 'border-[#0D63FF] bg-[#0D63FF] text-white' : 'border-[#DDE8F8] bg-white text-[#071A30] hover:border-[#1d7cff]'}`}>{categoryLabel(item)}</button>)}</div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-11">
          <section><SectionTitle title="À LA UNE" action="Toute la sélection"/>
            <div className="mt-4 grid gap-4 md:grid-cols-2">{loading ? <Skeletons/> : featured.length ? featured.map(a => <NewsCard key={a._id || a.id} article={a}/>) : <EmptyState error={error}/>}</div>
          </section>

          <section><SectionTitle title="DERNIÈRES ACTUALITÉS" action={`${filtered.length} articles`}/>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loading ? <Skeletons/> : filtered.length ? filtered.slice(0, visible).map(a => <NewsCard key={a._id || a.id} article={a}/>) : <EmptyState error={error}/>}</div>
            {visible < filtered.length && <button onClick={() => setVisible(v => v + 6)} className="mx-auto mt-6 flex min-h-11 items-center gap-2 rounded-md border border-[#0D63FF] px-6 text-xs font-black text-[#0D63FF] transition hover:bg-[#0D63FF] hover:text-white">Voir plus <ChevronRight size={14}/></button>}
          </section>

          {videos.length > 0 && <section><SectionTitle title="INTERVIEWS & CONFÉRENCES" action="Voir toutes les vidéos"/><div className="mt-4 grid gap-4 md:grid-cols-3">{videos.map(a => <NewsCard key={a._id || a.id} article={{...a, contentType: 'video'}}/>)}</div></section>}

          <section><SectionTitle title="DOSSIERS & ANALYSES" action="Explorer les dossiers"/><div className="mt-4 grid gap-4 md:grid-cols-3">{editorial.map(a => <NewsCard key={a._id || a.id} article={a} editorial/>)}</div></section>

          <section><SectionTitle title="ARCHIVES PAR SAISON"/><div className="mt-4 flex gap-2 overflow-x-auto pb-2">{seasons.map(s => <button key={s} onClick={() => setSeason(s)} className={`min-h-11 shrink-0 rounded-full px-4 text-[11px] font-bold ${season === s ? 'bg-[#0D63FF] text-white' : 'border border-[#DDE8F8] bg-white text-[#5B6B82]'}`}>{s}</button>)}</div></section>
        </div>

        <aside className="space-y-5">
          {hero && <SidebarBlock title="ARTICLE VEDETTE"><Link href={articleHref(hero)} className="group block"><div className="relative aspect-video overflow-hidden rounded-lg"><ArticleImage src={hero.image} alt={titleOf(hero)} className="h-full w-full object-cover transition group-hover:scale-105"/><div className="absolute left-2 top-2"><Badge category={hero.category}/></div></div><h3 className="mt-3 text-sm font-extrabold leading-snug group-hover:text-[#0D63FF]">{titleOf(hero)}</h3><div className="mt-2"><Meta article={hero}/></div></Link></SidebarBlock>}
          <SidebarBlock title="LES PLUS LUS"><ol className="space-y-3">{mostRead.map((a, i) => <li key={a._id || a.id}><Link href={articleHref(a)} className="group grid grid-cols-[30px_56px_1fr] items-center gap-2"><span className={`text-xl font-black ${i === 0 ? 'text-[#0D63FF]' : 'text-[#1d7cff]'}`}>{i + 1}</span><ArticleImage src={a.image} alt="" className="h-11 w-14 rounded object-cover"/><span className="min-w-0"><b className="line-clamp-2 text-[11px] leading-4 group-hover:text-[#0D63FF]">{titleOf(a)}</b><small className="mt-1 flex items-center gap-1 text-[9px] text-[#5B6B82]"><Eye size={9}/>{formatViews(a.views)}</small></span></Link></li>)}</ol></SidebarBlock>
          <SidebarBlock title="CATÉGORIES"><ul className="space-y-2">{categories.slice(1, 7).map(c => <li key={c} className="flex justify-between border-b border-[#DDE8F8]/60 pb-2 text-[11px]"><span className="text-[#071A30]">{categoryLabel(c)}</span><span className="rounded-full bg-usm-blue-soft px-2 text-[#5B6B82]">{articles.filter(a => a.category === c).length}</span></li>)}</ul></SidebarBlock>
          <MatchWidget/>
          <SidebarBlock title="NEWSLETTER OFFICIELLE"><Mail size={24} className="text-[#0D63FF]"/><p className="mt-3 text-xs leading-5 text-[#5B6B82]">Recevez toute l’actualité de l’USM directement dans votre boîte mail.</p><form className="mt-4 flex" onSubmit={e => e.preventDefault()}><label htmlFor="news-email" className="sr-only">Adresse e-mail</label><input id="news-email" type="email" required placeholder="Votre adresse e-mail" className="min-w-0 flex-1 rounded-l-md border border-[#DDE8F8] bg-white px-3 text-xs outline-none focus:border-[#0D63FF]"/><button className="min-h-11 rounded-r-md bg-[#0D63FF] px-3 text-[10px] font-black text-white">S’abonner</button></form></SidebarBlock>
          <SidebarBlock title="PARTENAIRE OFFICIEL"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full border border-[#0D63FF] bg-white"><Trophy size={24} className="text-[#0D63FF]"/></div><div><b className="text-lg">Maestro</b><p className="text-[10px] text-[#5B6B82]">Engagé pour la performance</p></div></div></SidebarBlock>
        </aside>
      </div>
    </main>
  </div>;
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return <div className="flex items-end justify-between border-b border-[#DDE8F8] pb-3"><div><span className="block h-0.5 w-8 bg-[#0D63FF]"/><h2 className="mt-2 text-sm font-black tracking-[.08em] text-usm-blue-dark sm:text-base">{title}</h2></div>{action && <span className="text-[10px] font-bold text-[#0D63FF]">{action}</span>}</div>;
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-xl border border-[#DDE8F8] bg-white p-4"><h2 className="mb-4 border-l-2 border-[#0D63FF] pl-2 text-[10px] font-black tracking-[.12em] text-[#0D63FF]">{title}</h2>{children}</section>;
}

function MatchWidget() {
  return <SidebarBlock title="PROCHAIN MATCH"><div className="text-center"><span className="text-[9px] font-bold text-[#5B6B82]">LIGUE 1 • J26</span><div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2"><div><img src="/logo.webp" alt="US Monastir" className="mx-auto h-12 w-12 object-contain"/><b className="mt-1 block text-[10px]">US MONASTIR</b></div><span className="text-lg font-black text-[#0D63FF]">VS</span><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#DDE8F8] bg-usm-blue-soft"><Users size={22}/></div><b className="mt-1 block text-[10px]">CS SFAXIEN</b></div></div><div className="grid grid-cols-4 gap-1">{[['02','JOURS'],['08','HEURES'],['15','MIN'],['34','SEC']].map(([n,l]) => <div key={l} className="rounded bg-white py-2"><b className="block text-sm text-[#0D63FF]">{n}</b><small className="text-[7px] text-[#5B6B82]">{l}</small></div>)}</div><p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-[#5B6B82]"><MapPin size={9}/> Stade Mustapha Ben Jannet</p></div></SidebarBlock>;
}
