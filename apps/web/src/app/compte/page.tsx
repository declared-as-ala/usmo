'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { api } from '../../lib/api-client';
import {
  User,
  Shield,
  CheckCircle2,
  Calendar,
  Mail,
  ShoppingBag,
  Phone,
  MapPin,
  ArrowRight,
  Clock,
  Package,
  Save,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';

const GOVERNORATES = [
  'Monastir',
  'Tunis',
  'Sousse',
  'Sfax',
  'Nabeul',
  'Bizerte',
  'Ben Arous',
  'Ariana',
  'Manouba',
  'Zaghouan',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gafsa',
  'Tozeur',
  'Kebili',
  'Tataouine',
  'Médenine',
  'Gabès',
  'Mahdia',
  'Siliana',
  'Le Kef',
  'Jendouba',
  'Béja',
];

export default function ComptePage() {
  const { fan, username, language, refreshMe, showToast } = useApp();

  // Navigation tab inside the profile page
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'orders'>('info');

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Monastir');
  const [address, setAddress] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Sync initial fan details into form
  useEffect(() => {
    if (fan) {
      setFirstName(fan.firstName || fan.name?.split(' ')[0] || '');
      setLastName(fan.lastName || fan.name?.split(' ').slice(1).join(' ') || '');
      setEmail(fan.email || '');
      setPhone(fan.phone || fan.customerPhone || '');
      setCity(fan.city || fan.governorate || 'Monastir');
      setAddress(fan.address || '');
    }
  }, [fan]);

  // Load orders
  useEffect(() => {
    api
      .getMyOrders()
      .then((data: any) => {
        setOrders(Array.isArray(data) ? data : data?.orders || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const fullName =
    `${firstName || fan?.firstName || ''} ${lastName || fan?.lastName || ''}`.trim() ||
    fan?.name ||
    username ||
    'Supporter USM';

  const initials = (firstName?.[0] || fan?.firstName?.[0] || fan?.name?.[0] || username?.[0] || 'U').toUpperCase();

  const memberSince = fan?.createdAt
    ? new Date(fan.createdAt).toLocaleDateString(
        language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    : '2026';

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setProfileErrorMsg('Le prénom et le nom sont requis.');
      return;
    }

    setSavingProfile(true);
    try {
      await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        governorate: city.trim(),
        address: address.trim(),
      });

      // If email changed, update email
      if (email.trim() && fan?.email && email.trim().toLowerCase() !== fan.email.toLowerCase()) {
        await api.updateEmail(email.trim().toLowerCase());
      }

      await refreshMe();
      setProfileSuccessMsg('Vos informations personnelles ont été enregistrées avec succès !');
      showToast('Profil mis à jour avec succès', 'success');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Erreur lors de la mise à jour de vos informations.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Veuillez renseigner votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccessMsg('Votre mot de passe a été modifié avec succès !');
      showToast('Mot de passe mis à jour', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4000);
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Erreur lors de la modification du mot de passe.');
    } finally {
      setSavingPassword(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmée', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'prepared':
        return { label: 'En préparation', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'shipped':
        return { label: 'Expédiée', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'delivered':
        return { label: 'Livrée', cls: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'cancelled':
        return { label: 'Annulée', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'En attente', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. SUPPORTER HERO IDENTIFIER ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061A3A] via-[#092754] to-[#0D63FF] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#3ED6D0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-1 shrink-0 shadow-lg">
              {fan?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fan.avatar}
                  alt={fullName}
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                <div className="h-full w-full rounded-2xl bg-[#061A3A] flex items-center justify-center font-display font-black text-2xl text-[#3ED6D0]">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#061A3A]" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#3ED6D0] border border-white/10">
                  Supporter Officiel USM
                </span>
                <span className="text-[10px] text-white/70 font-semibold">● Compte Actif</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-white">
                {fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[#3ED6D0]" />
                  <span>{email || '—'}</span>
                </span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#3ED6D0]" />
                  <span>Membre depuis {memberSince}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SECTION NAVIGATION TABS ─────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-white border border-[#DDE8F8] p-1.5 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'bg-[#0D63FF] text-white shadow-md shadow-[#0D63FF]/25'
              : 'text-[#5B6B82] hover:bg-[#F6F9FF]'
          }`}
        >
          <User size={15} />
          <span>Mes Informations</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#0D63FF] text-white shadow-md shadow-[#0D63FF]/25'
              : 'text-[#5B6B82] hover:bg-[#F6F9FF]'
          }`}
        >
          <Shield size={15} />
          <span>Sécurité & Mot de Passe</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#0D63FF] text-white shadow-md shadow-[#0D63FF]/25'
              : 'text-[#5B6B82] hover:bg-[#F6F9FF]'
          }`}
        >
          <Package size={15} />
          <span>Mes Commandes ({orders.length})</span>
        </button>
      </div>

      {/* ── 3. TAB 1: PERSONAL INFORMATION & DATA MANAGEMENT ────────────── */}
      {activeTab === 'info' && (
        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="pb-5 border-b border-[#DDE8F8] mb-6">
            <h3 className="text-base font-black uppercase tracking-wider text-[#071A30] flex items-center gap-2">
              <User className="text-[#0D63FF]" size={18} />
              <span>Gérer mes données personnelles</span>
            </h3>
            <p className="text-xs text-[#5B6B82] mt-1">
              Modifiez vos coordonnées utilisées pour vos livraisons et vos communications club.
            </p>
          </div>

          {profileSuccessMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Prénom */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  required
                  className="w-full h-12 px-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                  Nom de famille <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="w-full h-12 px-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                  Adresse e-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 98 123 456"
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] font-mono outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gouvernorat */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                  Gouvernorat
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all cursor-pointer"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rue, quartier, résidence..."
                  className="w-full h-12 px-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0D63FF] hover:bg-[#0052D9] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Enregistrer mes données</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. TAB 2: SECURITY & PASSWORD MANAGEMENT ────────────────────── */}
      {activeTab === 'security' && (
        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="pb-5 border-b border-[#DDE8F8] mb-6">
            <h3 className="text-base font-black uppercase tracking-wider text-[#071A30] flex items-center gap-2">
              <Lock className="text-[#0D63FF]" size={18} />
              <span>Modifier mon mot de passe</span>
            </h3>
            <p className="text-xs text-[#5B6B82] mt-1">
              Protégez votre compte supporter en utilisant un mot de passe robuste.
            </p>
          </div>

          {passwordSuccessMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{passwordErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-5 max-w-lg">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                Mot de passe actuel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 px-4 pr-11 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  required
                  className="w-full h-12 px-4 pr-11 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmer le nouveau mot de passe */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#071A30] mb-2">
                Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le nouveau mot de passe"
                required
                className="w-full h-12 px-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] focus:border-[#0D63FF] focus:bg-white text-xs font-bold text-[#071A30] outline-none transition-all"
              />
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0D63FF] hover:bg-[#0052D9] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0D63FF]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    <span>Mettre à jour le mot de passe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 5. TAB 3: ORDERS MANAGEMENT ─────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-[#DDE8F8] mb-6">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#071A30] flex items-center gap-2">
                <Package className="text-[#0D63FF]" size={18} />
                <span>Historique de mes commandes</span>
              </h3>
              <p className="text-xs text-[#5B6B82] mt-1">
                Suivez vos commandes passées sur la Boutique Officielle US Monastir.
              </p>
            </div>
            <Link
              href="/boutique"
              className="text-xs font-black text-[#0D63FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Aller à la Boutique</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-12 flex items-center justify-center text-xs text-slate-400">
              <Loader2 size={20} className="animate-spin text-[#0D63FF] mr-2" />
              Chargement de vos commandes...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center bg-[#F6F9FF] border border-dashed border-[#DDE8F8] rounded-2xl p-8">
              <ShoppingBag size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-black text-[#071A30]">Vous n&apos;avez aucune commande pour l&apos;instant</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explorez notre collection de maillots officiels 2026/2027 et soutenez l&apos;Union Sportive Monastirienne !
              </p>
              <Link
                href="/boutique"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D63FF] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#0052D9] transition-all cursor-pointer"
              >
                <span>Visiter la Boutique</span>
                <ArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {orders.map((ord: any) => {
                const status = getStatusBadge(ord.status);
                const orderTotal = ((ord.total || 0) / 1000).toFixed(3);
                const orderDate = ord.createdAt
                  ? new Date(ord.createdAt).toLocaleDateString('fr-TN')
                  : '—';
                return (
                  <div
                    key={ord._id || ord.orderNumber}
                    className="p-5 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white border border-[#DDE8F8] flex items-center justify-center shrink-0">
                        <ShoppingBag size={20} className="text-[#0D63FF]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#071A30] font-mono">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${status.cls}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Clock size={12} /> {orderDate} • {ord.items?.length || 1} article(s)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#0D63FF] font-mono">
                        {orderTotal} DT
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Paiement à la livraison
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
