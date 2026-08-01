'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { api } from '../../lib/api-client';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Trophy, Calendar, ShieldCheck, CreditCard, Heart, ShoppingBag, Sparkles, Newspaper } from 'lucide-react';

interface DonationRow { amount: number; paymentStatus: string; }

export default function ComptePage() {
  const { fan, language } = useApp();

  const [donations, setDonations] = useState<DonationRow[]>([]);

  useEffect(() => {
    api.getMyDonations().then((data) => setDonations(data || [])).catch(() => {});
  }, []);

  const totalDonated = donations
    .filter((d) => d.paymentStatus === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const membership = fan?.membershipSummary || {
    active: false,
    plan: null,
    daysRemaining: 0,
    benefitsUnlocked: [],
    renewalCta: false,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="usm-card border border-usm-border p-8 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-white to-usm-blue-soft">
        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-usm-blue-primary/40 shrink-0 bg-usm-blue-soft flex items-center justify-center">
          {fan?.avatar ? (
            <img src={fan.avatar} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User size={36} className="text-slate-500" />
          )}
        </div>
        <div className="text-center sm:text-left rtl:text-right">
          <h2 className="text-2xl font-display font-black text-usm-blue-dark">{fan?.name || fan?.email}</h2>
          <p className="text-xs text-usm-blue-primary font-bold uppercase tracking-wider mt-1">
            {tr(language, 'Supporter Account', 'Compte Supporter', 'حساب مشجع')}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-slate-500 text-xs">
            {fan?.city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                <span>{fan.city}</span>
              </span>
            )}
            {fan?.favoriteSport && (
              <span className="flex items-center gap-1">
                <Trophy size={13} />
                <span>
                  {fan.favoriteSport === 'both'
                    ? tr(language, 'Football & Basketball', 'Football & Basket', 'كرة قدم وسلة')
                    : fan.favoriteSport === 'football'
                    ? 'Football'
                    : 'Basketball'}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="usm-card border border-usm-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider border-b border-usm-border pb-3 mb-4">
            {tr(language, 'Personal Details', 'Informations Personnelles', 'البيانات الشخصية')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs py-2 border-b border-usm-border">
              <span className="text-slate-500 flex items-center gap-2">
                <User size={14} />
                <span>{tr(language, 'Full Name', 'Nom Complet', 'الاسم الكامل')}</span>
              </span>
              <span className="text-usm-blue-dark font-semibold">{fan?.name || '-'}</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-usm-border">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail size={14} />
                <span>{tr(language, 'Email Address', 'Adresse Email', 'البريد الإلكتروني')}</span>
              </span>
              <span className="text-usm-blue-dark font-semibold">{fan?.email}</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-usm-border">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone size={14} />
                <span>{tr(language, 'Phone Number', 'Téléphone', 'رقم الهاتف')}</span>
              </span>
              <span className="text-usm-blue-dark font-semibold">{fan?.phone || '-'}</span>
            </div>
            <div className="flex justify-between text-xs py-2">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar size={14} />
                <span>{tr(language, 'Member Since', 'Membre Depuis', 'عضو منذ')}</span>
              </span>
              <span className="text-usm-blue-dark font-semibold">
                {fan?.createdAt ? new Date(fan.createdAt).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Membership Info Card */}
        <div className="usm-card border border-usm-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider border-b border-usm-border pb-3 mb-4">
              {tr(language, 'Membership Subscription', 'Mon Abonnement', 'اشتراكي')}
            </h3>

            {membership.active ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">{membership.plan}</h4>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                      {tr(language, 'Active Plan', 'Abonnement Actif', 'الاشتراك نشط')}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-usm-border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tr(language, 'Days remaining:', 'Jours restants :', 'الأيام المتبقية:')}</span>
                    <span className="text-usm-blue-dark font-mono font-bold">{membership.daysRemaining}</span>
                  </div>
                  {membership.endDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tr(language, 'Expiry Date:', 'Date d\'expiration :', 'تاريخ الانتهاء:')}</span>
                      <span className="text-usm-blue-dark font-mono">{new Date(membership.endDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="h-12 w-12 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center mx-auto mb-3">
                  <CreditCard size={20} className="text-usm-blue-primary" />
                </div>
                <h4 className="text-xs font-bold text-usm-blue-dark">
                  {tr(language, 'No Active Subscription', 'Aucun Abonnement Actif', 'لا يوجد اشتراك نشط')}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {tr(
                    language,
                    'Subscribe to a membership plan to unlock the Fan Zone and exclusive media content.',
                    'Abonnez-vous à un plan d\'adhésion pour débloquer la Zone Fans et le contenu média exclusif.',
                    'اشترك في إحدى الباقات لفتح منطقة الأحباء والمحتوى الإعلامي الحصري.'
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-usm-border mt-4">
            <Link
              href="/abonnement"
              className="w-full block py-2.5 bg-usm-blue-primary text-white text-[11px] font-black uppercase tracking-wider text-center rounded-lg hover:bg-usm-blue-hover transition-colors cursor-pointer"
            >
              {membership.active
                ? tr(language, 'Manage Membership', 'Gérer mon abonnement', 'إدارة اشتراكي')
                : tr(language, 'Subscribe Now', 'S\'abonner maintenant', 'اشترك الآن')}
            </Link>
          </div>
        </div>
      </div>

      {/* Donation Summary */}
      <div className="usm-card border border-usm-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Heart size={18} className="fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">
              {tr(language, 'My Contributions', 'Mes Contributions', 'مساهماتي')}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {donations.length > 0
                ? tr(language, `${donations.length} donation(s) recorded`, `${donations.length} don(s) enregistré(s)`, `${donations.length} تبرع مسجل`)
                : tr(language, 'No donations yet', 'Aucun don pour le moment', 'لا توجد تبرعات بعد')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-usm-border px-4 py-2 rounded-xl text-center shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">{tr(language, 'Total Donated', 'Total Donné', 'إجمالي التبرعات')}</span>
            <span className="text-lg font-mono font-black text-usm-blue-primary">{totalDonated} TND</span>
          </div>
          <Link href="/compte/dons" className="text-[10px] font-black text-usm-blue-primary uppercase tracking-wider hover:underline shrink-0">
            {tr(language, 'View history', 'Voir l’historique', 'عرض السجل')}
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          {tr(language, 'Quick Links', 'Accès Rapides', 'روابط سريعة')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/boutique', icon: ShoppingBag, label: tr(language, 'Shop', 'Boutique', 'المتجر') },
            { href: '/fanzone', icon: Sparkles, label: tr(language, 'Fan Zone', 'Fan Zone', 'منطقة الأحباء') },
            { href: '/actualites', icon: Newspaper, label: tr(language, 'News', 'Actualités', 'الأخبار') },
            { href: '/don', icon: Heart, label: tr(language, 'Donate', 'Faire un don', 'تبرع') },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="usm-card border border-usm-border p-4 flex flex-col items-center gap-2 text-center hover:border-usm-blue-primary/40 transition-colors"
            >
              <link.icon size={18} className="text-usm-blue-primary" />
              <span className="text-[10px] font-bold text-usm-blue-dark uppercase tracking-wide">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
