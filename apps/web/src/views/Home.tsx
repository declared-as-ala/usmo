'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { clubTrophies } from '../data/mockData';
import { LeagueStandingsTable } from '../components/Common/LeagueStandingsTable';
import { HeroCarousel, HeroSlideData } from '../components/Common/HeroCarousel';
import { PartnerShowcase } from '../components/Common/PartnerShowcase';
import { Play, ArrowRight, Send, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api-client';

interface HomepageConfig {
  heroTitle: string; heroSubtitle: string; heroDescription: string; heroImageUrl: string;
  primaryCtaLabel: string; primaryCtaHref: string; sections: Record<string, boolean>;
}
interface FanPhoto { _id: string; imageUrl: string; caption?: string; supporterName?: string; }
interface SponsorItem { _id: string; name: string; category: string; logo?: string; link?: string; story?: string; storyFr?: string; storyAr?: string; }

// Local banner photos — used only as a fallback single-slide hero when no admin-managed
// hero slides exist yet in the backend.
const FALLBACK_BANNER = encodeURI('/banners/BAL 2022 USM winner.webp');

export const Home: React.FC = () => {
  const {
    language,
    setActiveScreen,
    addBluePoints,
    t,
    newsList: newsArticles,
    products: catalogProducts,
    isSectionVisible
  } = useApp();

  const router = useRouter();
  const publishedNews = newsArticles.filter((n) => n.published !== false);

  const [homepage, setHomepage] = useState<HomepageConfig | null>(null);
  const [fanPhotos, setFanPhotos] = useState<FanPhoto[]>([]);
  const [heroSlidesFromApi, setHeroSlidesFromApi] = useState<HeroSlideData[]>([]);
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [productsFromApi, setProductsFromApi] = useState<any[]>([]);
  const sectionVisible = (key: string) => homepage?.sections?.[key] ?? isSectionVisible(key);

  useEffect(() => {
    Promise.allSettled([
      api.getHomepageSettings(),
      api.getFanPhotos(),
      api.getHeroSlides(),
      api.getSponsors({ homepage: true }),
      api.getProducts({ limit: 4 }),
    ]).then(([settings, photos, slides, sp, prod]) => {
      if (settings.status === 'fulfilled') setHomepage(settings.value);
      if (photos.status === 'fulfilled') setFanPhotos(photos.value || []);
      if (slides.status === 'fulfilled' && Array.isArray(slides.value)) setHeroSlidesFromApi(slides.value);
      if (sp.status === 'fulfilled' && Array.isArray(sp.value)) setSponsors(sp.value);
      if (prod.status === 'fulfilled') {
        const list = prod.value?.products || (Array.isArray(prod.value) ? prod.value : []);
        setProductsFromApi(list);
      }
    });
  }, []);

  // Graceful fallback when the backend has no admin-managed hero slides yet — built from
  // whatever homepage config / translations already exist, no mock data.
  const fallbackHeroSlide: HeroSlideData = {
    _id: 'fallback',
    title: homepage?.heroTitle || (language === 'ar' ? 'الاتحاد الرياضي المنستيري' : 'Union Sportive Monastirienne'),
    subtitle: homepage?.heroSubtitle || t('home.heroSub'),
    badgeText: language === 'ar' ? 'منذ 1923' : 'Depuis 1923',
    backgroundImage: homepage?.heroImageUrl || FALLBACK_BANNER,
    primaryCtaText: homepage?.primaryCtaLabel || t('btn.discover'),
    primaryCtaLink: homepage?.primaryCtaHref || '/histoire',
    secondaryCtaText: language === 'ar' ? 'البطولات' : 'Palmarès',
    secondaryCtaLink: '/palmares',
    overlayStrength: 'medium',
    textPosition: 'left',
  };
  const heroSlides = heroSlidesFromApi.length > 0 ? heroSlidesFromApi : [fallbackHeroSlide];

  return (
    <div className="space-y-16 pb-12">

      {/* SECTION A: CINEMATIC HERO CAROUSEL — backend-driven, admin-managed at /admin/homepage/hero */}
      {sectionVisible('hero') && (
        <div className="relative">
          <HeroCarousel slides={heroSlides} />
        </div>
      )}

      {/* SECTION D: LATEST NEWS GRID */}
      {sectionVisible('news') && publishedNews.length > 0 && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b-2 border-usm-blue-primary/40 pb-2 mb-6">
          <h3 className="font-display font-extrabold text-2xl uppercase tracking-wider text-usm-blue-dark">
            📰 {t('home.news')}
          </h3>
          <button
            onClick={() => setActiveScreen('news')}
            className="text-xs font-bold text-usm-blue-primary hover:text-usm-blue-primary flex items-center space-x-1 rtl:space-x-reverse cursor-pointer transition-colors"
          >
            <span>{t('btn.allNews')}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Large Featured Card */}
          <div className="lg:col-span-2 bg-white border border-usm-border rounded-3xl overflow-hidden group hover:border-usm-blue-primary/40 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(13,99,255,0.35)] transition-all duration-300 flex flex-col justify-between shadow-[0_18px_45px_-30px_rgba(13,99,255,0.15)] cursor-pointer" onClick={() => setActiveScreen('news')}>
            <div className="relative overflow-hidden h-72">
              <img
                src={publishedNews[0].image}
                alt={publishedNews[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-usm-blue-primary text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                {language === 'ar' ? publishedNews[0].categoryAr : publishedNews[0].category}
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#7A8AA0] font-bold block mb-2">{publishedNews[0].date} • {publishedNews[0].readTime} read</span>
                <h4 className="text-lg font-bold text-usm-blue-dark group-hover:text-usm-blue-primary transition-colors mb-3 leading-snug">
                  {language === 'ar' ? publishedNews[0].titleAr : language === 'fr' ? publishedNews[0].titleFr : publishedNews[0].title}
                </h4>
                <p className="text-xs text-[#5B6B82] leading-relaxed line-clamp-3">
                  {language === 'ar' ? publishedNews[0].contentAr : language === 'fr' ? publishedNews[0].contentFr : publishedNews[0].content}
                </p>
              </div>
              <span className="mt-6 text-xs text-usm-blue-primary font-bold uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                {t('btn.readMore')}
                <ArrowRight size={12} />
              </span>
            </div>
          </div>

          {/* Side Cards list */}
          <div className="flex flex-col space-y-4 justify-between">
            {publishedNews.slice(1, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white border border-usm-border rounded-2xl p-4 hover:border-usm-blue-primary/40 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(13,99,255,0.3)] transition-all duration-300 flex space-x-4 rtl:space-x-reverse cursor-pointer shadow-[0_10px_28px_-24px_rgba(13,99,255,0.15)] group"
                onClick={() => setActiveScreen('news')}
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <span className="inline-block text-[9px] text-usm-blue-primary font-black mb-1.5 uppercase tracking-wider bg-usm-blue-soft px-2 py-0.5 rounded-full">
                      {language === 'ar' ? item.categoryAr : item.category}
                    </span>
                    <h5 className="text-xs font-bold text-usm-blue-dark group-hover:text-usm-blue-primary line-clamp-2 leading-snug transition-colors">
                      {language === 'ar' ? item.titleAr : language === 'fr' ? item.titleFr : item.title}
                    </h5>
                  </div>
                  <span className="text-[9px] text-[#7A8AA0] font-semibold">{item.date} • {item.readTime} read</span>
                </div>
              </div>
            ))}

            {/* Extra video block link */}
            <div
              className="relative h-28 rounded-2xl overflow-hidden border border-usm-border group cursor-pointer shadow-[0_10px_28px_-24px_rgba(13,99,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(13,99,255,0.3)] transition-all duration-300"
              onClick={() => setActiveScreen('media')}
            >
              <img src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=600&q=80" alt="USM Media" className="w-full h-full object-cover brightness-[0.55] group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-usm-blue-dark/90 via-usm-blue-dark/50 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <div>
                  <span className="text-[9px] text-usm-blue-light font-extrabold tracking-widest uppercase block mb-1">USM Media</span>
                  <h6 className="text-xs font-bold text-white">Watch training and post-match conferences</h6>
                </div>
                <div className="h-9 w-9 rounded-full bg-usm-blue-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SECTION E: HERITAGE PREVIEW */}
      {sectionVisible('heritage') && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="usm-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-usm-blue-primary/10 rounded-full blur-[110px]" />
          <div className="relative text-center mb-8">
            <span className="text-[10px] tracking-[0.25em] text-usm-blue-primary font-bold uppercase">Depuis 1923</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase mt-2">
              {language === 'ar' ? 'أكثر من قرن من التاريخ' : 'Plus d’un siècle d’histoire'}
            </h2>
          </div>
          <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { value: '1923', label: language === 'ar' ? 'التأسيس' : 'Fondation' },
              { value: '103', label: language === 'ar' ? 'سنة من التاريخ' : 'Ans d’histoire' },
              { value: '2022', label: language === 'ar' ? 'بطل أفريقيا (كرة السلة)' : 'Champion BAL · Basket' },
              { value: '10', label: language === 'ar' ? 'بطولات تونس · كرة السلة' : 'Titres de Tunisie · Basket' },
              { value: '2023', label: language === 'ar' ? 'رابع العالم في كرة السلة' : '4ème du Mondial · Basket' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-usm-blue-soft border border-usm-border px-3 py-4 text-center">
                <p className="font-display font-black text-lg sm:text-xl text-usm-blue-primary">{s.value}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="relative flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push('/histoire')}
              className="usm-btn-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              {language === 'ar' ? 'اكتشف التاريخ' : 'Découvrir l’histoire'}
            </button>
            <button
              onClick={() => router.push('/palmares')}
              className="usm-btn-secondary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              {language === 'ar' ? 'شاهد البطولات' : 'Voir le palmarès'}
            </button>
          </div>
        </div>
      </section>
      )}

      {/* SECTION F: STANDINGS PREVIEW & PALMARÈS */}
      {sectionVisible('standings') && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Standings */}
        <div>
          <h3 className="font-display font-extrabold text-2xl uppercase tracking-wider text-usm-blue-dark border-b-2 border-usm-blue-primary/40 pb-2 mb-6 flex items-center justify-between">
            <span>📈 {language === 'ar' ? 'ترتيب البطولة المحترفة الأولى' : 'Ligue 1 Standings'}</span>
            <span className="text-[9px] font-bold text-slate-500 normal-case tracking-normal">TheSportsDB</span>
          </h3>
          <LeagueStandingsTable
            limit={5}
            posLabel={t('table.pos')}
            teamLabel={t('table.team')}
            playedLabel={t('table.played')}
            wonLabel={t('table.won')}
            pointsLabel={t('table.points')}
            diffLabel={t('table.diff')}
            emptyLabel={language === 'ar' ? 'الترتيب غير متوفر حالياً' : 'Classement indisponible pour le moment'}
            footer={
              <div className="p-3 bg-usm-blue-soft text-center border-t border-usm-border">
                <button
                  onClick={() => {
                    setActiveScreen('matches');
                    router.push('/matches');
                  }}
                  className="text-xs text-usm-blue-primary font-bold uppercase hover:underline cursor-pointer"
                >
                  {t('btn.allStandings')}
                </button>
              </div>
            }
          />
        </div>

        {/* Palmarès */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-2xl uppercase tracking-wider text-usm-blue-dark border-b-2 border-usm-blue-primary/40 pb-2 mb-6">
              🏆 {t('home.historyTitle')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              A historical legacy forged by elite players and supporters. US Monastir commands a legacy representing the central Tunisian coast in basketball and football.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {clubTrophies.slice(0, 4).map((trophy) => (
              <div
                key={trophy.id}
                className="bg-usm-blue-soft/60 dark:bg-usm-blue-primary/10 border border-usm-border rounded-2xl p-4 flex items-center space-x-3 rtl:space-x-reverse shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-usm-blue-primary/20 flex items-center justify-center text-2xl border border-usm-blue-primary/30">
                  {trophy.icon}
                </div>
                <div>
                  <span className="font-display font-black text-2xl text-usm-blue-dark block">{trophy.count}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block line-clamp-1">
                    {language === 'ar' ? trophy.titleAr : trophy.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveScreen('histoire')}
            className="mt-6 w-full py-3 bg-usm-blue-primary/30 border border-usm-blue-primary/30 hover:bg-usm-blue-primary/25 text-usm-blue-dark font-bold text-xs uppercase rounded-xl tracking-wider text-center cursor-pointer transition-colors"
          >
            Explore Interactive Museum
          </button>
        </div>
      </section>
      )}

      {sectionVisible('supporterGallery') && fanPhotos.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="supporter-gallery-title">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-usm-blue-primary">Notre communauté</p>
              <h2 id="supporter-gallery-title" className="mt-2 font-display text-2xl font-black uppercase text-usm-blue-dark sm:text-3xl">Supporters en images</h2>
            </div>
            <button type="button" onClick={() => setActiveScreen('fanzone')} className="min-h-11 text-sm font-bold text-usm-blue-primary hover:text-usm-blue-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usm-blue-primary">Fan Zone</button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {fanPhotos.slice(0, 8).map((photo) => (
              <figure key={photo._id} className="group relative aspect-square overflow-hidden rounded-2xl bg-usm-blue-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.caption || `Supporter ${photo.supporterName || 'USM'}`} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {(photo.caption || photo.supporterName) && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-xs text-white"><strong>{photo.supporterName}</strong>{photo.caption && <span className="block text-white/80">{photo.caption}</span>}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: BOUTIQUE OFFICIELLE / SHOWCASE */}
      {(() => {
        const displayProducts = productsFromApi.length > 0 ? productsFromApi : catalogProducts.slice(0, 4);
        if (displayProducts.length === 0) return null;
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-usm-blue-primary/40 pb-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] text-usm-blue-primary">
                  <ShoppingBag size={14} />
                  {language === 'ar' ? 'المغازة الرسمية' : 'Boutique Officielle'}
                </span>
                <h2 className="mt-1 font-display font-extrabold text-2xl uppercase tracking-wider text-usm-blue-dark sm:text-3xl">
                  {language === 'ar' ? 'منتجات النادي الرسمية' : language === 'fr' ? 'Nos Produits Officiels' : 'Official Merchandise'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {language === 'ar'
                    ? 'أقمصة المباريات، أزياء التمارين وإكسسوارات النادي الحصرية لموسم 2026.'
                    : 'Arborez fièrement les couleurs bleu et blanc. Maillots de match officiels, tenues d’entraînement et accessoires exclusifs.'}
                </p>
              </div>
              <button
                onClick={() => router.push('/boutique')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg self-start sm:self-auto cursor-pointer"
              >
                <span>{language === 'ar' ? 'تصفح كل المغازة' : 'Voir toute la boutique'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.slice(0, 4).map((p: any) => {
                const cover = p.coverImage || p.image || p.images?.[0] || '/logo.webp';
                const formattedPrice = typeof p.price === 'number'
                  ? `${(p.price / 1000).toFixed(3)} DT`
                  : (p.price || '0.000 DT');
                const title = language === 'ar' ? (p.nameAr || p.name) : (p.nameFr || p.name);
                const badge = p.badges?.[0] || (p.category ? p.category : null);
                const productSlug = p.slug || p._id || p.id;

                return (
                  <div
                    key={p._id || p.id || p.name}
                    onClick={() => router.push(productSlug ? `/product/${productSlug}` : '/boutique')}
                    className="group bg-white border border-[#DDE8F8] hover:border-usm-blue-primary/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-50 p-4 flex items-center justify-center">
                      {badge && (
                        <span className="absolute top-3 left-3 bg-[#071328]/85 backdrop-blur-md text-usm-teal-accent text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border border-white/10 z-10 shadow-xs">
                          {badge}
                        </span>
                      )}
                      <img
                        src={cover}
                        alt={title}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = '/logo.webp';
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow space-y-2 border-t border-slate-100">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-usm-blue-dark group-hover:text-usm-blue-primary transition-colors line-clamp-1">
                          {title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-display font-black text-sm sm:text-base text-usm-blue-primary">
                          {formattedPrice}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-usm-blue-primary transition-colors">
                          Détails →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* SECTION H: OFFICIAL CLUB PARTNERS / SPONSORS */}
      {sponsors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PartnerShowcase
            sponsors={sponsors}
            language={language}
            onExplore={() => setActiveScreen('sponsors')}
          />
        </div>
      )}

      {/* SECTION I: NEWSLETTER & PWA BANNER */}
      {sectionVisible('newsletter') && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-usm-blue-soft to-white border border-usm-blue-primary/30 rounded-3xl p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <h3 className="font-display font-black text-2xl text-usm-blue-dark uppercase tracking-wider mb-2">
              Join the Official USM Newsletter
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stay in the loop. Receive weekly media summaries, press room releases, academy news, and special sponsor merchandise discounts directly into your inbox.
            </p>
          </div>
          <div className="w-full max-w-md flex space-x-2 rtl:space-x-reverse">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow bg-white border border-usm-border text-xs text-usm-blue-dark rounded-xl px-4 py-3 outline-none focus:border-usm-blue-primary"
            />
            <button
              onClick={() => {
                alert(language === 'ar' ? 'تم تسجيل بريدك الإلكتروني بنجاح في القائمة البريدية للاتحاد!' : 'Thank you for subscribing to US Monastir Newsletter!');
              }}
              className="px-6 py-3 bg-usm-blue-primary hover:bg-usm-blue-hover text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer flex items-center space-x-1 rtl:space-x-reverse"
            >
              <span>Subscribe</span>
              <Send size={12} />
            </button>
          </div>
        </div>
      </section>
      )}

    </div>
  );
};
