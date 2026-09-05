'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Clock,
  Share2,
  Play,
  ArrowRight,
  User,
  Lock,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoDetailProps {
  slug: string; // This corresponds to the database _id
}

interface VideoItem {
  _id: string;
  title: string;
  titleFr?: string;
  titleAr?: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  type: 'video';
  accessLevel: 'public' | 'fan' | 'premium';
  coverImage: string;
  videoUrl?: string;
  teaserUrl?: string;
  locked: boolean;
  createdAt: string;
}

export const VideoDetail: React.FC<VideoDetailProps> = ({ slug }) => {
  const { language, isLoggedIn, showToast } = useApp();
  const router = useRouter();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicMediaItem(slug);
      if (data && data.type === 'video') {
        setVideo(data);
      } else {
        setVideo(null);
      }
    } catch (err) {
      console.error('Error fetching video details:', err);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [slug, isLoggedIn]);

  if (loading) {
    return (
      <div className="usm-premium-bg text-usm-blue-dark min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-usm-blue-primary" size={32} />
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Chargement de la vidéo...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="usm-premium-bg text-usm-blue-dark min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Vidéo introuvable</h2>
          <p className="text-slate-500 text-xs">Cette vidéo n'existe pas ou a été supprimée.</p>
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

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Lien de la vidéo copié !', 'info');
    }
  };

  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen pb-16 pt-24 sm:pt-28 lg:pt-32">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-usm-blue-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <button
          onClick={() => router.push('/media')}
          className="self-start px-3.5 py-1.5 rounded-full bg-usm-blue-soft border border-usm-border hover:bg-usm-blue-hover/15 transition-all text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={13} /> Retour aux médias
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-usm-border shadow-2xl">
              <iframe
                src={video.locked ? video.teaserUrl : video.videoUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />

              {video.locked && (
                <div className="absolute inset-x-0 bottom-0 bg-white/90 border-t border-usm-blue-primary/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Lock className="text-usm-blue-primary" size={18} />
                    <span className="text-[10px] text-slate-600">
                      Bande-annonce en cours. Abonnement requis pour regarder la vidéo complète.
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(video.accessLevel === 'premium' ? '/abonnement' : '/auth/login')}
                    className="px-4 py-1.5 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors cursor-pointer"
                  >
                    {video.accessLevel === 'premium' ? "S'abonner" : "Se connecter"}
                  </button>
                </div>
              )}
            </div>

            {/* Video Details metadata */}
            <div className="bg-white/80 border border-usm-border rounded-3xl p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-wider text-usm-blue-primary">
                <span className="bg-usm-blue-primary/10 px-2.5 py-1 rounded border border-usm-blue-primary/25">
                  {video.accessLevel.toUpperCase()}
                </span>
                {video.locked && (
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded flex items-center gap-1">
                    <Lock size={10} /> ACCÈS RESTREINT
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-usm-blue-dark uppercase tracking-wider leading-tight">
                {language === 'ar' ? video.titleAr : video.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold uppercase border-y border-usm-border py-3">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {new Date(video.createdAt).toLocaleDateString('fr-FR')}
                </span>
                
                <div className="flex-grow flex justify-end">
                  <button
                    onClick={handleShare}
                    className="px-3.5 py-1.5 bg-usm-blue-soft border border-usm-border hover:bg-usm-blue-soft rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-usm-blue-dark"
                  >
                    <Share2 size={12} /> Partager
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {language === 'ar' ? video.descriptionAr : video.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
