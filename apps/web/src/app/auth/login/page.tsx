'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck, Trophy, Newspaper, IdCard } from 'lucide-react';

const BENEFITS: { icon: React.ElementType; en: string; fr: string; ar: string }[] = [
  { icon: IdCard, en: 'Digital supporter card', fr: 'Carte supporter digitale', ar: 'بطاقة المشجع الرقمية' },
  { icon: Trophy, en: 'Votes & match predictions', fr: 'Votes & pronostics de match', ar: 'التصويت وتوقعات المباريات' },
  { icon: ShieldCheck, en: 'Premium USM Media access', fr: 'Accès média USM premium', ar: 'محتوى إعلامي حصري' },
  { icon: Newspaper, en: 'Member-only announcements', fr: 'Annonces réservées aux membres', ar: 'إعلانات خاصة بالأعضاء' },
];

export default function LoginPage() {
  const { language, loginFan, showToast } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(tr(language, 'Please fill in all fields', 'Veuillez remplir tous les champs', 'يرجى ملء جميع الخانات'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginFan(email, password);
      showToast(
        tr(language, 'Successfully logged in!', 'Connexion réussie !', 'تم تسجيل الدخول بنجاح!'),
        'success'
      );
      router.push('/fanzone');
    } catch (err: any) {
      setError(err.message || tr(language, 'Invalid credentials', 'Identifiants incorrects', 'بيانات الاعتماد غير صالحة'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left — brand panel, logo-led (no photography) */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-usm-blue-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(13,99,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(62,214,208,0.18),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-usm-teal-accent transition-colors w-fit">
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {tr(language, 'Back to home', "Retour à l'accueil", 'العودة للرئيسية')}
        </Link>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <span className="absolute -inset-6 rounded-full bg-usm-teal-accent/15 blur-2xl" />
            <div className="relative h-28 w-28 rounded-full bg-white/[0.04] ring-1 ring-white/15 shadow-[0_0_60px_rgba(62,214,208,0.25)] flex items-center justify-center backdrop-blur-sm">
              <img src="/logo.webp" alt="USM Crest" className="h-20 w-20 object-contain animate-[logoFloat_4s_ease-in-out_infinite]" />
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-usm-teal-accent uppercase">
            <span className="h-px w-8 bg-usm-teal-accent" />
            {tr(language, 'Fan Zone', 'Espace Supporter', 'منطقة المشجع')}
            <span className="h-px w-8 bg-usm-teal-accent" />
          </span>
          <h1 className="font-display font-black text-3xl xl:text-4xl text-white uppercase tracking-wider leading-[1.05] mt-4 max-w-md">
            {tr(language, 'Join the official digital family of US Monastir', "Rejoignez la famille digitale officielle de l'US Monastir", 'انضم إلى العائلة الرقمية الرسمية للاتحاد المنستيري')}
          </h1>
          <ul className="mt-8 space-y-4 text-left rtl:text-right w-full max-w-xs">
            {BENEFITS.map((b) => (
              <li key={b.en} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-usm-teal-accent/10 border border-usm-teal-accent/30">
                  <b.icon size={16} className="text-usm-teal-accent" />
                </span>
                {tr(language, b.en, b.fr, b.ar)}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[11px] text-white/40 text-center">© {new Date().getFullYear()} Union Sportive Monastirienne</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-4 py-16 relative overflow-hidden usm-premium-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(62,214,208,0.08),transparent_50%)] pointer-events-none lg:hidden" />

        <div className="w-full max-w-md relative z-10">
          {/* Crest Logo Lockup */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <span className="absolute -inset-3 rounded-full bg-usm-teal-accent/15 blur-xl lg:hidden" />
              <div className="relative h-16 w-16 rounded-full bg-white ring-1 ring-usm-blue-primary/30 shadow-[0_8px_28px_rgba(13,99,255,0.18)] flex items-center justify-center transition-transform duration-500 hover:scale-105">
                <img src="/logo.webp" alt="USM Crest" className="h-12 w-12 object-contain" />
              </div>
            </div>
            <h2 className="text-xl font-display font-black tracking-[0.2em] text-usm-blue-dark uppercase text-center">
              {tr(language, 'Fan Zone Account', 'Espace Supporter', 'حساب المشجع')}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-usm-blue-primary mt-2">
              {tr(language, 'Access Premium Content', 'Accéder au contenu Premium', 'الدخول للمحتوى المميز')}
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 backdrop-blur-md border border-usm-border p-8 rounded-2xl shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-bold text-usm-blue-dark mb-6 text-center">
              {tr(language, 'Sign In', 'Connexion', 'تسجيل الدخول')}
            </h3>

            {error && (
              <div className="p-3 mb-5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Email Address', 'Adresse Email', 'البريد الإلكتروني')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <User size={15} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supporter@usmonastir.org"
                    className="w-full bg-white/70 backdrop-blur-sm border border-usm-border focus:border-usm-blue-primary focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs text-usm-blue-dark outline-none transition-all focus:ring-4 focus:ring-usm-blue-primary/10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    {tr(language, 'Password', 'Mot de passe', 'كلمة المرور')}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/70 backdrop-blur-sm border border-usm-border focus:border-usm-blue-primary focus:bg-white rounded-xl py-3 pl-11 pr-11 text-xs text-usm-blue-dark outline-none transition-all focus:ring-4 focus:ring-usm-blue-primary/10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-usm-blue-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{tr(language, 'Connecting...', 'Connexion...', 'جاري الاتصال...')}</span>
                  </>
                ) : (
                  <>
                    <span>{tr(language, 'Log In', 'Se connecter', 'تسجيل الدخول')}</span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Redirect Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500">
              {tr(language, "Don't have an account?", "Pas encore de compte ?", 'ليس لديك حساب؟')}{' '}
              <Link
                href="/auth/register"
                className="text-usm-blue-primary font-bold hover:underline"
              >
                {tr(language, 'Register Here', "S'inscrire ici", 'سجل هنا')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
