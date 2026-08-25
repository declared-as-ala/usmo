'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { tr } from '../../utils/i18n';
import { User, Shield, LogOut, UserCheck, LayoutDashboard } from 'lucide-react';

export const AccountLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, language, logout, fan, username } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token && !isLoggedIn) {
      router.push(`/connexion?returnTo=${encodeURIComponent(pathname || '/compte')}`);
    }
  }, [isLoggedIn, router, pathname]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F6F9FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D63FF]" />
          <span className="text-xs text-[#5B6B82] font-semibold tracking-wider">Chargement de votre compte...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/compte', label: tr(language, 'Overview', "Vue d'ensemble", 'نظرة عامة'), icon: LayoutDashboard },
    { href: '/compte/profil', label: tr(language, 'Personal Info', 'Informations personnelles', 'المعلومات الشخصية'), icon: UserCheck },
    { href: '/compte/securite', label: tr(language, 'Security', 'Sécurité', 'الأمان'), icon: Shield },
  ];

  const initials = (fan?.firstName?.[0] || fan?.name?.[0] || username?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A30] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Account Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#DDE8F8] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#061A3A] text-white flex items-center justify-center font-black font-display text-xl shrink-0 shadow-md">
              {fan?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fan.avatar} alt="Avatar" className="h-full w-full object-cover rounded-2xl" />
              ) : (
                initials
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0D63FF] block">
                {tr(language, 'MY ACCOUNT', 'MON COMPTE', 'حسابي')}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#071A30] font-display uppercase tracking-tight">
                {tr(language, 'Hello', 'Bonjour', 'مرحباً')}, {fan?.firstName || username || 'Supporter'}
              </h1>
              <p className="text-xs text-[#5B6B82] mt-0.5">
                {tr(
                  language,
                  'Manage your personal details and account security.',
                  'Gérez vos informations personnelles et la sécurité de votre compte.',
                  'إدارة معلوماتك الشخصية وأمان حسابك.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>{tr(language, 'Sign Out', 'Se déconnecter', 'تسجيل الخروج')}</span>
          </button>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-1 bg-white border border-[#DDE8F8] p-1.5 rounded-2xl overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0D63FF] text-white shadow-md shadow-[#0D63FF]/20'
                    : 'text-[#5B6B82] hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Desktop Sidebar + Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3">
            <div className="bg-white border border-[#DDE8F8] rounded-3xl p-4 shadow-sm space-y-1.5 sticky top-24">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#5B6B82]">
                {tr(language, 'Navigation', 'Navigation', 'التنقل')}
              </div>

              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#0D63FF] text-white shadow-lg shadow-[#0D63FF]/25 font-black'
                        : 'text-[#071A30] hover:bg-[#F6F9FF] hover:text-[#0D63FF]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#5B6B82]'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-[#DDE8F8]">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer text-left rtl:text-right"
                >
                  <LogOut size={16} />
                  <span>{tr(language, 'Sign Out', 'Se déconnecter', 'تسجيل الخروج')}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Account Viewport */}
          <main className="md:col-span-8 lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
