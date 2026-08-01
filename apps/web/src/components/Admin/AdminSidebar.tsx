'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, LogOut, Shield } from 'lucide-react';
import { Logo } from '../Common/Logo';
import { useApp } from '../../context/AppContext';
import { ADMIN_NAV } from './adminNav';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onQuickCreate: () => void;
}

const getLabelTranslation = (label: string, lang: 'en' | 'fr' | 'ar') => {
  const dictionary: Record<string, { fr: string; ar: string }> = {
    // Groups
    'Overview': { fr: 'Aperçu', ar: 'نظرة عامة' },
    'Pages Management': { fr: 'Gestion des pages', ar: 'إدارة الصفحات' },
    'Operations & Community': { fr: 'Opérations & Communauté', ar: 'العمليات والمجتمع' },
    'System': { fr: 'Système', ar: 'النظام' },
    
    // Items
    'Dashboard': { fr: 'Tableau de bord', ar: 'لوحة القيادة' },
    'Analytics': { fr: 'Statistiques', ar: 'التحليلات' },
    'Homepage Hero': { fr: 'Accueil Hero', ar: 'واجهة الصفحة الرئيسية' },
    'Boutique Catalog': { fr: 'Catalogue Boutique', ar: 'كتالوج المغازة' },
    'Football Section': { fr: 'Section Football', ar: 'فرع كرة القدم' },
    'Basketball Section': { fr: 'Section Basket', ar: 'فرع كرة السلة' },
    'History Page': { fr: 'Page Histoire', ar: 'صفحة التاريخ' },
    'Timeline Page': { fr: 'Chronologie', ar: 'الخط الزمني' },
    'Palmarès Page': { fr: 'Palmarès', ar: 'صفحة التتويجات' },
    'Trophies List': { fr: 'Liste des Trophées', ar: 'قائمة الكؤوس' },
    'Legends': { fr: 'Légendes', ar: 'الأساطير' },
    'Stadium Guide': { fr: 'Guide du stade', ar: 'دليل الملعب' },
    'Downloads Center': { fr: 'Centre de téléchargement', ar: 'مركز التنزيلات' },
    'Season Stats': { fr: 'Stats Saison', ar: 'إحصائيات الموسم' },
    'Newsroom': { fr: 'Actualités', ar: 'غرفة الأخبار' },
    'Media Portal': { fr: 'Portail Média', ar: 'معرض الصور والفيديو' },
    'Legal Pages': { fr: 'Pages Légales', ar: 'الصفحات القانونية' },
    'Custom Pages': { fr: 'Pages Personnalisées', ar: 'الصفحات المخصصة' },
    'Shop Orders': { fr: 'Commandes', ar: 'طلبات الشراء' },
    'Sponsors & ROI': { fr: 'Partenaires & ROI', ar: 'المستشهرون' },
    'Fan Zone': { fr: 'Fan Zone', ar: 'منطقة الأحباء' },
    'Memberships': { fr: 'Adhésions', ar: 'الانخراطات' },
    'Membership Plans': { fr: 'Offres d\'adhésion', ar: 'خطط الانخراط' },
    'Donations': { fr: 'Dons', ar: 'التبرعات' },
    'Notifications': { fr: 'Notifications', ar: 'الإشعارات' },
    'Users & Roles': { fr: 'Utilisateurs & Rôles', ar: 'المستخدمون والأدوار' },
    'Settings': { fr: 'Paramètres', ar: 'الإعدادات' },
    'SEO Config': { fr: 'Configuration SEO', ar: 'إعدادات السيو' },
    'Quick Create': { fr: 'Création Rapide', ar: 'إضافة سريعة' },
    'Logout': { fr: 'Déconnexion', ar: 'تسجيل الخروج' },
    'Super Admin': { fr: 'Super Administrateur', ar: 'مدير عام' },
    'USM Admin': { fr: 'USM Admin', ar: 'إدارة الاتحاد' },
  };

  if (lang === 'en') return label;
  return dictionary[label]?.[lang] || label;
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
  onQuickCreate,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout, language } = useApp();

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const tLabel = (label: string) => getLabelTranslation(label, language);

  return (
    <>
      {mobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen z-50 bg-white border-r border-usm-border flex flex-col shrink-0 transition-all duration-300
          ${collapsed ? 'w-[76px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-usm-border shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <Logo size={30} className="shrink-0" />
            {!collapsed && (
              <span className="text-[12px] font-black uppercase tracking-wider text-usm-blue-dark truncate">
                {tLabel('USM Admin')}
              </span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:text-usm-blue-primary hover:bg-usm-blue-soft cursor-pointer shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Quick create */}
        <div className="p-3 shrink-0">
          <button
            onClick={onQuickCreate}
            className={`w-full flex items-center gap-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white rounded-xl transition-colors cursor-pointer ${
              collapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'
            }`}
            title={tLabel('Quick Create')}
          >
            <Plus size={16} className="shrink-0" />
            {!collapsed && <span className="text-xs font-bold">{tLabel('Quick Create')}</span>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-5">
          {ADMIN_NAV.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-2 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  {tLabel(group.label)}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? tLabel(item.label) : undefined}
                      className={`flex items-center gap-3 rounded-lg text-xs font-semibold transition-colors ${
                        collapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'
                      } ${
                        active
                          ? 'bg-usm-blue-primary/10 text-usm-blue-primary border border-usm-blue-primary/20'
                          : 'text-slate-600 hover:text-usm-blue-primary hover:bg-usm-blue-soft border border-transparent'
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="truncate">{tLabel(item.label)}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-usm-border shrink-0">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-usm-blue-primary/20 border border-usm-blue-primary/40 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-usm-blue-light" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-usm-blue-dark truncate">{username || 'USM Administrator'}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">{tLabel('Super Admin')}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              title={tLabel('Logout')}
              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
