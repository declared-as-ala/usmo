'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, Globe, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ADMIN_NAV } from './adminNav';

const LANGUAGES: { code: 'en' | 'fr' | 'ar'; native: string }[] = [
  { code: 'en', native: 'EN' },
  { code: 'fr', native: 'FR' },
  { code: 'ar', native: 'AR' },
];

interface AdminTopbarProps {
  onOpenMobileNav: () => void;
  onQuickCreate: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onOpenMobileNav, onQuickCreate }) => {
  const pathname = usePathname();
  const { language, setLanguage, isOrderManager } = useApp();
  const [langOpen, setLangOpen] = useState(false);

  const activeItem = ADMIN_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))).find((i) =>
    i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href)
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6 shrink-0">
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 min-w-0">
        <Link href={isOrderManager ? '/admin/orders' : '/admin'} className="hover:text-usm-blue-primary transition-colors">
          Admin
        </Link>
        {activeItem && activeItem.href !== '/admin' && (
          <>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-slate-500">{activeItem.group}</span>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-slate-900 truncate">{activeItem.label}</span>
          </>
        )}
      </div>

      {/* Global search — hidden for GESTIONNAIRE_COMMANDES */}
      {!isOrderManager && (
        <div className="hidden md:flex flex-1 max-w-sm ms-4">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search matches, players, orders..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 rtl:pl-3 rtl:pr-9 pr-3 text-xs text-slate-700 outline-none focus:border-usm-blue-primary focus:bg-white transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isOrderManager && (
          <button
            onClick={onQuickCreate}
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={14} /> Create
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="h-9 px-2.5 flex items-center gap-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer text-xs font-bold"
          >
            <Globe size={16} />
            {language.toUpperCase()}
          </button>
          {langOpen && (
            <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-28 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left rtl:text-right px-3 py-2 text-xs font-semibold cursor-pointer ${
                    language === l.code ? 'text-usm-blue-primary bg-usm-blue-primary/5' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
        </button>
      </div>
    </header>
  );
};
