'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import {
  Camera,
  Video,
  Folder,
  Calendar,
  Play,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MediaItem {
  _id: string;
  title: string;
  titleFr?: string;
  titleAr?: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  type: 'album' | 'video';
  accessLevel: 'public' | 'fan' | 'premium';
  coverImage: string;
  videoUrl?: string;
  teaserUrl?: string;
  photos: string[];
  teaserPhotos: string[];
  displayOrder: number;
  isActive: boolean;
  locked: boolean;
  createdAt: string;
}

export const MediaGallery: React.FC = () => {
  const { language, isLoggedIn, showToast } = useApp();
  const router = useRouter();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('Tout');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Paywall modal state
  const [paywallItem, setPaywallItem] = useState<{ title: string; level: 'fan' | 'premium' } | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicMedia();
      setMediaItems(data || []);
    } catch (err) {
      console.error('Error fetching media gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [isLoggedIn]);

  const handleMediaClick = (item: MediaItem) => {
    if (item.locked) {
      setPaywallItem({ title: item.title, level: item.accessLevel as 'fan' | 'premium' });
      return;
    }

    if (item.type === 'video') {
      setActiveVideoUrl(item.videoUrl || null);
    } else {
      router.push(`/media/albums/${item._id}`);
    }
  };

  const filters = [
    { label: 'Tout', labelFr: 'Tout', labelAr: 'الكل' },
    { label: 'Photos', labelFr: 'Photos', labelAr: 'صور' },
    { label: 'Vidéos', labelFr: 'Vidéos', labelAr: 'فيديو' },
  ];

  // Filtering Logic
  const filteredAlbums = mediaItems
    .filter((item) => item.type === 'album')
    .filter((album) => {
      if (activeFilter === 'Tout') return true;
      if (activeFilter === 'Photos') return true;
      return false;
    });

  const filteredVideos = mediaItems
    .filter((item) => item.type === 'video')
    .filter((video) => {
      if (activeFilter === 'Tout') return true;
      if (activeFilter === 'Vidéos') return true;
      return false;
    });

  const topViewedMedia = [...mediaItems]
    .sort((a, b) => b.displayOrder - a.displayOrder)
    .slice(0, 5);

  const searchResults = isSearchActive && searchQuery.trim() !== ''
    ? mediaItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollFiltersRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen relative overflow-hidden pt-24 lg:pt-28 pb-12">
      {/* Background radial lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-usm-blue-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-usm-blue-primary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-10">
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-usm-border bg-usm-blue-dark flex flex-col justify-between p-6 sm:p-8 min-h-[380px] shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(13,99,255,0.35),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(212,175,55,0.16),transparent_50%)]" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-[0.25em] text-usm-teal-accent bg-usm-teal-accent/10 px-3 py-1 rounded-full uppercase border border-usm-teal-accent/25">
                <span className="h-1.5 w-1.5 rounded-full bg-usm-teal-accent animate-pulse" />
                Média Officiel du Club
              </span>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-wider leading-none">
                USM <span className="text-transparent bg-clip-text bg-gradient-to-r from-usm-blue-primary via-blue-400 to-usm-blue-primary">MEDIA</span>
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm max-w-lg leading-relaxed">
                Découvrez des galeries de photos exclusives et des vidéos immersives au cœur du club de l'US Monastir.
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveFilter('Photos')}
                  className="px-5 py-3 rounded-xl bg-usm-blue-primary text-white text-xs font-black uppercase tracking-wider hover:bg-usm-blue-hover transition-all cursor-pointer flex items-center gap-2"
                >
                  <Folder size={14} /> Albums Photos
                </button>
                <button
                  onClick={() => setActiveFilter('Vidéos')}
                  className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play size={14} fill="currentColor" /> Vidéos Premium
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Weekly Media Card */}
          <div className="bg-white/70 border border-usm-border rounded-3xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-usm-blue-dark uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-usm-blue-primary" />
                  Média vedette
                </h3>
              </div>
              
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-usm-border group shadow-md mb-4 bg-white flex items-center justify-center">
                {mediaItems.length > 0 ? (
                  <>
                    <img
                      src={mediaItems[0].coverImage}
                      alt={mediaItems[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      onClick={() => handleMediaClick(mediaItems[0])}
                      className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/55 transition-colors cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-full bg-usm-blue-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {mediaItems[0].locked ? <Lock size={16} /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-center text-slate-400 py-6">
                    <Video size={24} className="text-slate-350" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{tr(language, 'No featured media', 'Aucun média vedette', 'لا يوجد محتوى مميز')}</span>
                  </div>
                )}
              </div>

              {mediaItems.length > 0 && (
                <>
                  <h4 className="text-sm font-bold text-usm-blue-dark leading-snug line-clamp-2">
                    {language === 'ar' ? mediaItems[0].titleAr : mediaItems[0].title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {language === 'ar' ? mediaItems[0].descriptionAr : mediaItems[0].description}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-usm-border pb-4">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={() => {
                  setActiveFilter(f.label);
                  setIsSearchActive(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeFilter === f.label
                    ? 'bg-usm-blue-primary text-white shadow-md'
                    : 'bg-white border border-usm-border text-slate-600 hover:bg-usm-blue-soft hover:text-usm-blue-primary'
                }`}
              >
                {language === 'ar' ? f.labelAr : f.labelFr}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 sm:w-72">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchActive(e.target.value.trim() !== '');
              }}
              placeholder="Rechercher des médias..."
              className="w-full bg-white border border-usm-border rounded-xl pl-9 pr-8 py-2.5 text-xs text-usm-blue-dark placeholder-slate-500 focus:outline-none focus:border-usm-blue-primary/50"
            />
          </div>
        </div>

        {/* SEARCH RESULTS */}
        {isSearchActive && (
          <div className="bg-white/80 border border-usm-border rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase">Résultats pour : &quot;{searchQuery}&quot;</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMediaClick(item)}
                  className="group bg-white/80 border border-usm-border rounded-2xl overflow-hidden shadow-lg cursor-pointer p-4 hover:border-usm-blue-primary/45 transition-all"
                >
                  <p className="font-bold text-usm-blue-dark text-xs">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN LISTINGS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-usm-blue-primary mb-3" size={32} />
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Chargement de la médiathèque...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* Albums */}
              {(activeFilter === 'Tout' || activeFilter === 'Photos') && (
                <div className="space-y-6">
                  <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wider flex items-center gap-2">
                    <span className="h-4 w-1 bg-usm-blue-primary rounded-full" />
                    Albums Photos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredAlbums.map((album) => (
                      <div
                        key={album._id}
                        onClick={() => handleMediaClick(album)}
                        className="group bg-white/80 border border-usm-border rounded-2xl overflow-hidden shadow-lg hover:border-usm-blue-primary/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-white">
                          <img
                            src={album.coverImage}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Locked state overlay */}
                          {album.locked && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                              <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-blue-primary/40 flex items-center justify-center text-usm-blue-primary mb-1">
                                <Lock size={15} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                {album.accessLevel === 'premium' ? 'Abonnement Requis' : 'Connexion Requise'}
                              </span>
                            </div>
                          )}

                          <span className="absolute top-3 left-3 bg-usm-blue-dark/85 text-usm-blue-primary text-[8px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border border-usm-blue-primary/20">
                            {album.accessLevel.toUpperCase()}
                          </span>
                        </div>

                        <div className="p-4 space-y-1">
                          <h3 className="text-xs font-bold text-usm-blue-dark group-hover:text-usm-blue-primary transition-colors leading-tight">
                            {language === 'ar' ? album.titleAr : album.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {(activeFilter === 'Tout' || activeFilter === 'Vidéos') && (
                <div className="space-y-6">
                  <h2 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wider flex items-center gap-2">
                    <span className="h-4 w-1 bg-usm-blue-primary rounded-full" />
                    Vidéos Premium
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredVideos.map((video) => (
                      <div
                        key={video._id}
                        onClick={() => handleMediaClick(video)}
                        className="group bg-white/80 border border-usm-border rounded-2xl overflow-hidden shadow-lg hover:border-usm-blue-primary/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                      >
                        <div className="relative aspect-video overflow-hidden bg-white">
                          <img
                            src={video.coverImage}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/55 transition-colors">
                            <div className="h-11 w-11 rounded-full bg-usm-blue-primary text-white flex items-center justify-center shadow-lg">
                              {video.locked ? <Lock size={14} /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                            </div>
                          </div>

                          {/* Lock Overlay */}
                          {video.locked && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
                          )}

                          <span className="absolute top-3 left-3 bg-usm-blue-dark/85 text-usm-blue-primary text-[8px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border border-usm-blue-primary/20">
                            {video.accessLevel.toUpperCase()}
                          </span>
                        </div>

                        <div className="p-4 space-y-1">
                          <h3 className="text-xs font-bold text-usm-blue-dark group-hover:text-usm-blue-primary transition-colors leading-tight">
                            {language === 'ar' ? video.titleAr : video.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div className="space-y-8">
              <div className="bg-white/80 border border-usm-border rounded-3xl p-5 shadow-2xl space-y-4">
                <h3 className="text-xs font-black text-usm-blue-dark uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-usm-blue-primary" />
                  Médiathèque USM
                </h3>
                <div className="divide-y divide-white/5">
                  {topViewedMedia.map((item, idx) => (
                    <div
                      key={item._id}
                      onClick={() => handleMediaClick(item)}
                      className="flex items-center gap-3 py-3 cursor-pointer group"
                    >
                      <span className="text-xs font-black text-usm-blue-primary w-4 text-center">{idx + 1}</span>
                      <div className="relative h-10 w-16 rounded-lg overflow-hidden border border-usm-border shrink-0 bg-white">
                        <img src={item.coverImage} className="w-full h-full object-cover" />
                        {item.locked && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-usm-blue-primary">
                            <Lock size={10} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-usm-blue-dark group-hover:text-usm-blue-primary truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-usm-border">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-usm-blue-dark hover:text-usm-blue-primary rounded-full hover:bg-black/85 cursor-pointer z-50"
            >
              <X size={20} />
            </button>
            <iframe
              src={activeVideoUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Paywall Dialog Modal */}
      {paywallItem && (
        <div className="fixed inset-0 z-[120] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white border-2 border-usm-blue-primary/40 rounded-2xl shadow-2xl p-6 text-center overflow-hidden">
            <button
              onClick={() => setPaywallItem(null)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-usm-blue-primary rounded-full hover:bg-usm-blue-soft cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="h-12 w-12 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-usm-blue-primary" size={22} />
            </div>

            <h3 className="text-base font-display font-black text-usm-blue-dark uppercase tracking-wider">
              CONTENU PREMIUM VERROUILLÉ
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Le média &quot;{paywallItem.title}&quot; requiert un compte
              {paywallItem.level === 'premium' ? " d'abonné actif." : " supporter enregistré."}
              <br />
              Soutenez l'US Monastir et débloquez l'accès complet à USM Media.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPaywallItem(null)}
                className="flex-1 py-2.5 text-xs font-bold uppercase rounded-xl bg-usm-blue-soft border border-usm-border text-usm-blue-dark hover:bg-usm-blue-soft cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setPaywallItem(null);
                  router.push(paywallItem.level === 'premium' ? '/abonnement' : '/auth/login');
                }}
                className="flex-1 py-2.5 text-xs font-black uppercase rounded-xl bg-usm-blue-primary text-white hover:bg-usm-blue-hover transition-colors cursor-pointer"
              >
                {paywallItem.level === 'premium' ? 'S\'abonner' : 'Se connecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
