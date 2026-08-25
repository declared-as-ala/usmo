'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/compte';

  const { language, loginFan, showToast, isLoggedIn } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (isLoggedIn) {
      router.replace(returnTo);
    }
  }, [isLoggedIn, returnTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(tr(language, 'Please enter your email and password.', 'Veuillez saisir votre e-mail et mot de passe.', 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'));
      return;
    }

    setLoading(true);
    try {
      await loginFan(email.trim().toLowerCase(), password);
      showToast(
        tr(language, 'Connected successfully! Welcome back.', 'Connexion réussie ! Bon retour.', 'تم تسجيل الدخول بنجاح! مرحباً بك.'),
        'success'
      );
      router.push(returnTo);
    } catch (err: any) {
      setErrorMessage(err.message || tr(language, 'Invalid email or password.', 'Adresse e-mail ou mot de passe incorrect.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A30] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: USM Branding Lockup */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center p-8 bg-[#061A3A] rounded-3xl text-white shadow-2xl relative overflow-hidden min-h-[440px]">
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url('/brand/stadium-hero.png')` }}
          />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D63FF]/20 border border-[#0D63FF]/40 text-[#0D63FF] text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>US Monastir</span>
            </div>
            <h1 className="text-3xl font-black font-display uppercase tracking-tight leading-tight">
              Espace Personnel & Supporter
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connectez-vous pour accéder à votre profil, gérer vos paramètres de sécurité et retrouver vos informations personnelles.
            </p>
            <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400">
              Union Sportive Monastirienne · Depuis 1923
            </div>
          </div>
        </div>

        {/* Right column: Login Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DDE8F8] p-6 sm:p-10 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#071A30] font-display uppercase tracking-wide">
              {tr(language, 'Sign in to your account', 'Connexion', 'تسجيل الدخول')}
            </h2>
            <p className="text-xs text-[#5B6B82] mt-1">
              {tr(language, 'Enter your credentials to access your account.', 'Saisissez vos identifiants pour accéder à votre compte.', 'أدخل بياناتك للوصول إلى حسابك.')}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
                {tr(language, 'Email address', 'Adresse e-mail', 'البريد الإلكتروني')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nom@exemple.com"
                className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 text-xs text-[#071A30] outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82]">
                  {tr(language, 'Password', 'Mot de passe', 'كلمة المرور')} *
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-[11px] text-[#0D63FF] font-bold hover:underline"
                >
                  {tr(language, 'Forgot password?', 'Mot de passe oublié ?', 'نسيت كلمة المرور؟')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 pr-10 text-xs text-[#071A30] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{tr(language, 'Signing in...', 'Connexion en cours...', 'جار تسجيل الدخول...')}</span>
                </>
              ) : (
                <span>{tr(language, 'Sign in', 'Se connecter', 'تسجيل الدخول')}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#DDE8F8] text-center text-xs text-[#5B6B82]">
            {tr(language, 'Don’t have an account yet?', 'Pas encore de compte ?', 'ليس لديك حساب بعد؟')}{' '}
            <Link href="/inscription" className="text-[#0D63FF] font-bold hover:underline">
              {tr(language, 'Sign up', "S'inscrire", 'إنشاء حساب')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F6F9FF]">
          <Loader2 className="animate-spin text-[#0D63FF]" size={32} />
        </div>
      }
    >
      <ConnexionContent />
    </Suspense>
  );
}
