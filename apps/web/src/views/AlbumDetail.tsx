'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Lock,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface AlbumDetailProps {
  slug: string; // This corresponds to the database _id
}

interface Album {
  _id: string;
  title: string;
  titleFr?: string;
  titleAr?: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  type: 'album';
  accessLevel: 'public' | 'fan' | 'premium';
  coverImage: string;
  videoUrl?: string;
  photos: string[];
  teaserPhotos: string[];
  locked: boolean;
  createdAt: string;
}

export const AlbumDetail: React.FC<AlbumDetailProps> = ({ slug }) => {
  const { language, isLoggedIn, showToast } = useApp();
  const router = useRouter();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAlbum = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicMediaItem(slug);
      if (data && data.type === 'album') {
        setAlbum(data);
      } else {
        setAlbum(null);
      }
    } catch (err) {
      console.error('Error fetching album details:', err);
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [slug, isLoggedIn]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIdx === null || !album) return;
      const totalPhotos = album.locked ? album.teaserPhotos.length : album.photos.length;
      if (e.key === 'ArrowRight') {
        setActivePhotoIdx((activePhotoIdx + 1) % totalPhotos);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((activePhotoIdx - 1 + totalPhotos) % totalPhotos);
      } else if (e.key === 'Escape') {
        setActivePhotoIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIdx, album]);

  if (loading) {
    return (
      <div className="usm-premium-bg text-usm-blue-dark min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-usm-blue-primary" size={32} />
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Chargement de l'album...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="usm-premium-bg text-usm-blue-dark min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Album introuvable</h2>
          <p className="text-slate-500 text-xs">Cet album n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/media')}
            className="px-5 py-2.5 bg-usm-blue-primary text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Retourner aux médias
          </button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (!album) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: album.title || 'US Monastir Media',
      text: album.description || album.title || 'US Monastir Media',
      url,
    };

    let shared = false;
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
      }
    }

    if (!shared) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showToast(
          tr(language, 'Album link copied to clipboard!', "Lien de l'album copié dans le presse-papier !", 'تم نسخ رابط الألبوم!'),
          'success'
        );
      } catch {
        showToast(url, 'info');
      }
    }
  };

  const handleDownload = (photoUrl: string) => {
    if (album.locked) {
      showToast('Téléchargement restreint aux abonnés.', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `USM-${album._id}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedPhotos = album.locked ? album.teaserPhotos : album.photos;

  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen pb-16 pt-24 sm:pt-28 lg:pt-32">
      {/* ALBUM HERO BANNER */}
      <div className="relative min-h-[350px] bg-white flex items-end p-6 sm:p-12 border-b border-usm-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.25]"
          style={{ backgroundImage: `url(${album.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-transparent" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-end space-y-4">
          <button
            onClick={() => router.push('/media')}
            className="self-start px-3.5 py-1.5 rounded-full bg-usm-blue-soft border border-usm-border hover:bg-usm-blue-hover/15 transition-all text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={13} /> Retour aux médias
          </button>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-wider text-usm-blue-primary">
              <span className="bg-usm-blue-primary/10 px-2.5 py-1 rounded border border-usm-blue-primary/25">
                {album.accessLevel.toUpperCase()}
              </span>
              {album.locked && (
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded flex items-center gap-1">
                  <Lock size={10} /> ACCÈS RESTREINT
                </span>
              )}
            </div>
            
            <h1 className="font-display font-black text-3xl sm:text-5xl text-usm-blue-dark uppercase tracking-wider leading-none">
              {language === 'ar' ? album.titleAr : album.title}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-2">
              {language === 'ar' ? album.descriptionAr : album.description}
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-usm-border text-[10px] text-slate-500 font-bold uppercase">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {new Date(album.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center gap-1">
                <Camera size={13} /> Photos : {displayedPhotos.length}
              </span>
            </div>
            
            <button
              onClick={handleShare}
              className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-bold ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-usm-blue-soft border-usm-border hover:bg-usm-blue-hover/15 text-usm-blue-dark'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>{tr(language, 'Link Copied!', 'Lien copié !', 'تم النسخ!')}</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>{tr(language, 'Share Album', "Partager l'album", 'مشاركة الألبوم')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MASONRY PHOTO GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        
        {/* Lock Overlay Paywall notice */}
        {album.locked && (
          <div className="mb-8 p-6 bg-usm-blue-primary/5 border border-usm-blue-primary/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Lock className="text-usm-blue-primary" size={24} />
              <div>
                <h4 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Abonnement Premium Requis</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cet album photo contient des clichés exclusifs réservés aux supporters abonnés. Rejoignez-nous pour débloquer les photos en haute définition.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(album.accessLevel === 'premium' ? '/abonnement' : '/auth/login')}
              className="px-5 py-2.5 bg-usm-blue-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-usm-blue-hover transition-colors cursor-pointer shrink-0"
            >
              {album.accessLevel === 'premium' ? "S'abonner" : "Se connecter"}
            </button>
          </div>
        )}

        {/* ALBUM VIDEO */}
        {album.videoUrl && !album.locked && (
          <div className="mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-usm-border shadow-lg">
            <iframe
              src={album.videoUrl}
              title={`${album.title} — vidéo`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {displayedPhotos.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {displayedPhotos.map((photo, index) => (
              <div
                key={index}
                onClick={() => setActivePhotoIdx(index)}
                className="break-inside-avoid relative rounded-2xl overflow-hidden border border-usm-border group cursor-pointer shadow-lg hover:border-usm-blue-primary/40 transition-all duration-300 bg-white"
              >
                <img
                  src={photo}
                  alt=""
                  className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                
                {/* Photo Zoom/Preview Label */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-usm-blue-primary text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg">
                    Agrandir
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <Camera size={40} className="mx-auto text-slate-700 mb-2" />
            <p className="text-sm">Aucune photo disponible pour cet album.</p>
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      <AnimatePresence>
        {activePhotoIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex flex-col justify-between p-4"
            onClick={() => setActivePhotoIdx(null)}
          >
            {/* Top Toolbar */}
            <div className="flex justify-between items-center text-xs text-slate-500 relative z-10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-usm-blue-dark text-sm">
                  {activePhotoIdx + 1} / {displayedPhotos.length}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline uppercase tracking-wider">{album.title}</span>
              </div>
              <button
                onClick={() => setActivePhotoIdx(null)}
                className="text-usm-blue-dark p-2 bg-usm-blue-soft rounded-full hover:bg-usm-blue-hover/20 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Carousel */}
            <div className="flex-grow flex items-center justify-between relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setActivePhotoIdx((activePhotoIdx - 1 + displayedPhotos.length) % displayedPhotos.length)}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-usm-blue-soft border border-usm-border text-usm-blue-dark hover:bg-usm-blue-hover/15 transition-all cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="w-full flex justify-center max-h-[70vh]">
                <img
                  src={displayedPhotos[activePhotoIdx]}
                  alt=""
                  className="max-w-[85vw] max-h-[70vh] object-contain rounded-lg border border-usm-border shadow-2xl"
                />
              </div>

              <button
                onClick={() => setActivePhotoIdx((activePhotoIdx + 1) % displayedPhotos.length)}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-usm-blue-soft border border-usm-border text-usm-blue-dark hover:bg-usm-blue-hover/15 transition-all cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Panel */}
            <div
              className="w-full max-w-4xl mx-auto bg-white/90 border border-usm-border rounded-2xl p-4 flex justify-between items-center text-usm-blue-dark text-xs z-10"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <p className="font-bold text-usm-blue-dark text-sm">{album.title}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(displayedPhotos[activePhotoIdx])}
                  className="px-4 py-2 bg-usm-blue-primary text-white font-black uppercase text-[10px] rounded-lg tracking-wider hover:bg-usm-blue-hover transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={12} /> Télécharger
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
