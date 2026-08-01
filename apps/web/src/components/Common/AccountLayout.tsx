'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { tr } from '../../utils/i18n';
import { User, Shield, Heart, CreditCard, IdCard, Package, MapPin, Zap, Award, Gift, Activity, Bell, LifeBuoy } from 'lucide-react';

export const AccountLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, language } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-usm-blue-primary" />
          <span className="text-xs text-slate-500 font-semibold tracking-wider">Chargement...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/compte', label: tr(language, 'Overview', 'Mon Compte', 'نظرة عامة'), icon: User },
    { href: '/compte/profil', label: tr(language, 'Profile Settings', 'Paramètres', 'إعدادات الحساب'), icon: Shield },
    { href: '/compte/notifications', label: tr(language, 'Notifications', 'Notifications', 'الإشعارات'), icon: Bell },
    { href: '/compte/securite', label: tr(language, 'Security', 'Sécurité', 'الأمان'), icon: Shield },
    { href: '/abonnement', label: tr(language, 'Membership', 'Mon Abonnement', 'اشتراكي'), icon: CreditCard },
    { href: '/compte/carte-supporter', label: tr(language, 'Supporter Card', 'Carte Supporter', 'بطاقة المشجع'), icon: IdCard },
    { href: '/compte/commandes', label: tr(language, 'Orders', 'Mes Commandes', 'طلباتي'), icon: Package },
    { href: '/compte/adresses', label: tr(language, 'Addresses', 'Mes Adresses', 'عناويني'), icon: MapPin },
    { href: '/compte/favoris', label: tr(language, 'Wishlist', 'Mes Favoris', 'المفضلة'), icon: Heart },
    { href: '/compte/dons', label: tr(language, 'Donations', 'Dons & Soutiens', 'تبرعاتي'), icon: Heart },
    { href: '/compte/points', label: tr(language, 'Points', 'Mes Points', 'نقاطي'), icon: Zap },
    { href: '/compte/badges', label: tr(language, 'Badges', 'Mes Badges', 'أوسمتي'), icon: Award },
    { href: '/compte/recompenses', label: tr(language, 'Rewards', 'Récompenses', 'المكافآت'), icon: Gift },
    { href: '/compte/activite', label: tr(language, 'Activity', 'Mon Activité', 'نشاطي'), icon: Activity },
    { href: '/compte/support', label: tr(language, 'Support', 'Assistance', 'المساعدة'), icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="usm-card border border-usm-border p-5 space-y-1">
              <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 mb-4">
                {tr(language, 'Settings', 'Mon Espace', 'الإعدادات')}
              </h3>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-usm-blue-primary/15 text-usm-blue-primary border-l-2 border-usm-blue-primary'
                        : 'text-slate-600 hover:bg-usm-blue-soft hover:text-white'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-usm-blue-primary' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Account Viewport */}
          <main className="flex-grow">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
