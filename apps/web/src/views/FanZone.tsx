'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Common/Logo';
import { api } from '../lib/api-client';
import {
  Camera,
  X,
  Check,
  Download,
  Share2,
  Users,
  CheckCircle2,
  Star,
  Trophy,
  Shield,
  Gift,
  Tv,
  HelpCircle,
  Image as ImageIcon,
  Medal,
  Crown,
  ClipboardCheck,
  MapPin,
  Flame,
  Lock,
  Loader2,
} from 'lucide-react';

const CARD_ACCENT_ID = () => `USM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;

const CARD_THEMES = [
  { id: 'royal', css: 'from-[#0D63FF] via-[#06327f] to-[#020817]', stops: ['#0D63FF', '#06327f', '#020817'] },
  { id: 'midnight', css: 'from-[#0a1f3d] via-[#020817] to-[#000305]', stops: ['#0a1f3d', '#020817', '#000305'] },
  { id: 'electric', css: 'from-[#0D63FF] via-[#0052D9] to-[#061A3A]', stops: ['#0D63FF', '#0052D9', '#061A3A'] },
  { id: 'noir', css: 'from-[#1d1d2e] via-[#0d0d18] to-[#000000]', stops: ['#1d1d2e', '#0d0d18', '#000000'] },
] as const;

const buildQrCells = (seed: string): boolean[] => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < 121; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 0x40000) !== 0);
  }
  const mark = (r: number, c: number) => {
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++) cells[(r + dr) * 11 + (c + dc)] = !(dr === 1 && dc === 1);
  };
  mark(0, 0);
  mark(0, 8);
  mark(8, 0);
  return cells;
};

const monogram = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

export const FanZone: React.FC = () => {
  const { addBluePoints, bluePoints, unlockBadge, showToast, isLoggedIn, fan, refreshMe } = useApp();
  const router = useRouter();

  // 3-State Paywall Logic
  const isMember = isLoggedIn && fan?.membershipSummary?.active;
  const paywallState = !isLoggedIn ? 'guest' : !isMember ? 'non-member' : 'unlocked';

  // Backend state
  const [activePoll, setActivePoll] = useState<any>(null);

  // Real next match (SportsDB) + predictions
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [liveMatchLoading, setLiveMatchLoading] = useState(true);
  const [matchPredictions, setMatchPredictions] = useState<any[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [myPrediction, setMyPrediction] = useState<any>(null);
  const [predictHome, setPredictHome] = useState('');
  const [predictAway, setPredictAway] = useState('');
  const [predicting, setPredicting] = useState(false);

  // Card generator state
  const [supporterName, setSupporterName] = useState(fan?.name || 'Ala USM Fan');
  const [nameDraft, setNameDraft] = useState(fan?.name || 'Ala USM Fan');
  const [photo, setPhoto] = useState<string | null>(fan?.avatar || null);
  const [photoDraft, setPhotoDraft] = useState<string | null>(fan?.avatar || null);
  const [memberId] = useState(CARD_ACCENT_ID);
  const [themeIdx, setThemeIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardPanelRef = useRef<HTMLDivElement>(null);
  const missionsRef = useRef<HTMLDivElement>(null);

  const cardTheme = CARD_THEMES[themeIdx];
  const qrCells = useMemo(() => buildQrCells(memberId), [memberId]);
  const initials = monogram(supporterName) || 'US';

  const fetchFanZoneData = async () => {
    try {
      const poll = await api.getActiveVote();
      setActivePoll(poll);
    } catch (err) {
      console.error('Error loading fan zone data:', err);
    }
  };

  const fetchLiveMatch = async () => {
    setLiveMatchLoading(true);
    try {
      const match = await api.getNextLeagueMatch();
      setLiveMatch(match || null);
    } catch (err) {
      console.error('Error loading next match:', err);
      setLiveMatch(null);
    } finally {
      setLiveMatchLoading(false);
    }
  };

  const fetchPredictions = async (matchId: string) => {
    setPredictionsLoading(true);
    try {
      const [list, mine] = await Promise.all([
        api.getPredictionsByMatch(matchId),
        isLoggedIn ? api.getMyPrediction(matchId) : Promise.resolve(null),
      ]);
      setMatchPredictions(Array.isArray(list) ? list : []);
      setMyPrediction(mine || null);
      if (mine) {
        setPredictHome(String(mine.homeScore));
        setPredictAway(String(mine.awayScore));
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
    } finally {
      setPredictionsLoading(false);
    }
  };

  const handleSubmitPrediction = async () => {
    if (!liveMatch || predictHome === '' || predictAway === '') return;
    setPredicting(true);
    try {
      const label = `${liveMatch.homeTeam} vs ${liveMatch.awayTeam} — ${liveMatch.date}`;
      const saved = await api.submitPrediction(liveMatch.id, label, Number(predictHome), Number(predictAway));
      setMyPrediction(saved);
      showToast(myPrediction ? 'Pronostic mis à jour !' : 'Pronostic enregistré ! +30 points', 'success');
      await fetchPredictions(liveMatch.id);
      await refreshMe();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du pronostic', 'error');
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    fetchFanZoneData();
    fetchLiveMatch();
    if (fan) {
      setSupporterName(fan.name || 'Supporter USM');
      setNameDraft(fan.name || 'Supporter USM');
      setPhoto(fan.avatar || null);
      setPhotoDraft(fan.avatar || null);
    }
  }, [isLoggedIn, fan]);

  useEffect(() => {
    if (liveMatch?.id) {
      fetchPredictions(liveMatch.id);
    }
  }, [liveMatch?.id, isLoggedIn]);

  // Next match countdown — driven by the real live match (SportsDB), not mock data
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!liveMatch) return;
    const target = new Date(`${liveMatch.date}T${liveMatch.time || '00:00:00'}`).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [liveMatch]);

  const matchDateLabel = liveMatch
    ? new Date(`${liveMatch.date}T00:00:00`)
        .toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase()
    : '';

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDraft(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateCard = () => {
    setSupporterName(nameDraft.trim() || 'USM Supporter');
    setPhoto(photoDraft);
    unlockBadge('Card Owner');
    addBluePoints(25);
    showToast('Ta carte fan a été générée ! +25 points', 'success');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Ma Carte Fan US Monastir',
      text: `Je suis supporter officiel de l'US Monastir ! ID Fan : ${memberId}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text} — ${shareData.url}`);
        showToast('Lien copié dans le presse-papiers !', 'info');
      }
    } catch {
      /* user cancelled */
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1012;
      canvas.height = 638;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, cardTheme.stops[0]);
      grad.addColorStop(0.5, cardTheme.stops[1]);
      grad.addColorStop(1, cardTheme.stops[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#0D63FF';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      const logoImg = await loadImage('/logo.webp');
      ctx.globalAlpha = 0.12;
      ctx.drawImage(logoImg, canvas.width - 430, 80, 360, 360);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(logoImg, 50, 50, 80, 80);

      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('US MONASTIR', 150, 85);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#0D63FF';
      ctx.fillText('SUPPORTER OFFICIEL', 150, 112);

      if (photo) {
        const avatarImg = await loadImage(photo);
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 320, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, 70, 240, 160, 160);
        ctx.restore();
        ctx.strokeStyle = '#0D63FF';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(150, 320, 80, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#06152B';
        ctx.beginPath();
        ctx.arc(150, 320, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0D63FF';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(150, 320, 80, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0D63FF';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 150, 320);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }

      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(supporterName.toUpperCase(), 260, 315);
      ctx.font = 'italic 26px Georgia, serif';
      ctx.fillStyle = '#0D63FF';
      ctx.fillText(fan?.city || 'Monastir', 262, 355);

      const qrSize = 130;
      const qrX = canvas.width - qrSize - 60;
      const qrY = canvas.height - qrSize - 70;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
      const cell = qrSize / 11;
      ctx.fillStyle = '#020817';
      qrCells.forEach((on, i) => {
        if (on) ctx.fillRect(qrX + (i % 11) * cell, qrY + Math.floor(i / 11) * cell, cell - 1, cell - 1);
      });

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 470);
      ctx.lineTo(canvas.width - 240, 470);
      ctx.stroke();

      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('ID FAN', 50, 515);
      ctx.font = 'bold 24px Courier, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(memberId, 50, 550);

      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('SCORE', 380, 515);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#0D63FF';
      ctx.fillText(`${bluePoints} PTS`, 380, 550);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Carte-Fan-USM-${supporterName.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export card:', error);
      showToast("Erreur lors de l'export de la carte", 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Paywall overlay element builder
  const renderPaywallOverlay = (scopeName: string) => {
    if (paywallState === 'unlocked') return null;
    const isGuest = paywallState === 'guest';
    return (
      <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-xs space-y-3 bg-white/90 border border-usm-blue-primary/20 p-6 rounded-2xl shadow-xl">
          <Lock className="text-usm-blue-primary mx-auto" size={22} />
          <h4 className="text-xs font-display font-black text-usm-blue-dark uppercase tracking-wider">
            {isGuest ? 'Connexion requise' : 'Abonnement requis'}
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {isGuest
              ? `Rejoignez l'espace abonné pour accéder à la fonctionnalité : ${scopeName}.`
              : `Débloquez votre accès premium à la Fan Zone en souscrivant à un abonnement.`}
          </p>
          <button
            onClick={() => router.push(isGuest ? '/auth/login' : '/abonnement')}
            className="w-full py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors cursor-pointer"
          >
            {isGuest ? 'Se connecter' : 'Voir les offres'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-14 pt-24 lg:pt-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* TOP HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-4 items-stretch">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1 min-h-[380px] rounded-3xl overflow-hidden border border-usm-border">
              <Image
                src="/fans.png"
                alt="Les supporters"
                fill
                priority
                quality={90}
                className="object-cover object-[center_30%] brightness-[0.85] contrast-[1.08] saturate-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-usm-blue-dark via-usm-blue-dark/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-usm-blue-dark/80 via-usm-blue-dark/35 to-transparent" />
              <div className="absolute -top-16 -right-16 w-[380px] h-[380px] bg-usm-blue-primary/15 rounded-full blur-[130px] pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col justify-center p-7 sm:p-10">
                <div className="space-y-4 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 text-[9px] bg-usm-blue-primary text-white font-black tracking-widest px-3 py-1.5 rounded uppercase">
                    <Flame size={10} /> USM Supporter Experience
                  </span>
                  <h1 className="font-display italic font-black uppercase leading-[0.95] tracking-wide">
                    <span className="block text-2xl sm:text-3xl text-usm-blue-dark">Bienvenue dans la</span>
                    <span className="block text-5xl sm:text-7xl mt-1">
                      <span className="text-usm-blue-dark">Fan </span>
                      <span className="text-usm-blue-primary">Zone</span>
                    </span>
                  </h1>
                  <p className="text-sm text-slate-700/90 leading-relaxed max-w-md">
                    Pronostiquez le score du prochain match, gagnez des points, et générez votre carte fan officielle.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => scrollTo(cardPanelRef)}
                      className="px-5 py-3 bg-gradient-to-r from-usm-blue-primary to-yellow-500 text-usm-blue-dark text-[11px] font-black uppercase tracking-wider rounded-lg cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                    >
                      Générer ma carte fan
                    </button>
                    <button
                      onClick={() => scrollTo(missionsRef)}
                      className="px-5 py-3 border border-white/25 hover:border-usm-border0 text-usm-blue-dark text-[11px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                    >
                      Pronostiquer le match
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, value: '12,458', label: 'Fans actifs' },
                { icon: CheckCircle2, value: activePoll?.totalVotes?.toLocaleString() || '3,245', label: 'Votes enregistrés' },
                { icon: Star, value: '2,034', label: 'Prédictions' },
                { icon: Trophy, value: (fan?.points || bluePoints).toLocaleString(), label: 'Mes Points USM' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-usm-blue-soft/60 border border-usm-border rounded-2xl px-4 py-4 flex items-center gap-3"
                >
                  <span className="h-9 w-9 rounded-lg bg-usm-blue-primary/15 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-light shrink-0">
                    <s.icon size={16} />
                  </span>
                  <div className="leading-tight min-w-0">
                    <span className="block font-display font-black text-lg text-usm-blue-dark">{s.value}</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold truncate">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD GENERATOR (Paywalled) */}
          <div ref={cardPanelRef} className="relative bg-usm-blue-soft/60 border border-usm-border rounded-3xl p-6 flex flex-col gap-4 overflow-hidden">
            {renderPaywallOverlay('Carte Supporter')}

            <div>
              <h2 className="font-display font-black text-lg text-usm-blue-dark uppercase tracking-wider">
                Génère ta carte fan
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Configurez votre carte avec votre photo et nom.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-11 w-11 rounded-full overflow-hidden border border-dashed border-usm-border hover:border-usm-blue-primary/60 bg-white/70 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                {photoDraft ? (
                  <img src={photoDraft} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Camera size={15} className="text-slate-500 group-hover:text-usm-blue-primary transition-colors" />
                )}
              </button>
              {photoDraft && (
                <button
                  type="button"
                  onClick={() => setPhotoDraft(null)}
                  className="p-1 text-slate-500 hover:text-red-400 cursor-pointer shrink-0"
                >
                  <X size={13} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Nom complet"
                maxLength={26}
                className="flex-1 min-w-0 bg-white/80 border border-usm-border text-xs text-usm-blue-dark rounded-lg px-3 py-2.5 outline-none focus:border-usm-blue-primary/60 transition-colors"
              />
              <button
                onClick={handleGenerateCard}
                className="h-9 w-9 rounded-lg bg-usm-blue-primary text-white flex items-center justify-center cursor-pointer hover:bg-usm-blue-hover transition-colors shrink-0"
              >
                <Check size={15} />
              </button>
            </div>

            {/* CARD */}
            <div className={`relative aspect-[1.7] w-full rounded-2xl overflow-hidden bg-gradient-to-br ${cardTheme.css} border border-usm-blue-primary/60 p-4 flex flex-col justify-between shadow-2xl`}>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-[0.14] pointer-events-none select-none">
                <Logo size={150} variant="color" />
              </div>
              <div className="absolute inset-0 bg-noise-fine opacity-[0.05] mix-blend-overlay pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2.5">
                <Logo size={30} />
                <div className="leading-none">
                  <span className="text-[10px] text-usm-blue-dark font-black uppercase tracking-widest block">US Monastir</span>
                  <span className="text-[7px] text-usm-blue-primary font-extrabold tracking-[0.2em] uppercase block mt-1">
                    Supporter Officiel
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg border-2 border-usm-blue-primary/80 shadow-lg overflow-hidden shrink-0 bg-usm-blue-primary/25 flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display font-black text-base text-usm-blue-primary">{initials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-display font-black text-usm-blue-dark uppercase tracking-wider truncate">
                    {supporterName}
                  </h4>
                  <span className="font-serif italic text-[13px] text-usm-blue-primary/90 block -mt-0.5">{fan?.city || 'Monastir'}</span>
                </div>
                <div className="shrink-0 bg-white rounded p-1 grid grid-cols-11 gap-px h-14 w-14">
                  {qrCells.map((on, i) => (
                    <span key={i} className={on ? 'bg-usm-blue-dark' : 'bg-white'} />
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between border-t border-usm-border pt-2 text-[8px] text-slate-500">
                <div>
                  <span className="uppercase tracking-wider">ID Fan</span>
                  <strong className="text-usm-blue-dark block font-mono text-[10px] tracking-wide">{memberId}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-right">
                    <span className="uppercase tracking-wider">Score</span>
                    <strong className="text-usm-blue-primary block font-black text-[10px] uppercase tracking-wider">
                      {fan?.points || bluePoints} PTS
                    </strong>
                  </div>
                  <span className="h-6 w-6 rounded bg-gradient-to-br from-usm-blue-primary to-yellow-600 flex items-center justify-center text-usm-blue-dark shrink-0">
                    <Crown size={12} />
                  </span>
                </div>
              </div>
            </div>

            {/* Design picker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                  Choisis ton design
                </span>
                {CARD_THEMES.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeIdx(i)}
                    className={`h-5 w-5 rounded-full bg-gradient-to-br ${t.css} cursor-pointer transition-all ${
                      themeIdx === i ? 'ring-2 ring-usm-blue-primary ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Download/Share */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 py-3 bg-transparent hover:bg-usm-blue-primary hover:text-white text-usm-blue-primary border border-usm-blue-primary/60 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 group"
              >
                <Download size={14} />
                {isDownloading ? 'Téléchargement...' : 'Télécharger ma carte'}
              </button>
              <button
                onClick={handleShare}
                className="h-auto px-3.5 border border-usm-border hover:border-usm-blue-primary/50 text-slate-600 hover:text-usm-blue-primary rounded-xl cursor-pointer transition-colors"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* PROCHAIN MATCH + PRONOSTICS (real SportsDB data) */}
        <div ref={missionsRef} className="bg-usm-blue-soft/60 border border-usm-border rounded-2xl p-5 sm:p-6">
          {liveMatchLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-usm-blue-primary" size={20} />
            </div>
          ) : liveMatch ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Match info + countdown */}
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-[11px] font-black text-usm-blue-dark uppercase tracking-wider">Prochain match</h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{liveMatch.competition}</p>
                </div>
                <div className="flex items-center justify-center gap-5 py-2">
                  <div className="flex flex-col items-center gap-1.5 w-20">
                    {liveMatch.homeBadge ? (
                      <Image src={liveMatch.homeBadge} alt={liveMatch.homeTeam} width={44} height={44} className="object-contain h-11 w-11" unoptimized />
                    ) : (
                      <Logo size={40} />
                    )}
                    <span className="text-[9px] font-black text-usm-blue-dark uppercase text-center leading-tight">{liveMatch.homeTeam}</span>
                  </div>
                  <span className="font-display font-black text-lg text-usm-blue-primary">VS</span>
                  <div className="flex flex-col items-center gap-1.5 w-20">
                    {liveMatch.awayBadge ? (
                      <Image src={liveMatch.awayBadge} alt={liveMatch.awayTeam} width={44} height={44} className="object-contain h-11 w-11" unoptimized />
                    ) : (
                      <span className="h-11 w-11 rounded-full bg-slate-800 border border-usm-border flex items-center justify-center font-display font-black text-xs text-slate-600">
                        {monogram(liveMatch.awayTeam)}
                      </span>
                    )}
                    <span className="text-[9px] font-black text-usm-blue-dark uppercase text-center leading-tight">{liveMatch.awayTeam}</span>
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-[11px] font-bold text-usm-blue-dark">
                    {matchDateLabel} <span className="text-usm-blue-primary">• {liveMatch.time?.slice(0, 5)}</span>
                  </p>
                  {liveMatch.venue && (
                    <p className="text-[9px] text-slate-500 flex items-center justify-center gap-1">
                      <MapPin size={9} /> {liveMatch.venue}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {[
                    [countdown.d, 'Jours'],
                    [countdown.h, 'Heures'],
                    [countdown.m, 'Min'],
                    [countdown.s, 'Sec'],
                  ].map(([v, l]) => (
                    <div key={l as string} className="bg-white/70 border border-usm-border rounded-lg py-2.5 text-center">
                      <span className="block font-mono font-black text-sm text-usm-blue-dark">{String(v).padStart(2, '0')}</span>
                      <span className="block text-[7px] uppercase tracking-widest text-slate-500 mt-0.5">{l as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prediction form + all fans' predictions (Paywalled) */}
              <div className="relative bg-white/70 border border-usm-border rounded-xl p-4 flex flex-col gap-3 overflow-hidden min-h-[280px]">
                {renderPaywallOverlay('Pronostics des Supporters')}

                <div>
                  <span className="text-[9px] font-black text-usm-blue-primary uppercase tracking-wider">Pronostic</span>
                  <h4 className="text-xs font-bold text-usm-blue-dark mt-1">Prédisez le score final</h4>
                </div>

                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase truncate max-w-20">{liveMatch.homeTeam}</span>
                    <input
                      type="number"
                      min={0}
                      value={predictHome}
                      onChange={(e) => setPredictHome(e.target.value)}
                      className="w-14 h-12 text-center text-lg font-mono font-black text-usm-blue-dark border border-usm-border rounded-lg focus:outline-none focus:border-usm-blue-primary"
                    />
                  </div>
                  <span className="font-display font-black text-slate-400 mt-4">—</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase truncate max-w-20">{liveMatch.awayTeam}</span>
                    <input
                      type="number"
                      min={0}
                      value={predictAway}
                      onChange={(e) => setPredictAway(e.target.value)}
                      className="w-14 h-12 text-center text-lg font-mono font-black text-usm-blue-dark border border-usm-border rounded-lg focus:outline-none focus:border-usm-blue-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitPrediction}
                  disabled={predicting || predictHome === '' || predictAway === ''}
                  className="w-full py-2.5 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {predicting ? 'Enregistrement...' : myPrediction ? 'Mettre à jour mon pronostic' : 'Valider mon pronostic (+30 pts)'}
                </button>

                <div className="border-t border-usm-border pt-2.5 mt-1 flex-1 overflow-y-auto max-h-40 no-scrollbar">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Pronostics des supporters ({matchPredictions.length})
                  </p>
                  {predictionsLoading ? (
                    <div className="flex items-center justify-center h-16">
                      <Loader2 className="animate-spin text-usm-blue-primary" size={14} />
                    </div>
                  ) : matchPredictions.length > 0 ? (
                    <div className="space-y-1">
                      {matchPredictions.map((p: any) => (
                        <div key={p._id} className="flex items-center justify-between text-[10px] px-1.5 py-1 rounded bg-usm-blue-soft/50">
                          <span className="font-semibold text-slate-700 truncate">{p.fanName}</span>
                          <span className="font-mono font-bold text-usm-blue-dark shrink-0">{p.homeScore} - {p.awayScore}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 text-center py-3">Soyez le premier à pronostiquer !</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">Aucun match programmé pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};
