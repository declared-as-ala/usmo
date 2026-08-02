'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, Eye, Link2, Share2, ShieldCheck, Trophy } from 'lucide-react';
import { api } from '../lib/api-client';

const Facebook = Share2;

type Article = { title: string; titleFr?: string; subtitle?: string; summary: string; summaryFr?: string; content: string; contentFr?: string; image: string; category: string; date: string; readTime: string; author?: string; official?: boolean; views?: number; gallery?: string[]; videoEmbed?: string };

export function ArticleDetail({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { api.getNewsBySlug(slug).then(setArticle).catch(() => api.getNewsById(slug).then(setArticle).catch(() => setError(true))); }, [slug]);

  if (error) return <main className="min-h-[70vh] usm-premium-bg px-4 py-24 text-center text-usm-blue-dark"><ShieldCheck className="mx-auto text-[#0D63FF]" size={42}/><h1 className="mt-5 text-2xl font-black">Article introuvable</h1><Link href="/actualites" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0D63FF]"><ArrowLeft size={16}/> Retour aux actualités</Link></main>;
  if (!article) return <main className="min-h-screen usm-premium-bg px-4 py-16"><div className="skeleton-loader mx-auto h-[70vh] max-w-5xl rounded-2xl"/></main>;

  const title = article.titleFr || article.title;
  const summary = article.summaryFr || article.summary;
  const content = article.contentFr || article.content;
  return <main className="min-h-screen usm-premium-bg text-usm-blue-dark">
    <header className="relative isolate min-h-[460px] overflow-hidden border-b border-[#DDE8F8]">
      {article.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image} alt={title} className="absolute inset-0 -z-20 h-full w-full object-cover"/>
      ) : (
        <div className="absolute inset-0 -z-20 flex items-center justify-center bg-gradient-to-br from-usm-blue-dark to-usm-blue-primary/60">
          <Trophy size={48} className="text-white/20"/>
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white via-white/80 to-[#061221]/45"/>
      <div className="mx-auto flex min-h-[460px] max-w-5xl flex-col justify-end px-4 py-12 sm:px-6">
        <Link href="/actualites" className="mb-8 flex w-fit items-center gap-2 text-xs font-bold text-[#071A30] hover:text-[#0D63FF]"><ArrowLeft size={15}/> Retour aux actualités</Link>
        <span className="w-fit rounded-sm bg-[#0D63FF] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">{article.category}</span>
        <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#071A30] sm:text-base">{article.subtitle || summary}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-[#5B6B82]"><span className="flex items-center gap-1"><CalendarDays size={13}/>{article.date}</span><span className="flex items-center gap-1"><Clock3 size={13}/>{article.readTime}</span><span className="flex items-center gap-1"><Eye size={13}/>{article.views || 0} vues</span>{article.official && <span className="flex items-center gap-1 text-[#0D63FF]"><ShieldCheck size={13}/> Publication officielle</span>}</div>
      </div>
    </header>
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0"><div className="mb-8 border-l-2 border-[#0D63FF] pl-5 text-lg font-semibold leading-8 text-[#071A30]">{summary}</div><div className="whitespace-pre-line text-[16px] leading-8 text-[#33455F]">{content}</div>{article.gallery?.length ? <div className="mt-10 grid gap-3 sm:grid-cols-2">{article.gallery.map((src, i) => <figure key={src} className="overflow-hidden rounded-xl border border-[#DDE8F8]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={`${title} — photo ${i + 1}`} className="aspect-video w-full object-cover"/><figcaption className="bg-white px-3 py-2 text-[10px] text-[#5B6B82]">USM Media • Photo {i + 1}</figcaption></figure>)}</div> : null}</article>
      <aside><div className="sticky top-28 rounded-xl border border-[#DDE8F8] bg-white p-4"><h2 className="text-[10px] font-black tracking-widest text-[#0D63FF]">PUBLIÉ PAR</h2><p className="mt-2 text-sm font-bold">{article.author || 'Rédaction USM'}</p><p className="mt-1 text-[10px] text-[#5B6B82]">Union Sportive Monastirienne</p><div className="my-4 h-px bg-[#DDE8F8]"/><h2 className="text-[10px] font-black tracking-widest text-[#0D63FF]">PARTAGER</h2><div className="mt-3 flex gap-2"><button aria-label="Partager sur Facebook" className="grid h-11 w-11 place-items-center rounded border border-[#DDE8F8] hover:border-[#0D63FF]"><Facebook size={16}/></button><button aria-label="Copier le lien" onClick={() => navigator.clipboard?.writeText(location.href)} className="grid h-11 w-11 place-items-center rounded border border-[#DDE8F8] hover:border-[#0D63FF]"><Link2 size={16}/></button></div></div></aside>
    </div>
  </main>;
}
