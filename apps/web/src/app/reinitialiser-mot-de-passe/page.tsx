'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { tr } from '../../utils/i18n';
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, Check, X, ArrowLeft } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { language, showToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage(tr(language, 'Reset token is missing or invalid.', 'Jeton de réinitialisation manquant ou invalide.', 'رمز إعادة التعيين مفقود أو غير صالح.'));
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(tr(language, 'Password does not meet the security requirements.', 'Le mot de passe ne respecte pas les critères de sécurité.', 'كلمة المرور لا تستوفي الشروط الأمنية.'));
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage(tr(language, 'Passwords do not match.', 'Les mots de passe ne correspondent pas.', 'كلمات المرور غير متطابقة.'));
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      showToast(
        tr(language, 'Password reset successfully! You can now log in.', 'Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.', 'تمت إعادة تعيين كلمة المرور بنجاح!'),
        'success'
      );
    } catch (err: any) {
      setErrorMessage(err.message || tr(language, 'Invalid or expired reset link.', 'Lien de réinitialisation invalide ou expiré.', 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A30] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-[#DDE8F8] p-6 sm:p-10 shadow-xl">
        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-xl font-black text-[#071A30] font-display uppercase tracking-wide">
              {tr(language, 'Password updated', 'Mot de passe modifié', 'تم تغيير كلمة المرور')}
            </h2>
            <p className="text-xs text-[#5B6B82] leading-relaxed">
              {tr(
                language,
                'Your password has been reset successfully. You can now log in with your new credentials.',
                'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.',
                'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام بياناتك الجديدة.'
              )}
            </p>
            <div className="pt-4">
              <Link
                href="/connexion"
                className="inline-block w-full py-3 px-4 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all text-center"
              >
                {tr(language, 'Sign in', 'Se connecter', 'تسجيل الدخول')}
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <Link
              href="/connexion"
              className="inline-flex items-center gap-1.5 text-xs text-[#5B6B82] hover:text-[#0D63FF] transition-colors mb-6 font-bold"
            >
              <ArrowLeft size={14} />
              <span>{tr(language, 'Back to login', 'Retour à la connexion', 'العودة لتسجيل الدخول')}</span>
            </Link>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#071A30] font-display uppercase tracking-wide">
                {tr(language, 'Reset password', 'Nouveau mot de passe', 'إعادة تعيين كلمة المرور')}
              </h2>
              <p className="text-xs text-[#5B6B82] mt-1.5">
                {tr(language, 'Enter and confirm your new secure password.', 'Définissez votre nouveau mot de passe sécurisé.', 'أدخل كلمة المرور الجديدة وقم بتأكيدها.')}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!token && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>{tr(language, 'Missing reset token in URL.', 'Jeton de réinitialisation manquant dans l’URL.', 'رمز إعادة التعيين مفقود في الرابط.')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
                  {tr(language, 'New password', 'Nouveau mot de passe', 'كلمة المرور الجديدة')} *
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

              <button
                type="submit"
                disabled={submitting || !token || !isPasswordValid || !passwordsMatch}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{tr(language, 'Updating...', 'Mise à jour...', 'جار التحديث...')}</span>
                  </>
                ) : (
                  <span>{tr(language, 'Update password', 'Modifier le mot de passe', 'تغيير كلمة المرور')}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F6F9FF]">
          <Loader2 className="animate-spin text-[#0D63FF]" size={32} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
