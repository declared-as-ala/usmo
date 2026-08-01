'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { CreditCard, ShieldCheck, Lock, Calendar } from 'lucide-react';

export default function SupporterCardPage() {
  const { fan, language } = useApp();

  const membership = fan?.membershipSummary;
  const isActive = !!membership?.active;

  const memberNumber = fan?._id ? `USM-${String(fan._id).slice(-6).toUpperCase()}` : '—';
  const memberSince = fan?.createdAt ? new Date(fan.createdAt).getFullYear() : '—';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-display font-black text-xl text-usm-blue-dark uppercase tracking-wider">
          {tr(language, 'Digital Supporter Card', 'Carte Supporter Digitale', 'بطاقة المشجع الرقمية')}
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          {tr(language, 'Your official membership card, always in your pocket.', 'Votre carte d’adhésion officielle, toujours avec vous.', 'بطاقة عضويتك الرسمية، دائما معك.')}
        </p>
      </div>

      {isActive ? (
        <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-usm-blue-dark via-usm-blue-secondary to-usm-blue-dark p-6 flex flex-col justify-between text-white">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-usm-blue-primary/30 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-usm-accent-gold/15 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.webp" alt="USM" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-display font-black text-sm uppercase tracking-wider leading-none">US Monastir</p>
                <p className="text-[9px] text-white/60 uppercase tracking-widest mt-0.5">{tr(language, 'Official Supporter Card', 'Carte Supporter Officielle', 'بطاقة المشجع الرسمية')}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-usm-accent-gold/20 text-usm-accent-gold px-2.5 py-1 rounded-full border border-usm-accent-gold/40">
              <ShieldCheck size={11} /> {membership.plan}
            </span>
          </div>

          <div className="relative">
            <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">{tr(language, 'Member', 'Membre', 'العضو')}</p>
            <p className="font-display font-black text-lg uppercase tracking-wide">{fan?.name}</p>
          </div>

          <div className="relative flex items-end justify-between text-[10px]">
            <div>
              <p className="text-white/50 uppercase tracking-widest mb-0.5">{tr(language, 'Member No.', 'N° Membre', 'رقم العضو')}</p>
              <p className="font-mono font-bold tracking-wider">{memberNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 uppercase tracking-widest mb-0.5">{tr(language, 'Since', 'Depuis', 'منذ')}</p>
              <p className="font-mono font-bold">{memberSince}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-usm-border bg-usm-blue-soft p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white border border-usm-border flex items-center justify-center text-slate-400">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-usm-blue-dark">{tr(language, 'Card Locked', 'Carte Verrouillée', 'البطاقة مقفلة')}</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
              {tr(language, 'Subscribe to a membership plan to unlock your digital supporter card.', 'Abonnez-vous à un plan d’adhésion pour débloquer votre carte supporter digitale.', 'اشترك في إحدى الباقات لفتح بطاقة المشجع الرقمية.')}
            </p>
          </div>
        </div>
      )}

      {isActive && membership.daysRemaining !== undefined && (
        <div className="usm-card border border-usm-border p-4 flex items-center gap-3 text-xs">
          <Calendar size={16} className="text-usm-blue-primary shrink-0" />
          <span className="text-slate-600">
            {tr(language, `${membership.daysRemaining} days remaining on your membership.`, `${membership.daysRemaining} jours restants sur votre adhésion.`, `${membership.daysRemaining} يوما متبقيا في عضويتك.`)}
          </span>
        </div>
      )}

      <Link
        href="/abonnement"
        className="w-full flex items-center justify-center gap-2 py-3 bg-usm-blue-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-usm-blue-hover transition-colors"
      >
        <CreditCard size={14} />
        {isActive
          ? tr(language, 'Manage Membership', 'Gérer mon abonnement', 'إدارة اشتراكي')
          : tr(language, 'View Membership Plans', 'Voir les plans d’adhésion', 'عرض خطط الاشتراك')}
      </Link>
    </div>
  );
}
