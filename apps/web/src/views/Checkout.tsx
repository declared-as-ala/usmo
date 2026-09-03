'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/i18n';
import { api } from '../lib/api-client';
import {
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  MessageCircle,
  ShoppingBag,
  PackageCheck,
  ClipboardList,
  Boxes,
  Handshake,
  Tag,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Phone,
  User,
  Mail,
  ChevronDown,
} from 'lucide-react';

export const TUNISIAN_GOVERNORATES = [
  'Monastir',
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Médenine',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan',
];

const TIMELINE = [
  { en: 'Order received', fr: 'Commande reçue', ar: 'تم استلام الطلب', icon: ClipboardList },
  { en: 'Order confirmation & verification', fr: 'Confirmation commande et vérification', ar: 'تأكيد الطلب والتحقق', icon: ShieldCheck },
  { en: 'Preparation', fr: 'Préparation', ar: 'التحضير', icon: Boxes },
  { en: 'Delivery', fr: 'Livraison à domicile', ar: 'التوصيل للمنزل', icon: PackageCheck },
];

export const Checkout: React.FC = () => {
  const { cart, isLoggedIn, username, language, clearCart, clubSettings } = useApp();
  const router = useRouter();

  // Form states
  const [name, setName] = useState(isLoggedIn ? username : '');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('Monastir');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');

  // Delivery Zones from DB
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  // Promo code
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Calculation Results from API
  const [calcResult, setCalcResult] = useState<any | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Success reservation screen
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mobile order summary accordion toggle
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Fetch Delivery Zones from DB
  useEffect(() => {
    async function loadMetadata() {
      try {
        const zones = await api.getDeliveryZones();
        setDeliveryZones(zones || []);
      } catch (err: any) {
        console.error('[USM CHECKOUT] Error loading delivery zones:', err);
      }
    }
    loadMetadata();
  }, []);

  // Match DB zone if available, otherwise 4 DT for Monastir, 8 DT for other regions
  const matchingZone = deliveryZones.find((z) => {
    if (governorate === 'Monastir') {
      return z.name?.toLowerCase().includes('monastir');
    }
    return !z.name?.toLowerCase().includes('monastir');
  });

  const selectedZoneId = matchingZone?._id;

  // Recalculate totals on backend whenever cart, governorate, or coupon changes
  useEffect(() => {
    async function runCalculation() {
      if (cart.length === 0) return;
      setCalcLoading(true);
      try {
        const itemsPayload = cart.map((item) => ({
          productId: item.product.id || (item.product as any)._id,
          size: item.size,
          quantity: item.quantity,
        }));

        const payload: any = {
          items: itemsPayload,
          couponCode: couponCode || undefined,
          deliveryZoneId: selectedZoneId || undefined,
        };

        const res = await api.calculateCart(payload);

        // Dynamic fee calculation: 4 DT for Monastir, 8 DT for other governorates
        const dynamicShippingCost = matchingZone?.price ?? (governorate === 'Monastir' ? 4000 : 8000);
        res.shippingCost = dynamicShippingCost;
        res.total = Math.max(0, res.subtotal + dynamicShippingCost - (res.discount || 0));

        setCalcResult(res);
      } catch (err: any) {
        const subtotalNum = cart.reduce((sum, item) => {
          const p = parseFloat(String(item.product.price).replace(/[^\d.]/g, '')) || 0;
          return sum + p * item.quantity;
        }, 0);
        const subtotalMillimes = subtotalNum > 1000 ? subtotalNum : Math.round(subtotalNum * 1000);
        const shippingFee = governorate === 'Monastir' ? 4000 : 8000;
        setCalcResult({
          subtotal: subtotalMillimes,
          shippingCost: shippingFee,
          discount: 0,
          total: subtotalMillimes + shippingFee,
          errors: [],
        });
      } finally {
        setCalcLoading(false);
      }
    }

    runCalculation();
  }, [cart, selectedZoneId, governorate, couponCode, matchingZone]);

  const canSubmit = name.trim() !== '' && phone.trim() !== '' && address.trim() !== '';

  const formatMoney = (millimes: number) => {
    return ((millimes || 0) / 1000).toFixed(3) + ' DT';
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponCode(couponInput.trim());
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id || (item.product as any)._id,
        size: item.size,
        quantity: item.quantity,
      }));

      const orderPayload: any = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerCity: governorate,
        customerAddress: address.trim(),
        customerEmail: email.trim() || undefined,
        deliveryMethod: 'delivery',
        notes: notes.trim() || undefined,
        items: itemsPayload,
        couponCode: couponCode || undefined,
        deliveryZoneId: selectedZoneId || undefined,
      };

      const order = await api.createOrder(orderPayload);
      setPlacedOrderId(order.orderNumber || 'ORD-XXXX');
      clearCart();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur lors de la soumission de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Success reservation screen
  if (success) {
    const finalTotalText = calcResult ? formatMoney(calcResult.total) : '0.000 DT';
    return (
      <div className="usm-premium-bg text-usm-blue-dark min-h-screen py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-usm-blue-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-2xl mx-auto px-4 text-center space-y-8 relative z-10">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
          >
            <Check size={36} className="text-emerald-500" />
          </motion.div>

          <div className="space-y-3">
            <span className="inline-block text-[10px] bg-usm-blue-primary/15 text-usm-blue-primary border border-usm-blue-primary/25 font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
              {tr(language, 'Order Confirmed', 'Commande Confirmée', 'تمت تأكيد الطلب')}
            </span>
            <h1 className="font-display font-black text-3xl text-usm-blue-dark uppercase tracking-wide">
              {tr(language, 'Your order has been recorded!', 'Votre commande est enregistrée !', 'تم تسجيل طلبك بنجاح!')}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {email
                ? `Merci pour votre confiance. Un email de confirmation a été envoyé à ${email}. Notre équipe boutique officielle va préparer votre colis et vous contacter pour la livraison.`
                : 'Merci pour votre confiance. Notre équipe boutique officielle va préparer votre colis et vous contacter pour la livraison.'}
            </p>
          </div>

          <div className="bg-white border border-usm-border rounded-2xl p-6 text-left rtl:text-right space-y-3 shadow-md">
            <div className="flex justify-between text-xs text-slate-500 pb-2.5 border-b border-usm-border">
              <span>{tr(language, 'Order Reference:', 'Référence Commande :', 'رقم الطلب:')}</span>
              <strong className="text-usm-blue-primary font-mono text-sm">{placedOrderId}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-2.5 border-b border-usm-border">
              <span>{tr(language, 'Customer:', 'Client :', 'العميل:')}</span>
              <strong className="text-usm-blue-dark">{name}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pb-2.5 border-b border-usm-border">
              <span>{tr(language, 'Phone:', 'Téléphone :', 'الهاتف:')}</span>
              <strong className="text-usm-blue-dark font-mono">{phone}</strong>
            </div>
            {email && (
              <div className="flex justify-between text-xs text-slate-500 pb-2.5 border-b border-usm-border">
                <span>{tr(language, 'Email:', 'Email :', 'البريد الإلكتروني:')}</span>
                <strong className="text-usm-blue-dark font-mono">{email}</strong>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-500 pb-2.5 border-b border-usm-border">
              <span>{tr(language, 'Delivering to:', 'Livraison à :', 'التوصيل إلى:')}</span>
              <strong className="text-usm-blue-dark">{governorate}, {address}</strong>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1.5">
              <span className="text-slate-600">{tr(language, 'Total amount on delivery:', 'Total à régler :', 'المجموع:')}</span>
              <span className="text-usm-blue-primary font-mono text-base">{finalTotalText}</span>
            </div>
          </div>

          {/* Timeline Process */}
          <div className="bg-white border border-usm-border rounded-2xl p-6 shadow-md">
            <h3 className="text-[10px] font-black text-usm-blue-dark uppercase tracking-widest mb-5 text-center">
              {tr(language, 'What Happens Next', 'Et Ensuite ?', 'ماذا يحدث الآن')}
            </h3>
            <div className="flex justify-between gap-2">
              {TIMELINE.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={t.en} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center border ${
                        i === 0 ? 'bg-usm-blue-primary border-usm-blue-primary text-white' : 'border-usm-border text-slate-600 bg-white'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 text-center leading-tight uppercase tracking-wider">
                      {tr(language, t.en, t.fr, t.ar)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Boutique Officielle US Monastir · Paiement à la livraison</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => router.push('/boutique')}
              className="px-6 py-3 bg-usm-blue-primary text-white text-xs font-black uppercase rounded-xl hover:bg-usm-blue-primary/95 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} className="rtl:rotate-180" />
              {tr(language, 'Continue Shopping', 'Continuer mes Achats', 'مواصلة التسوق')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty cart state
  if (cart.length === 0) {
    return (
      <div className="usm-premium-bg text-usm-blue-dark min-h-screen py-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-white border border-usm-border flex items-center justify-center shadow-md">
            <ShoppingBag size={28} className="text-slate-600" />
          </div>
          <h3 className="font-bold text-usm-blue-dark text-lg">
            {tr(language, 'Your supporter bag is waiting for its colors.', 'Votre sac supporter est vide.', 'حقيبتك فارغة')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Ajoutez des articles depuis la boutique officielle avant de pouvoir passer votre commande.
          </p>
          <button
            onClick={() => router.push('/boutique')}
            className="px-6 py-2.5 bg-usm-blue-primary text-white text-xs font-black uppercase rounded-lg hover:bg-usm-blue-primary/90 transition-colors cursor-pointer"
          >
            {tr(language, 'Explore the Collection', 'Découvrir la Collection', 'اكتشف المجموعة')}
          </button>
        </div>
      </div>
    );
  }

  const renderSummaryBody = () => (
    <>
      {/* Cart products list */}
      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1 space-y-1">
        {cart.map((item, idx) => (
          <div key={idx} className="py-2.5 flex items-center justify-between text-xs text-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(item.product as any).coverImage || item.product.image}
              className="w-10 h-10 object-cover rounded-lg border border-usm-border shrink-0"
              alt=""
            />
            <div className="flex-1 min-w-0 mx-2.5">
              <p className="font-bold text-usm-blue-dark truncate">
                {tr(language, item.product.name, item.product.nameFr, item.product.nameAr)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Qté {item.quantity} • Taille {item.size}
              </p>
            </div>
            <span className="font-mono text-usm-blue-dark font-bold shrink-0">{item.product.price}</span>
          </div>
        ))}
      </div>

      {/* Promo Code Coupon Panel */}
      <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2 border-t border-usm-border">
        <input
          type="text"
          placeholder="Code Promo"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          className="flex-1 bg-white border border-usm-border rounded-xl px-3 py-2 text-xs text-usm-blue-dark uppercase outline-none focus:border-usm-blue-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-usm-blue-soft hover:bg-usm-blue-primary/10 text-usm-blue-primary rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer border border-usm-border"
        >
          Appliquer
        </button>
      </form>

      {/* Calculations Breakdown */}
      {calcResult && (
        <div className="border-t border-usm-border pt-4 space-y-2.5 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span className="font-mono text-usm-blue-dark font-bold">{formatMoney(calcResult.subtotal)}</span>
          </div>

          {calcResult.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span className="flex items-center gap-1">
                <Tag size={12} /> Remise (-{calcResult.discountPercent}%)
              </span>
              <span className="font-mono">-{formatMoney(calcResult.discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>
              Frais de livraison ({governorate === 'Monastir' ? 'Monastir' : 'Autre région'})
            </span>
            <span className="font-mono text-usm-blue-dark font-bold">{formatMoney(calcResult.shippingCost)}</span>
          </div>

          <div className="flex justify-between text-usm-blue-dark font-bold border-t border-usm-border pt-3.5 text-sm">
            <span>Total à régler :</span>
            <span className="font-mono text-usm-blue-primary text-base font-black">
              {formatMoney(calcResult.total)}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100 text-center">
        <span className="text-[10px] text-slate-400 font-semibold block">
          Boutique Officielle USM
        </span>
        <span className="text-xs font-bold text-usm-blue-primary inline-flex items-center gap-1 mt-0.5">
          Paiement sécurisé à la livraison
        </span>
      </div>
    </>
  );

  // 3. Main Streamlined Order Layout
  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-usm-blue-primary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-32 lg:pb-12 space-y-8 relative z-10">
        <div>
          <button
            onClick={() => router.push('/boutique')}
            className="text-xs font-bold text-slate-500 hover:text-usm-blue-primary flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {tr(language, 'Back to Boutique', 'Retour à la Boutique', 'العودة إلى البوتيك')}
          </button>

          <h1 className="font-display font-black text-3xl text-usm-blue-dark uppercase tracking-wider mt-4">
            Finaliser votre commande
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
            <Truck size={14} className="text-usm-blue-primary" />
            <span>Livraison à domicile partout en Tunisie · Paiement en espèces à la livraison</span>
          </p>
        </div>

        {/* MOBILE ONLY: Collapsible Order Summary at Top */}
        <div className="lg:hidden bg-white border border-usm-border rounded-2xl overflow-hidden shadow-md">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-usm-blue-primary/10 text-usm-blue-primary flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-usm-blue-dark">
                  <span>{mobileSummaryOpen ? 'Masquer le résumé' : 'Afficher le résumé de la commande'}</span>
                  <ChevronDown
                    size={14}
                    className={`text-usm-blue-primary transition-transform duration-200 ${
                      mobileSummaryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {cart.length} article{cart.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
              <span className="text-sm font-mono font-black text-usm-blue-primary">
                {calcResult ? formatMoney(calcResult.total) : '0.000 DT'}
              </span>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {mobileSummaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-usm-border"
              >
                <div className="p-4 space-y-4 bg-white">
                  {renderSummaryBody()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT: Single Streamlined Form */}
          <div className="lg:col-span-2 bg-white border border-usm-border rounded-3xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handleConfirm} className="space-y-5">
              <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wide border-b border-usm-border pb-3 flex items-center gap-2">
                <User size={16} className="text-usm-blue-primary" />
                Informations de livraison
              </h3>

              {/* Nom & Prénom */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Nom & Prénom *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Foulen ben Foulen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-400"
                />
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Numéro de Téléphone *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="tel"
                    placeholder="12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 pl-10 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Email (facultatif)
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="exemple@domain.tn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 pl-10 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-400 font-sans"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Optionnel : pour recevoir l'e-mail de confirmation et le suivi de votre commande.
                </p>
              </div>

              {/* 24 Régions / Gouvernorat Dropdown */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Gouvernorat / Région (24 Régions) *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-usm-blue-primary pointer-events-none" />
                  <select
                    required
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark font-semibold rounded-xl p-3.5 pl-10 outline-none focus:border-usm-blue-primary cursor-pointer transition-all appearance-none"
                  >
                    {TUNISIAN_GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g} {g === 'Monastir' ? '(Frais de livraison : 4.000 DT)' : '(Frais de livraison : 8.000 DT)'}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {governorate === 'Monastir'
                    ? 'Tarif spécial Monastir : 4.000 DT'
                    : 'Tarif standard autres régions : 8.000 DT'}
                </p>
              </div>

              {/* Adresse complète */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Adresse complète de livraison *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Rue, Immeuble, Appartement, Cité"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  Remarques ou instructions particulières (Facultatif)
                </label>
                <textarea
                  rows={2}
                  placeholder="Horaires de livraison souhaités ou précisions sur l'adresse..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-usm-border text-xs text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all resize-none placeholder-slate-400"
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-usm-border">
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="w-full py-4 bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-sm font-black uppercase rounded-2xl transition-all cursor-pointer shadow-xl shadow-usm-blue-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={18} />
                  <span>{submitting ? 'Confirmation en cours...' : 'Confirmer ma commande'}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                <span>Paiement en espèces à la livraison</span>
                <span className="font-semibold text-usm-blue-primary">Boutique Officielle USM</span>
              </div>
            </form>
          </div>

          {/* RIGHT: Order calculations panel (Desktop only) */}
          <div className="hidden lg:block bg-white border border-usm-border rounded-3xl p-6 shadow-lg space-y-6 sticky top-24">
            <h3 className="text-xs font-bold text-usm-blue-dark uppercase border-b border-usm-border pb-3.5 tracking-wider flex items-center justify-between">
              <span>Résumé de la commande</span>
              <span className="text-[10px] font-bold text-usm-blue-primary">{cart.length} article(s)</span>
            </h3>

            {renderSummaryBody()}
          </div>
        </div>
      </div>
    </div>
  );
};
