'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { tr } from '../../utils/i18n';
import { ShieldCheck, Eye, EyeOff, Loader2, Check, X, AlertCircle } from 'lucide-react';

export default function InscriptionPage() {
  const router = useRouter();
  const { language, loginFan, showToast, isLoggedIn } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // If already logged in, redirect to /compte
  React.useEffect(() => {
    if (isLoggedIn) {
      router.replace('/compte');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage(tr(language, 'Please fill in all required fields.', 'Veuillez renseigner tous les champs obligatoires.', 'يرجى ملء جميع الحقول المطلوبة.'));
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(tr(language, 'Password does not meet the security criteria.', 'Le mot de passe ne respecte pas les critères de sécurité.', 'كلمة المرور لا تستوفي معايير الأمان.'));
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage(tr(language, 'Passwords do not match.', 'Les mots de passe ne correspondent pas.', 'كلمات المرور غير متطابقة.'));
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setErrorMessage(tr(language, 'Please accept the terms and privacy policy.', "Veuillez accepter les conditions d'utilisation et la politique de confidentialité.", 'يرجى قبول شروط الاستخدام وسياسة الخصوصية.'));
      return;
    }

    setLoading(true);
    try {
      await api.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        acceptTerms: true,
      });

      // Auto-login after successful registration
      await loginFan(email.trim().toLowerCase(), password);
      showToast(
        tr(language, 'Account created successfully! Welcome to USM.', 'Compte créé avec succès ! Bienvenue à l’USM.', 'تم إنشاء الحساب بنجاح! مرحباً بك في الاتحاد.'),
        'success'
      );
      router.push('/compte');
    } catch (err: any) {
      setErrorMessage(err.message || tr(language, 'An error occurred during registration.', 'Une erreur est survenue lors de l’inscription.', 'حدث خطأ أثناء التسجيل.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A30] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: USM Branding Lockup (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center p-8 bg-[#061A3A] rounded-3xl text-white shadow-2xl relative overflow-hidden min-h-[520px]">
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
              Rejoignez la grande famille USM
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Créez votre compte en quelques secondes pour accéder à votre espace personnel, gérer vos informations et rester connecté à l’Union Sportive Monastirienne.
            </p>
            <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400">
              Fondé en 1923 · Fierté du Sahel
            </div>
          </div>
        </div>

        {/* Right column: Signup Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#DDE8F8] p-6 sm:p-10 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#071A30] font-display uppercase tracking-wide">
              {tr(language, 'Create an account', "S'inscrire", 'إنشاء حساب')}
            </h2>
            <p className="text-xs text-[#5B6B82] mt-1">
              {tr(language, 'Enter your information to get started.', 'Renseignez vos informations pour créer votre compte.', 'أدخل معلوماتك للبدء.')}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
                  {tr(language, 'First Name', 'Prénom', 'الاسم')} *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="ex. Mohamed"
                  className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 text-xs text-[#071A30] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
                  {tr(language, 'Last Name', 'Nom', 'اللقب')} *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="ex. Ben Salem"
                  className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 text-xs text-[#071A30] outline-none transition-all"
                />
              </div>
            </div>

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
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
                {tr(language, 'Password', 'Mot de passe', 'كلمة المرور')} *
              </label>
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

              {/* Password strength hints */}
              {password.length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-2 gap-1.5 text-[10px]">
                  <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {hasMinLength ? <Check size={12} /> : <X size={12} />} 8+ caractères
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {hasUpperCase ? <Check size={12} /> : <X size={12} />} Majuscule (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {hasLowerCase ? <Check size={12} /> : <X size={12} />} Minuscule (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {hasNumber ? <Check size={12} /> : <X size={12} />} Chiffre (0-9)
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
                {tr(language, 'Confirm password', 'Confirmer le mot de passe', 'تأكيد كلمة المرور')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-10 text-xs text-[#071A30] outline-none transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                        : 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-[#DDE8F8] text-[#0D63FF] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#5B6B82] leading-tight">
                  {tr(language, 'I accept the', "J'accepte les", 'أوافق على')}{' '}
                  <Link href="/conditions-utilisation" target="_blank" className="text-[#0D63FF] font-bold hover:underline">
                    {tr(language, 'Terms of Service', "conditions d'utilisation", 'شروط الاستخدام')}
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  required
                  className="mt-0.5 rounded border-[#DDE8F8] text-[#0D63FF] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#5B6B82] leading-tight">
                  {tr(language, 'I accept the', "J'accepte la", 'أوافق على')}{' '}
                  <Link href="/confidentialite" target="_blank" className="text-[#0D63FF] font-bold hover:underline">
                    {tr(language, 'Privacy Policy', 'politique de confidentialité', 'سياسة الخصوصية')}
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !acceptTerms || !acceptPrivacy}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{tr(language, 'Creating account...', 'Création du compte...', 'جار إنشاء الحساب...')}</span>
                </>
              ) : (
                <span>{tr(language, 'Create my account', 'Créer mon compte', 'إنشاء حسابي')}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#DDE8F8] text-center text-xs text-[#5B6B82]">
            {tr(language, 'Already have an account?', 'Vous avez déjà un compte ?', 'هل لديك حساب بالفعل؟')}{' '}
            <Link href="/connexion" className="text-[#0D63FF] font-bold hover:underline">
              {tr(language, 'Sign in', 'Se connecter', 'تسجيل الدخول')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
