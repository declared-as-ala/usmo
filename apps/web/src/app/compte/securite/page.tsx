'use client';

import React, { useState } from 'react';
import { api } from '../../../lib/api-client';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { Shield, KeyRound, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';

export default function MySecurityPage() {
  const { language, showToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError(tr(language, 'Please enter your current password.', 'Veuillez saisir votre mot de passe actuel.', 'يرجى إدخال كلمة المرور الحالية.'));
      return;
    }

    if (!isPasswordValid) {
      setError(tr(language, 'The new password does not meet security requirements.', 'Le nouveau mot de passe ne respecte pas les critères de sécurité.', 'كلمة المرور الجديدة لا تستوفي شروط الأمان.'));
      return;
    }

    if (!passwordsMatch) {
      setError(tr(language, 'New passwords do not match.', 'Les nouveaux mots de passe ne correspondent pas.', 'كلمات المرور الجديدة غير متطابقة.'));
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess(true);
      showToast(
        tr(language, 'Your password has been changed successfully.', 'Votre mot de passe a été modifié avec succès.', 'تم تغيير كلمة المرور بنجاح.'),
        'success'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || tr(language, 'Failed to update password.', 'Impossible de modifier le mot de passe.', 'فشل تغيير كلمة المرور.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-6 border-b border-[#DDE8F8] mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#0D63FF]/10 text-[#0D63FF] flex items-center justify-center shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#071A30] font-display uppercase tracking-wide">
            {tr(language, 'Account Security', 'Sécurité du compte', 'أمان الحساب')}
          </h2>
          <p className="text-xs text-[#5B6B82] mt-0.5">
            {tr(language, 'Change and protect your password.', 'Gérez votre mot de passe et protégez l’accès à votre compte.', 'إدارة كلمة المرور وحماية حسابك.')}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{tr(language, 'Your password has been changed successfully.', 'Votre mot de passe a été modifié avec succès.', 'تم تغيير كلمة المرور بنجاح.')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
            {tr(language, 'Current password', 'Mot de passe actuel', 'كلمة المرور الحالية')} *
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 pr-10 text-xs text-[#071A30] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[#5B6B82] mb-1.5">
            {tr(language, 'New password', 'Nouveau mot de passe', 'كلمة المرور الجديدة')} *
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-white border border-[#DDE8F8] focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2.5 pr-10 text-xs text-[#071A30] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Password strength indicators */}
          {newPassword.length > 0 && (
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
            {tr(language, 'Confirm new password', 'Confirmer le nouveau mot de passe', 'تأكيد كلمة المرور الجديدة')} *
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving || !currentPassword || !isPasswordValid || !passwordsMatch}
            className="py-3 px-6 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{tr(language, 'Modifying...', 'Modification...', 'جار التعديل...')}</span>
              </>
            ) : (
              <>
                <KeyRound size={15} />
                <span>{tr(language, 'Change Password', 'Modifier le mot de passe', 'تغيير كلمة المرور')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
