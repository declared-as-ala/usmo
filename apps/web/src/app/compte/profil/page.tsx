'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { api } from '../../../lib/api-client';
import { Save, Loader2, UserCheck, Mail, ShieldAlert, AlertCircle } from 'lucide-react';

export default function ProfilPage() {
  const { fan, language, refreshMe, showToast } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (fan) {
      setFirstName(fan.firstName || fan.name?.split(' ')[0] || '');
      setLastName(fan.lastName || fan.name?.split(' ').slice(1).join(' ') || '');
      setEmail(fan.email || '');
    }
  }, [fan]);

  const emailChanged = fan?.email && email.trim().toLowerCase() !== fan.email.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage(tr(language, 'All fields are required.', 'Tous les champs sont obligatoires.', 'جميع الحقول مطلوبة.'));
      return;
    }

    setLoading(true);
    try {
      // 1. Update basic profile info (firstName, lastName)
      await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // 2. If email changed, perform secure email update
      if (emailChanged) {
        await api.updateEmail(email.trim().toLowerCase(), currentPassword || undefined);
      }

      await refreshMe();
      showToast(
        tr(language, 'Your information has been updated.', 'Vos informations ont été mises à jour.', 'تم تحديث معلوماتك بنجاح.'),
        'success'
      );
      setCurrentPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || tr(language, 'Error updating information.', 'Erreur lors de la mise à jour des informations.', 'حدث خطأ أثناء تحديث المعلومات.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-6 border-b border-[#DDE8F8] mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#0D63FF]/10 text-[#0D63FF] flex items-center justify-center shrink-0">
          <UserCheck size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#071A30] font-display uppercase tracking-wide">
            {tr(language, 'Personal Information', 'Informations personnelles', 'المعلومات الشخصية')}
          </h2>
          <p className="text-xs text-[#5B6B82] mt-0.5">
            {tr(language, 'Update your name and email address.', 'Modifiez vos informations personnelles ci-dessous.', 'قم بتعديل بياناتك الشخصية أدناه.')}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
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

        {/* If user is modifying email, show security password confirmation prompt */}
        {emailChanged && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <span>{tr(language, 'Security verification', 'Vérification de sécurité', 'تأكيد الأمان')}</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              {tr(
                language,
                'You are changing your email address. Please enter your current password to confirm this change.',
                'Vous êtes en train de modifier votre adresse e-mail. Veuillez saisir votre mot de passe actuel pour confirmer.',
                'أنت بصدد تغيير بريدك الإلكتروني. يرجى إدخال كلمة المرور الحالية للتأكيد.'
              )}
            </p>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1">
                {tr(language, 'Current Password', 'Mot de passe actuel', 'كلمة المرور الحالية')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-amber-300 focus:border-[#0D63FF] focus:ring-1 focus:ring-[#0D63FF] rounded-xl px-4 py-2 text-xs text-[#071A30] outline-none"
              />
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim()}
            className="py-3 px-6 rounded-xl bg-[#0D63FF] hover:bg-[#0052D9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{tr(language, 'Saving...', 'Enregistrement...', 'جار الحفظ...')}</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{tr(language, 'Save Changes', 'Enregistrer les modifications', 'حفظ التعديلات')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
