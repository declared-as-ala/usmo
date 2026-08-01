'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { api } from '../../../lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, Phone, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, IdCard, Trophy, ShieldCheck, Newspaper } from 'lucide-react';

const BENEFITS: { icon: React.ElementType; en: string; fr: string; ar: string }[] = [
  { icon: IdCard, en: 'Digital supporter card', fr: 'Carte supporter digitale', ar: 'بطاقة المشجع الرقمية' },
  { icon: Trophy, en: 'Votes & match predictions', fr: 'Votes & pronostics de match', ar: 'التصويت وتوقعات المباريات' },
  { icon: ShieldCheck, en: 'Premium USM Media access', fr: 'Accès média USM premium', ar: 'محتوى إعلامي حصري' },
  { icon: Newspaper, en: 'Member-only announcements', fr: 'Annonces réservées aux membres', ar: 'إعلانات خاصة بالأعضاء' },
];

export default function RegisterPage() {
  const { language, loginFan, showToast } = useApp();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email || !password) {
      setError(tr(language, 'Please fill in all required fields', 'Veuillez remplir tous les champs obligatoires', 'يرجى ملء جميع الخانات الإلزامية'));
      return;
    }
    if (!acceptTerms) {
      setError(tr(language, 'You must accept the terms of service', "Vous devez accepter les conditions d'utilisation", 'يجب عليك قبول شروط الخدمة'));
      return;
    }

    const [firstWord, ...rest] = fullName.trim().split(/\s+/);
    const firstName = firstWord;
    const lastName = rest.join(' ') || firstWord;

    setLoading(true);
    setError('');

    try {
      await api.register({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
        acceptTerms,
      });

      await loginFan(email, password);

      showToast(
        tr(language, 'Account created successfully!', 'Votre compte a été créé avec succès !', 'تم إنشاء الحساب بنجاح!'),
        'success'
      );
      router.push('/compte/bienvenue');
    } catch (err: any) {
      setError(err.message || tr(language, 'An error occurred during registration', "Une erreur est survenue lors de l'inscription", 'حدث خطأ أثناء التسجيل'));
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
              <img src="/logo.webp" alt="USM Crest" className="h-20 w-20 object-contain" />
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
      <div className="flex items-center justify-center px-4 py-16 relative overflow-hidden">
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
              {tr(language, 'Join US Monastir', 'Créer un Compte Supporter', 'إنشاء حساب أحباء')}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-usm-blue-primary mt-2">
              {tr(language, 'One City. One Heart. One Club.', 'Une Ville. Un Cœur. Un Club.', 'مدينة واحدة. قلب واحد. نادٍ واحد.')}
            </p>
          </div>

          {/* Form Card */}
          <div className="usm-card border border-usm-blue-primary/20 p-8 shadow-[0_18px_45px_rgba(13,99,255,0.10)]">
            <h3 className="text-lg font-bold text-usm-blue-dark mb-6 text-center">
              {tr(language, 'Register', 'Inscription', 'التسجيل')}
            </h3>

            {error && (
              <div className="p-3 mb-5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Full Name *', 'Nom complet *', 'الاسم الكامل *')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Wajdi Kechrida"
                    className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-3 pl-11 pr-4 text-xs text-usm-blue-dark outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Email Address *', 'Adresse Email *', 'البريد الإلكتروني *')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="wajdi@kechrida.tn"
                    className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-3 pl-11 pr-4 text-xs text-usm-blue-dark outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Phone Number', 'Numéro de Téléphone', 'رقم الهاتف')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <Phone size={15} />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 99 999 999"
                    className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-3 pl-11 pr-4 text-xs text-usm-blue-dark outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Password *', 'Mot de passe *', 'كلمة المرور *')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-3 pl-11 pr-11 text-xs text-usm-blue-dark outline-none transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Terms acceptance */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  required
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  {tr(
                    language,
                    'I accept the ',
                    "J'accepte les ",
                    'أوافق على '
                  )}
                  <Link href="/conditions-utilisation" className="text-usm-blue-primary font-bold hover:underline">
                    {tr(language, 'terms of use', "conditions d'utilisation", 'شروط الاستخدام')}
                  </Link>
                  {tr(language, ' and the processing of my personal data.', ' et le traitement de mes données personnelles.', ' ومعالجة بياناتي الشخصية.')}
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full usm-btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-usm-blue-dark rounded-xl cursor-pointer hover:bg-usm-blue-hover hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{tr(language, 'Creating account...', 'Création du compte...', 'جاري إنشاء الحساب...')}</span>
                  </>
                ) : (
                  <>
                    <span>{tr(language, 'Register', "S'inscrire", 'التسجيل')}</span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Redirect Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500">
              {tr(language, 'Already have an account?', 'Vous avez déjà un compte ?', 'هل لديك حساب بالفعل؟')}{' '}
              <Link href="/auth/login" className="text-usm-blue-primary font-bold hover:underline">
                {tr(language, 'Sign In', 'Se connecter', 'تسجيل الدخول')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
