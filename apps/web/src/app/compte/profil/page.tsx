'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/i18n';
import { api } from '../../../lib/api-client';
import { User, Shield, MapPin, Trophy, Camera, Loader2, Save } from 'lucide-react';

export default function ProfilPage() {
  const { fan, language, refreshMe, showToast } = useApp();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    country: 'Tunisie',
    favoriteSport: 'both' as 'football' | 'basketball' | 'both',
    favoritePlayer: '',
  });

  const [privacyForm, setPrivacyForm] = useState({
    showProfilePublicly: false,
    showCity: false,
    showRanking: false,
    showDonationBadge: false,
    showDonationAmount: false,
    useNickname: false,
  });

  const [uploading, setUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // Sync state with fan data on mount/change
  useEffect(() => {
    if (fan) {
      setProfileForm({
        firstName: fan.firstName || '',
        lastName: fan.lastName || '',
        phone: fan.phone || '',
        city: fan.city || '',
        country: fan.country || 'Tunisie',
        favoriteSport: fan.favoriteSport || 'both',
        favoritePlayer: fan.favoritePlayer || '',
      });

      if (fan.privacySettings) {
        setPrivacyForm({
          showProfilePublicly: !!fan.privacySettings.showProfilePublicly,
          showCity: !!fan.privacySettings.showCity,
          showRanking: !!fan.privacySettings.showRanking,
          showDonationBadge: !!fan.privacySettings.showDonationBadge,
          showDonationAmount: !!fan.privacySettings.showDonationAmount,
          useNickname: !!fan.privacySettings.useNickname,
        });
      }
    }
  }, [fan]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrivacyForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.updateProfile(profileForm);
      await refreshMe();
      showToast(
        tr(language, 'Profile updated successfully!', 'Profil mis à jour avec succès !', 'تم تحديث الملف الشخصي بنجاح!'),
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrivacyLoading(true);
    try {
      await api.updatePrivacy(privacyForm);
      await refreshMe();
      showToast(
        tr(language, 'Privacy settings updated!', 'Paramètres de confidentialité mis à jour !', 'تم تحديث إعدادات الخصوصية!'),
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating privacy settings', 'error');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.uploadAvatar(formData);
      await refreshMe();
      showToast(
        tr(language, 'Avatar uploaded successfully!', 'Photo de profil mise à jour !', 'تم تحميل الصورة الشخصية بنجاح!'),
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error uploading avatar', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Header */}
      <div className="usm-card border border-usm-border p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-usm-blue-primary/40 bg-usm-blue-soft flex items-center justify-center">
            {fan?.avatar ? (
              <img src={fan.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User size={36} className="text-slate-500" />
            )}
          </div>
          {/* Upload overlay */}
          <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
            {uploading ? (
              <Loader2 className="h-5 w-5 text-usm-blue-primary animate-spin" />
            ) : (
              <Camera className="h-5 w-5 text-usm-blue-primary" />
            )}
          </label>
        </div>
        <div className="text-center sm:text-left rtl:text-right">
          <h3 className="text-lg font-bold text-usm-blue-dark uppercase tracking-wider">{tr(language, 'Profile Picture', 'Photo de profil', 'الصورة الشخصية')}</h3>
          <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
            {tr(
              language,
              'Hover and click on the photo to upload a new one. Max file size: 10MB.',
              'Survolez et cliquez pour charger une nouvelle photo. Max : 10 Mo.',
              'قم بتمرير الفأرة والضغط على الصورة لتحميل صورة جديدة. الحجم الأقصى: 10 ميغابايت.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
        {/* Profile Info Form */}
        <div className="usm-card border border-usm-border p-6">
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider border-b border-usm-border pb-3 mb-6">
            {tr(language, 'Profile Details', 'Modifier le Profil', 'تعديل البيانات')}
          </h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'First Name', 'Prénom', 'الاسم الأول')}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3.5 text-xs text-usm-blue-dark outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Last Name', 'Nom', 'اللقب')}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3.5 text-xs text-usm-blue-dark outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                {tr(language, 'Phone Number', 'Numéro de Téléphone', 'رقم الهاتف')}
              </label>
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3.5 text-xs text-usm-blue-dark outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'City', 'Ville', 'المدينة')}
                </label>
                <input
                  type="text"
                  name="city"
                  value={profileForm.city}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3.5 text-xs text-usm-blue-dark outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Country', 'Pays', 'البلد')}
                </label>
                <input
                  type="text"
                  name="country"
                  value={profileForm.country}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3.5 text-xs text-usm-blue-dark outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Favorite USM Section', 'Section préférée', 'الفرع المفضل')}
                </label>
                <select
                  name="favoriteSport"
                  value={profileForm.favoriteSport}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3 text-xs text-usm-blue-dark outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="both">{tr(language, 'Football & Basketball', 'Football & Basket', 'كرة قدم وسلة')}</option>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  {tr(language, 'Favorite Player', 'Joueur préféré', 'اللاعب المفضل')}
                </label>
                <input
                  type="text"
                  name="favoritePlayer"
                  value={profileForm.favoritePlayer}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-usm-border focus:border-usm-blue-primary rounded-xl py-2.5 px-3.5 text-xs text-usm-blue-dark outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full usm-btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-usm-blue-dark rounded-xl cursor-pointer hover:bg-usm-blue-hover hover:text-white transition-all duration-300 mt-6"
            >
              {profileLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  <span>{tr(language, 'Save Changes', 'Enregistrer', 'حفظ التغييرات')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Privacy Settings Form */}
        <div className="usm-card border border-usm-border p-6">
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider border-b border-usm-border pb-3 mb-6">
            {tr(language, 'Privacy Preferences', 'Confidentialité & Affichage', 'إعدادات الخصوصية')}
          </h3>
          <form onSubmit={handlePrivacySubmit} className="space-y-4">
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showProfilePublicly"
                  checked={privacyForm.showProfilePublicly}
                  onChange={handlePrivacyChange}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold text-usm-blue-dark uppercase tracking-wider text-[10px]">
                    {tr(language, 'Show Profile Publicly', 'Afficher mon profil publiquement', 'عرض الملف الشخصي للعامة')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {tr(language, 'Allow other fans to search for your profile.', 'Permettre aux autres fans de voir mon profil.', 'السماح للأحباء الآخرين بالبحث عن ملفك الشخصي.')}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showCity"
                  checked={privacyForm.showCity}
                  onChange={handlePrivacyChange}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold text-usm-blue-dark uppercase tracking-wider text-[10px]">
                    {tr(language, 'Show City', 'Afficher ma ville', 'عرض المدينة')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {tr(language, 'Display your city on your public profile card.', 'Afficher ma ville sur ma fiche de profil.', 'عرض مدينتك على بطاقة ملفك الشخصي.')}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showRanking"
                  checked={privacyForm.showRanking}
                  onChange={handlePrivacyChange}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold text-usm-blue-dark uppercase tracking-wider text-[10px]">
                    {tr(language, 'Show in Rankings', 'Afficher dans le classement', 'الظهور في لائحة المتصدرين')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {tr(language, 'Participate and display your points in the fan leaderboard.', 'Afficher mes points dans le classement des fans.', 'المشاركة والظهور بنقاطك في لائحة متصدري الأحباء.')}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showDonationBadge"
                  checked={privacyForm.showDonationBadge}
                  onChange={handlePrivacyChange}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold text-usm-blue-dark uppercase tracking-wider text-[10px]">
                    {tr(language, 'Show Donation Badge', 'Afficher mes badges de soutien', 'عرض شارات التبرع')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {tr(language, 'Show supporter tiers on rankings and leaderboards.', 'Afficher mes badges de donateur sur le classement.', 'عرض رتبة الدعم الخاصة بك في لائحة المتصدرين.')}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showDonationAmount"
                  checked={privacyForm.showDonationAmount}
                  onChange={handlePrivacyChange}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold text-usm-blue-dark uppercase tracking-wider text-[10px]">
                    {tr(language, 'Show Donation Amount', 'Afficher mes montants de soutien', 'عرض مبالغ التبرع')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {tr(language, 'Display the exact amount of donations publicly.', 'Afficher le montant exact de mes dons publiquement.', 'عرض المبلغ الدقيق لتبرعاتك علناً.')}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="useNickname"
                  checked={privacyForm.useNickname}
                  onChange={handlePrivacyChange}
                  className="mt-0.5 rounded border-usm-border bg-white text-usm-blue-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold text-usm-blue-dark uppercase tracking-wider text-[10px]">
                    {tr(language, 'Use Display Name', 'Utiliser mon pseudonyme', 'استخدام اسم العرض')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {tr(language, 'Use nickname instead of real name for display (defaults to email username).', 'Utiliser un pseudonyme à la place du vrai nom.', 'استخدام اسم العرض بدلاً من الاسم الحقيقي.')}
                  </span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={privacyLoading}
              className="w-full usm-btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-usm-blue-dark rounded-xl cursor-pointer hover:bg-usm-blue-hover hover:text-white transition-all duration-300 mt-6"
            >
              {privacyLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  <span>{tr(language, 'Update Privacy', 'Enregistrer la confidentialité', 'تحديث الخصوصية')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
