'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { api } from '../../lib/api-client';
import {
  User,
  Shield,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Mail,
  UserCheck,
  ShoppingBag,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  Package,
} from 'lucide-react';

export default function CompteOverviewPage() {
  const { fan, username, language, bluePoints } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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
    `${fan?.firstName || ''} ${fan?.lastName || ''}`.trim() ||
    fan?.name ||
    username ||
    'Supporter USM';
  const email = fan?.email || '—';
  const phone = fan?.phone || fan?.customerPhone || '—';
  const city = fan?.city || fan?.governorate || 'Monastir';
  const initials = (fan?.firstName?.[0] || fan?.name?.[0] || username?.[0] || 'U').toUpperCase();

  // Format account creation date
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

  const statusLabel =
    fan?.status === 'Active' || !fan?.status
      ? tr(language, 'Active account', 'Compte actif', 'حساب مفعل')
      : tr(language, 'Inactive account', 'Compte inactif', 'حساب غير مفعل');

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
      {/* ── 1. PREMIUM SUPPORTER HERO CARD ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061A3A] via-[#092754] to-[#0D63FF] p-6 sm:p-8 text-white shadow-xl">
        {/* Background decorative glows */}
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
                <span className="text-[10px] text-white/70 font-semibold">● {statusLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-white">
                {fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[#3ED6D0]" />
                  <span>{email}</span>
                </span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#3ED6D0]" />
                  <span>
                    {tr(language, 'Member since', 'Membre depuis', 'عضو منذ')} {memberSince}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/compte/profil"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#061A3A] hover:bg-slate-100 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <UserCheck size={14} />
              <span>{tr(language, 'Edit profile', 'Modifier le profil', 'تعديل البيانات')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. METRICS CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6B82]">
              Commandes Boutique
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0D63FF] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#071A30] font-display">
            {loadingOrders ? '—' : orders.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {orders.length > 0 ? 'Articles USM commandés' : 'Aucune commande'}
          </span>
        </div>

        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6B82]">
              Points Supporter
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#071A30] font-display">
            {fan?.bluePoints || bluePoints || 0} pts
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Blue Points cumulés</span>
        </div>

        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6B82]">
              Statut du Compte
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-display">Vérifié</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Accès membre activé</span>
        </div>

        <div className="bg-white border border-[#DDE8F8] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6B82]">
              Sécurité Compte
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#071A30] font-display">Protégé</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Mot de passe actif</span>
        </div>
      </div>

      {/* ── 3. PERSONAL INFORMATION CARD ─────────────────────────────────── */}
      <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE8F8] mb-5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#071A30] flex items-center gap-2">
              <User className="text-[#0D63FF]" size={16} />
              <span>
                {tr(
                  language,
                  'Personal Information',
                  'Informations personnelles',
                  'المعلومات الشخصية'
                )}
              </span>
            </h3>
            <p className="text-xs text-[#5B6B82] mt-0.5">
              Coordonnées utilisées pour vos commandes et vos réservations.
            </p>
          </div>
          <Link
            href="/compte/profil"
            className="text-xs font-bold text-[#0D63FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{tr(language, 'Update', 'Modifier', 'تعديل')}</span>
            <ChevronRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B82] block">
              Nom complet
            </span>
            <span className="text-xs font-black text-[#071A30] mt-1 block truncate">
              {fullName}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B82] block flex items-center gap-1">
              <Mail size={11} className="text-[#0D63FF]" /> Email
            </span>
            <span className="text-xs font-black text-[#071A30] mt-1 block truncate">{email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B82] block flex items-center gap-1">
              <Phone size={11} className="text-[#0D63FF]" /> Téléphone
            </span>
            <span className="text-xs font-black text-[#071A30] mt-1 block font-mono">{phone}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B82] block flex items-center gap-1">
              <MapPin size={11} className="text-[#0D63FF]" /> Gouvernorat
            </span>
            <span className="text-xs font-black text-[#071A30] mt-1 block">{city}</span>
          </div>
        </div>
      </div>

      {/* ── 4. RECENT ORDERS SECTION ─────────────────────────────────── */}
      <div className="bg-white border border-[#DDE8F8] rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE8F8] mb-5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#071A30] flex items-center gap-2">
              <Package className="text-[#0D63FF]" size={16} />
              <span>Historique Récent des Commandes</span>
            </h3>
            <p className="text-xs text-[#5B6B82] mt-0.5">
              Commandes passées sur la Boutique Officielle USM.
            </p>
          </div>
          <Link
            href="/boutique"
            className="text-xs font-bold text-[#0D63FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Boutique Officielle</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-8 flex items-center justify-center text-xs text-slate-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0D63FF] mr-2" />
            Chargement de vos commandes...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center bg-[#F6F9FF] border border-dashed border-[#DDE8F8] rounded-2xl p-6">
            <ShoppingBag size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-[#071A30]">Vous n&apos;avez pas encore passé de commande</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Découvrez les maillots officiels 2026/27 et la gamme supporter sur notre boutique.
            </p>
            <Link
              href="/boutique"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D63FF] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#0052D9] transition-all cursor-pointer"
            >
              <span>Visiter la Boutique</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((ord: any) => {
              const status = getStatusBadge(ord.status);
              const orderTotal = ((ord.total || 0) / 1000).toFixed(3);
              const orderDate = ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString('fr-TN')
                : '—';
              return (
                <div
                  key={ord._id || ord.orderNumber}
                  className="p-4 rounded-2xl bg-[#F6F9FF] border border-[#DDE8F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-[#DDE8F8] flex items-center justify-center shrink-0">
                      <ShoppingBag size={18} className="text-[#0D63FF]" />
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
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {orderDate} • {ord.items?.length || 1} article(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-[#0D63FF] font-mono">
                        {orderTotal} DT
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Paiement à la livraison
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. QUICK NAVIGATION CARDS ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/compte/profil"
          className="flex items-center justify-between p-5 rounded-3xl bg-white border border-[#DDE8F8] hover:border-[#0D63FF] shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#0D63FF]/10 text-[#0D63FF] flex items-center justify-center group-hover:bg-[#0D63FF] group-hover:text-white transition-colors">
              <UserCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#071A30]">
                {tr(
                  language,
                  'Account Settings',
                  'Paramètres du compte',
                  'إعدادات الحساب'
                )}
              </h4>
              <p className="text-[11px] text-[#5B6B82] mt-0.5">
                Modifiez vos coordonnées, nom, prénom et adresse email.
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-[#5B6B82] group-hover:text-[#0D63FF] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
          />
        </Link>

        <Link
          href="/compte/securite"
          className="flex items-center justify-between p-5 rounded-3xl bg-white border border-[#DDE8F8] hover:border-[#0D63FF] shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#0D63FF]/10 text-[#0D63FF] flex items-center justify-center group-hover:bg-[#0D63FF] group-hover:text-white transition-colors">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#071A30]">
                {tr(language, 'Security & Password', 'Sécurité & Accès', 'أمان الحساب')}
              </h4>
              <p className="text-[11px] text-[#5B6B82] mt-0.5">
                Modifiez votre mot de passe et protégez vos accès.
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-[#5B6B82] group-hover:text-[#0D63FF] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
