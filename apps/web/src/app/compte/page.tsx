'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { User, Shield, ChevronRight, CheckCircle2, Calendar, Mail, UserCheck } from 'lucide-react';

export default function CompteOverviewPage() {
  const { fan, username, language } = useApp();

  const fullName = `${fan?.firstName || ''} ${fan?.lastName || ''}`.trim() || fan?.name || username || 'Supporter USM';
  const email = fan?.email || '—';
  const initials = (fan?.firstName?.[0] || fan?.name?.[0] || username?.[0] || 'U').toUpperCase();

  // Format account creation date
  const memberSince = fan?.createdAt
    ? new Date(fan.createdAt).toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '2026';

  const statusLabel = fan?.status === 'Active' || !fan?.status
    ? tr(language, 'Active account', 'Compte actif', 'حساب مفعل')
    : tr(language, 'Inactive account', 'Compte inactif', 'حساب غير مفعل');

  return (
    <div className="space-y-6">
      {/* ── PROFILE OVERVIEW CARD ─────────────────────────────── */}
      <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#DDE8F8]">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#061A3A] text-white flex items-center justify-center text-2xl font-black font-display shrink-0 shadow-md">
              {fan?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fan.avatar} alt={fullName} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                initials
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A30] font-display uppercase tracking-tight">
                {fullName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#5B6B82] mt-0.5">
                <Mail size={13} className="text-[#0D63FF]" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          <Link
            href="/compte/profil"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#0D63FF]/20 transition-all cursor-pointer"
          >
            <UserCheck size={14} />
            <span>{tr(language, 'Edit my info', 'Modifier mes informations', 'تعديل بياناتي')}</span>
          </Link>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6B82] block">
                {tr(language, 'Account Status', 'Statut du compte', 'حالة الحساب')}
              </span>
              <span className="text-xs font-black text-[#071A30]">{statusLabel}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-[#0D63FF] flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6B82] block">
                {tr(language, 'Member since', 'Membre depuis', 'عضو منذ')}
              </span>
              <span className="text-xs font-black text-[#071A30]">{memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT QUICK NAVIGATION ─────────────────────────── */}
      <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#5B6B82] px-2 mb-2">
          {tr(language, 'Account Management', 'Gestion du compte', 'إدارة الحساب')}
        </h3>

        <Link
          href="/compte/profil"
          className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F6F9FF] border border-transparent hover:border-[#DDE8F8] transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0D63FF]/10 text-[#0D63FF] flex items-center justify-center group-hover:bg-[#0D63FF] group-hover:text-white transition-colors">
              <User size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#071A30]">
                {tr(language, 'Personal Information', 'Informations personnelles', 'المعلومات الشخصية')}
              </h4>
              <p className="text-[11px] text-[#5B6B82] mt-0.5">
                {tr(language, 'Update your name and email address.', 'Modifiez votre nom, prénom et adresse e-mail.', 'تعديل الاسم واللقب والبريد الإلكتروني.')}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#5B6B82] group-hover:text-[#0D63FF] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/compte/securite"
          className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F6F9FF] border border-transparent hover:border-[#DDE8F8] transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0D63FF]/10 text-[#0D63FF] flex items-center justify-center group-hover:bg-[#0D63FF] group-hover:text-white transition-colors">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#071A30]">
                {tr(language, 'Security & Password', 'Sécurité du compte', 'أمان الحساب')}
              </h4>
              <p className="text-[11px] text-[#5B6B82] mt-0.5">
                {tr(language, 'Change and protect your password.', 'Modifiez votre mot de passe et protégez vos accès.', 'تغيير كلمة المرور وحماية حسابك.')}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#5B6B82] group-hover:text-[#0D63FF] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
