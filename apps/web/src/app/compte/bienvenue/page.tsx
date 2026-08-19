'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { api } from '../../../lib/api-client';
import { Trophy, ShieldCheck, Bell, ArrowRight, Loader2, PartyPopper } from 'lucide-react';

export default function OnboardingPage() {
  const { fan, language, refreshMe, showToast } = useApp();
  const router = useRouter();

  const [favoriteSport, setFavoriteSport] = useState<'football' | 'basketball' | 'both'>(() => fan?.favoriteSport || 'both');
  const [favoritePlayer, setFavoritePlayer] = useState(() => fan?.favoritePlayer || '');
  const [newsletterOptIn, setNewsletterOptIn] = useState(() => fan?.newsletterOptIn ?? true);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ favoriteSport, favoritePlayer, newsletterOptIn });
      await refreshMe();
      showToast(tr(language, 'Welcome to USM!', 'Bienvenue à l’USM !', 'مرحبا بك في الاتحاد!'), 'success');
      router.push('/compte');
    } catch {
      router.push('/compte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="h-14 w-14 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center mx-auto mb-4">
          <PartyPopper size={24} className="text-usm-blue-primary" />
        </div>
        <h1 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wider">
          {tr(language, `Welcome, ${fan?.firstName || fan?.name || ''}!`, `Bienvenue, ${fan?.firstName || fan?.name || ''} !`, `مرحبا بك، ${fan?.firstName || fan?.name || ''}!`)}
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          {tr(language, 'A few quick preferences to personalize your USM experience.', 'Quelques préférences rapides pour personnaliser votre expérience USM.', 'بضع تفضيلات سريعة لتخصيص تجربتك مع الاتحاد.')}
        </p>
      </div>

      <div className="usm-card border border-usm-border p-8 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">
            <Trophy size={13} className="text-usm-blue-primary" /> {tr(language, 'Favorite section', 'Section préférée', 'القسم المفضل')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['football', 'basketball', 'both'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFavoriteSport(s)}
                className={`py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                  favoriteSport === s ? 'bg-usm-blue-primary text-white' : 'bg-usm-blue-soft text-slate-600 hover:bg-usm-blue-soft/70'
                }`}
              >
                {s === 'football' ? '⚽ Football' : s === 'basketball' ? '🏀 Basket' : tr(language, 'Both', 'Les deux', 'كلاهما')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
            <ShieldCheck size={13} className="text-usm-blue-primary" /> {tr(language, 'Favorite player (optional)', 'Joueur préféré (optionnel)', 'اللاعب المفضل (اختياري)')}
          </label>
          <input
            type="text"
            value={favoritePlayer}
            onChange={(e) => setFavoritePlayer(e.target.value)}
            placeholder={tr(language, 'e.g. Moez Ben Cherifia', 'ex. Moez Ben Cherifia', 'مثال: معز بن شريفية')}
            className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-4 text-xs text-usm-blue-dark outline-none transition-all"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={newsletterOptIn}
            onChange={(e) => setNewsletterOptIn(e.target.checked)}
            className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 cursor-pointer"
          />
          <span className="text-[11px] text-slate-600 leading-snug flex items-center gap-1.5">
            <Bell size={12} className="text-usm-blue-primary shrink-0" />
            {tr(language, 'Send me club news and exclusive supporter offers.', 'Envoyez-moi les actualités du club et des offres exclusives.', 'أرسل لي أخبار النادي والعروض الحصرية للمشجعين.')}
          </span>
        </label>

        <button
          onClick={finish}
          disabled={saving}
          className="w-full usm-btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : (
            <>
              <span>{tr(language, 'Enter my account', 'Accéder à mon compte', 'الدخول إلى حسابي')}</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </>
          )}
        </button>

        <button onClick={() => router.push('/compte')} className="w-full text-center text-[11px] text-slate-500 hover:text-usm-blue-primary cursor-pointer">
          {tr(language, 'Skip for now', 'Passer pour le moment', 'تخطي الآن')}
        </button>
      </div>
    </div>
  );
}
