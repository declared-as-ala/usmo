'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminQuickCreate } from './AdminQuickCreate';
import { api } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';
import { Loader2, LockKeyhole, ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { isSuperAdmin, isOrderManager, refreshMe } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'login'>('checking');
  const [email, setEmail] = useState('admin@usmonastir.com.tn');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    refreshMe()
      .then((data) => {
        if (data && (data._id || data.id || data.email)) {
          setAuthState('authenticated');
        } else {
          setAuthState('login');
        }
      })
      .catch(() => setAuthState('login'));
  }, []);

  // Redirect GESTIONNAIRE_COMMANDES landing on /admin directly to /admin/orders
  React.useEffect(() => {
    if (authState === 'authenticated' && isOrderManager && pathname === '/admin') {
      router.replace('/admin/orders');
    }
  }, [authState, isOrderManager, pathname, router]);

  if (authState === 'checking') {
    return <div className="flex min-h-dvh items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-400" aria-label="Vérification de la session" /></div>;
  }

  if (authState === 'login') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#020813] p-4 relative overflow-hidden">
        {/* Luxury Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,99,255,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setAuthError('');
            try {
              await api.login(email, password);
              const data = await refreshMe();
              setAuthState('authenticated');
              const role = (data?.role || '').toUpperCase().replace(/[\s_]+/g, '_');
              if (role === 'GESTIONNAIRE_COMMANDES') {
                router.replace('/admin/orders');
              }
            } catch (error) {
              setAuthError(error instanceof Error ? error.message : 'Connexion impossible');
            } finally {
              setSubmitting(false);
            }
          }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050D1E]/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-usm-blue-primary/30"
        >
          {/* Luxury gold accent line on top */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          {/* Medallion crest lockup */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative mb-4">
              <span className="absolute -inset-4 rounded-full bg-usm-blue-primary/20 blur-xl" />
              <div className="relative h-20 w-20 rounded-full bg-white/5 ring-1 ring-white/15 shadow-[0_0_40px_rgba(13,99,255,0.2)] flex items-center justify-center backdrop-blur-md">
                <img src="/logo.webp" alt="USM Crest" className="h-14 w-14 object-contain animate-[logoFloat_4s_ease-in-out_infinite]" />
              </div>
            </div>
            <h1 className="text-lg font-display font-black text-white uppercase tracking-[0.18em]">
              USM ADMIN PORTAL
            </h1>
            <p className="mt-1.5 text-[9px] uppercase font-bold tracking-[0.2em] text-[#D4AF37]">
              SECURED CONTROL CENTER
            </p>
          </div>

          <div className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="admin@usmonastir.com.tn"
                className="w-full bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:bg-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none transition-all focus:ring-4 focus:ring-[#D4AF37]/10 placeholder:text-slate-650"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-[#D4AF37] focus:bg-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none transition-all focus:ring-4 focus:ring-[#D4AF37]/10 placeholder:text-slate-650"
              />
            </div>

            {authError && (
              <div role="alert" className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <div className="flex justify-end">
              <a href="/auth/forgot-password" target="_blank" className="text-[10px] text-usm-blue-primary font-bold hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Connect Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-3.5 bg-[#D4AF37] hover:bg-white text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-[#D4AF37]/15 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <LockKeyhole size={14} />
                  <span>SIGN IN TO PORTAL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    );
  }

  // 1. If GESTIONNAIRE_COMMANDES: only /admin/orders* and /admin/discount-codes*
  const isOrderManagerAllowed =
    pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/discount-codes');

  // 2. Super Admin only routes (Administrators, Audit logs, Sports configuration)
  const isSuperAdminOnlyRoute =
    pathname.startsWith('/admin/administrateurs') ||
    pathname.startsWith('/admin/audit-logs') ||
    pathname.startsWith('/admin/settings/sports');

  let accessDenied = false;
  let accessDeniedMessage = '';
  let accessDeniedReturnUrl = '/admin';
  let accessDeniedReturnLabel = 'Retour au tableau de bord';

  if (isOrderManager && !isOrderManagerAllowed) {
    accessDenied = true;
    accessDeniedMessage =
      'Votre rôle (Gestionnaire des commandes) ne vous autorise pas à accéder à cette section. Vous avez accès exclusivement à la gestion des commandes et à la consultation des codes promo.';
    accessDeniedReturnUrl = '/admin/orders';
    accessDeniedReturnLabel = 'Aller aux commandes';
  } else if (!isSuperAdmin && isSuperAdminOnlyRoute) {
    accessDenied = true;
    accessDeniedMessage =
      'Cette section est strictement réservée au Super Administrateur de la plateforme.';
    accessDeniedReturnUrl = '/admin';
    accessDeniedReturnLabel = 'Retour au tableau de bord';
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onQuickCreate={() => setQuickCreateOpen(true)}
      />

      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        <AdminTopbar onOpenMobileNav={() => setMobileNavOpen(true)} onQuickCreate={() => setQuickCreateOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {accessDenied ? (
            <div className="min-h-[55vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-black text-[#071A30] uppercase tracking-tight font-display">
                  Accès refusé
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {accessDeniedMessage}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => router.push(accessDeniedReturnUrl)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-usm-blue-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-usm-blue-primary/90 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{accessDeniedReturnLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <AdminQuickCreate open={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} />
    </div>
  );
};
