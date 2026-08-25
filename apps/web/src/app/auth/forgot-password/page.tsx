'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api-client';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { tr } from '../../../utils/i18n'

export default function ForgotPasswordPage() {
  const { language } = useApp();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || tr(language, 'An error occurred', 'Une erreur est survenue', 'حدث خطأ ما'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020813] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,99,255,0.18),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050D1E]/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#0d63ff] to-transparent" />

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <span className="absolute -inset-4 rounded-full bg-usm-blue-primary/20 blur-xl" />
            <div className="relative h-16 w-16 rounded-full bg-white/5 ring-1 ring-white/15 shadow-[0_0_40px_rgba(13,99,255,0.2)] flex items-center justify-center backdrop-blur-md">
              <img src="/logo.webp" alt="USM" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-[0.1em]">
            {tr(language, 'Forgot Password', 'Mot de passe oublié', 'نسيت كلمة المرور')}
          </h1>
          <p className="mt-2 text-xs text-slate-400 text-center">
            {tr(language, 'Enter your email to receive a reset link.', 'Entrez votre adresse email pour recevoir un lien de réinitialisation.', 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين.')}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Mail size={24} />
            </div>
            <p className="text-sm text-emerald-400 font-medium">
              {tr(language, 'If this email exists in our system, a password reset link has been sent.', 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.', 'إذا كان هذا البريد موجودًا، فقد تم إرسال رابط إعادة التعيين.')}
            </p>
            <Link href="/" className="mt-4 flex items-center gap-2 text-sm text-usm-blue-primary font-bold hover:underline">
              <ArrowLeft size={16} /> {tr(language, 'Back to Home', 'Retour à l\'accueil', 'العودة للرئيسية')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                {tr(language, 'Email Address', 'Adresse Email', 'البريد الإلكتروني')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-white/5 border border-white/10 focus:border-[#0d63ff] focus:bg-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none transition-all focus:ring-4 focus:ring-[#0d63ff]/10 placeholder:text-slate-650"
              />
            </div>

            {error && (
              <div role="alert" className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email}
              className="mt-2 w-full py-3.5 bg-usm-blue-primary hover:bg-white text-white hover:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-usm-blue-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                tr(language, 'Send Reset Link', 'Envoyer le lien', 'إرسال الرابط')
              )}
            </button>
            
            <div className="text-center pt-2">
              <Link href="/auth/register" className="text-[11px] font-bold text-usm-blue-primary hover:underline uppercase tracking-wide">
                {tr(language, 'Create an account', 'Créer un compte', 'إنشاء حساب جديد')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
