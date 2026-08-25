'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { tr } from '../../utils/i18n';
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const { language } = useApp();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err: any) {
      // Even if error, or network error
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A30] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-[#DDE8F8] p-6 sm:p-10 shadow-xl">
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-xs text-[#5B6B82] hover:text-[#0D63FF] transition-colors mb-6 font-bold"
        >
          <ArrowLeft size={14} />
          <span>{tr(language, 'Back to login', 'Retour à la connexion', 'العودة لتسجيل الدخول')}</span>
        </Link>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-xl font-black text-[#071A30] font-display uppercase tracking-wide">
              {tr(language, 'Request received', 'Demande envoyée', 'تم استلام الطلب')}
            </h2>
            <p className="text-xs text-[#5B6B82] leading-relaxed">
              {tr(
                language,
                'If an account exists with this email address, you will receive instructions to reset your password.',
                'Si un compte existe avec cette adresse e-mail, vous recevrez les instructions nécessaires pour réinitialiser votre mot de passe.',
                'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فستتلقى التعليمات اللازمة لإعادة تعيين كلمة المرور.'
              )}
            </p>
            <div className="pt-4">
              <Link
                href="/connexion"
                className="inline-block w-full py-3 px-4 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all text-center"
              >
                {tr(language, 'Return to sign in', 'Retour à la connexion', 'العودة لتسجيل الدخول')}
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#071A30] font-display uppercase tracking-wide">
                {tr(language, 'Forgot password', 'Mot de passe oublié', 'نسيت كلمة المرور')}
              </h2>
              <p className="text-xs text-[#5B6B82] mt-1.5 leading-relaxed">
                {tr(
                  language,
                  'Enter your email address and we will send you instructions to reset your password.',
                  'Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.',
                  'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
                )}
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
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nom@exemple.com"
                    className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 pl-10 text-xs text-[#071A30] outline-none transition-all"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{tr(language, 'Sending...', 'Envoi en cours...', 'جار الإرسال...')}</span>
                  </>
                ) : (
                  <span>{tr(language, 'Reset my password', 'Réinitialiser mon mot de passe', 'إعادة تعيين كلمة المرور')}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
