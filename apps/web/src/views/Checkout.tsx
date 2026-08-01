'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/i18n';
import { Logo } from '../components/Common/Logo';
import { api } from '../lib/api-client';
import {
  ArrowLeft,
  Check,
  Truck,
  Store,
  Info,
  ShieldCheck,
  MessageCircle,
  ShoppingBag,
  PackageCheck,
  ClipboardList,
  Boxes,
  Handshake,
  Tag,
  AlertTriangle
} from 'lucide-react';

type Step = 1 | 2 | 3;
type DeliveryMethod = 'delivery' | 'pickup';

const STEP_LABELS: { key: Step; en: string; fr: string; ar: string }[] = [
  { key: 1, en: 'Your Details', fr: 'Vos Informations', ar: 'بياناتك' },
  { key: 2, en: 'Delivery or Pickup', fr: 'Livraison ou Retrait', ar: 'التوصيل أو الاستلام' },
  { key: 3, en: 'Confirm Reservation', fr: 'Confirmer la Réservation', ar: 'تأكيد الحجز' },
];

const TIMELINE = [
  { en: 'Order received', fr: 'Commande reçue', ar: 'تم استلام الطلب', icon: ClipboardList },
  { en: 'Store review', fr: 'Vérification boutique', ar: 'مراجعة المتجر', icon: ShieldCheck },
  { en: 'Confirmation call', fr: 'Appel de confirmation', ar: 'مكالمة التأكيد', icon: Handshake },
  { en: 'Preparation', fr: 'Préparation', ar: 'التحضير', icon: Boxes },
  { en: 'Pickup / Delivery', fr: 'Retrait / Livraison', ar: 'الاستلام أو التوصيل', icon: PackageCheck },
];

export const Checkout: React.FC = () => {
  const { cart, placeOrder, isLoggedIn, username, language, clearCart, clubSettings } = useApp();
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(isLoggedIn ? username : '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  
  // Delivery & Pickup options
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedPointId, setSelectedPointId] = useState<string>('');
  
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  // Promo code
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Calculation Results from API
  const [calcResult, setCalcResult] = useState<any | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Success reservation screen
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Fetch Delivery Zones & Pickup Points
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [zones, points] = await Promise.all([
          api.getDeliveryZones(),
          api.getPickupPoints(),
        ]);
        setDeliveryZones(zones || []);
        setPickupPoints(points || []);
        if (zones && zones.length > 0) setSelectedZoneId(zones[0]._id);
        if (points && points.length > 0) setSelectedPointId(points[0]._id);
      } catch (err: any) {
        console.error('[USM CHECKOUT] Error loading zones/points:', err);
      }
    }
    loadMetadata();
  }, []);

  // Recalculate totals on backend whenever cart, method, zone, or coupon changes
  useEffect(() => {
    async function runCalculation() {
      if (cart.length === 0) return;
      setCalcLoading(true);
      setCalcError(null);
      try {
        const itemsPayload = cart.map((item) => ({
          productId: item.product.id || (item.product as any)._id,
          size: item.size,
          quantity: item.quantity,
        }));

        const payload: any = {
          items: itemsPayload,
          couponCode: couponCode || undefined,
        };

        if (deliveryMethod === 'delivery') {
          payload.deliveryZoneId = selectedZoneId || undefined;
        } else {
          payload.pickupPointId = selectedPointId || undefined;
        }

        const res = await api.calculateCart(payload);
        setCalcResult(res);
      } catch (err: any) {
        setCalcError(err.message || 'Calcul impossible');
      } finally {
        setCalcLoading(false);
      }
    }

    runCalculation();
  }, [cart, deliveryMethod, selectedZoneId, selectedPointId, couponCode]);

  const canProceedStep1 = name.trim() !== '' && phone.trim() !== '' && city.trim() !== '';
  const canProceedStep2 = deliveryMethod === 'pickup' ? !!selectedPointId : (!!selectedZoneId && address.trim() !== '');

  const formatMoney = (millimes: number) => {
    return (millimes / 1000).toFixed(3) + ' DT';
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponCode(couponInput.trim());
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id || (item.product as any)._id,
        size: item.size,
        quantity: item.quantity,
      }));

      const orderPayload: any = {
        customerName: name,
        customerPhone: phone,
        customerCity: city,
        customerAddress: address,
        deliveryMethod,
        notes,
        items: itemsPayload,
        couponCode: couponCode || undefined,
      };

      if (deliveryMethod === 'delivery') {
        orderPayload.deliveryZoneId = selectedZoneId || undefined;
      } else {
        orderPayload.pickupPointId = selectedPointId || undefined;
      }

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
            <Check size={36} className="text-emerald-400" />
          </motion.div>

          <div className="space-y-3">
            <span className="inline-block text-[10px] bg-usm-blue-primary/15 text-usm-blue-primary border border-usm-blue-primary/25 font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
              {tr(language, 'Pending Review', 'En Attente de Validation', 'قيد المراجعة')}
            </span>
            <h1 className="font-display font-black text-3xl text-usm-blue-dark uppercase tracking-wide">
              {tr(language, 'Your reservation is in!', 'Votre réservation est enregistrée !', 'تم تسجيل حجزك بنجاح!')}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {tr(
                language,
                "We've received your order — our official store team will review stock and call you to arrange collection.",
                'Nous avons bien reçu votre commande — notre équipe boutique officielle va la vérifier et vous appeler prochainement.',
                'استلمنا طلبك وسيقوم فريق المتجر الرسمي بمراجعته والاتصال بك قريباً لتنسيق الاستلام.'
              )}
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
            <div className="flex justify-between text-xs text-slate-500 pb-2.5 border-b border-usm-border">
              <span>
                {deliveryMethod === 'delivery'
                  ? tr(language, 'Delivering to:', 'Livraison à :', 'التوصيل إلى:')
                  : tr(language, 'Pickup at:', 'Retrait à :', 'الاستلام من:')}
              </span>
              <strong className="text-usm-blue-dark">
                {deliveryMethod === 'delivery'
                  ? `${city}, ${address}`
                  : calcResult?.pickupPoint?.name || tr(language, 'Official Boutique', 'Boutique Officielle', 'المغازة الرسمية')}
              </strong>
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href={`mailto:${clubSettings.contactEmail}?subject=${encodeURIComponent(`Order ${placedOrderId}`)}`}
              className="px-6 py-3 border border-usm-border text-slate-600 text-xs font-bold uppercase rounded-xl hover:border-usm-blue-primary hover:text-usm-blue-primary transition-colors cursor-pointer inline-flex items-center justify-center gap-2 bg-white"
            >
              <MessageCircle size={14} />
              {tr(language, 'Contact Support', 'Contacter le support', 'تواصل مع الدعم')}
            </a>
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
            {tr(language, 'Your supporter bag is waiting for its colors.', 'Votre sac supporter attend ses couleurs.', 'حقيبتك بانتظار ألوانها')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {tr(
              language,
              'Add items from the official boutique before you can reserve them.',
              'Ajoutez des articles depuis la boutique officielle avant de pouvoir les réserver.',
              'أضف منتجات من البوتيك الرسمي قبل متابعة الحجز.'
            )}
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

  // 3. Main Multi-step checkout layout
  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-usm-blue-primary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-32 lg:pb-12 space-y-8 relative z-10">
        
        <div>
          <button
            onClick={() => router.push('/boutique')}
            className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {tr(language, 'Back to Boutique', 'Retour à la Boutique', 'العودة إلى البوتيك')}
          </button>
          
          <h1 className="font-display font-black text-3xl text-usm-blue-dark uppercase tracking-wider mt-4">
            {tr(language, 'Complete Your Reservation', 'Finaliser votre Réservation', 'إإتمام الحجز')}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {tr(
              language,
              'Zero online payments. Settle the balance in cash at pick-up or home delivery.',
              'Aucun paiement en ligne. Réglez en espèces à la livraison ou au retrait.',
              'بدون أي دفع إلكتروني — الدفع نقداً عند الاستلام.'
            )}
          </p>
        </div>

        {/* Step progress bar */}
        <div className="flex items-center max-w-xl">
          {STEP_LABELS.map((s, idx) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors ${
                    step === s.key
                      ? 'bg-usm-blue-primary border-usm-blue-primary text-white'
                      : step > s.key
                      ? 'bg-emerald-500 border-emerald-500 text-usm-blue-dark'
                      : 'border-usm-border text-slate-500 bg-white'
                  }`}
                >
                  {step > s.key ? <Check size={14} /> : s.key}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider text-center max-w-[80px] ${
                    step === s.key ? 'text-usm-blue-primary' : 'text-slate-500'
                  }`}
                >
                  {tr(language, s.en, s.fr, s.ar)}
                </span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded ${step > s.key ? 'bg-emerald-500' : 'bg-usm-blue-soft'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Active form steps */}
          <div className="lg:col-span-2 bg-white border border-usm-border rounded-3xl p-6 md:p-8 shadow-lg min-h-[420px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wide">
                    {tr(language, "Let's start with your contact details", 'Commençons par vos informations', 'من فضلك أدخل بياناتك')}
                  </h3>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      {tr(language, 'Full Name', 'Nom Complet', 'الاسم الكامل')} *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Rihem Ben Ali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-655"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      {tr(language, 'Phone Number', 'Numéro de Téléphone', 'رقم الهاتف')} *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="98 765 432"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-655 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      {tr(language, 'Governorate / City', 'Gouvernorat / Ville', 'الولاية / المدينة')} *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Monastir"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-655"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      disabled={!canProceedStep1}
                      onClick={() => setStep(2)}
                      className="px-6 py-3 bg-usm-blue-primary text-white text-xs font-black uppercase rounded-lg hover:bg-usm-blue-primary/95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {tr(language, 'Next: Delivery', 'Suivant : Livraison', 'التالي: التوصيل')}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wide">
                    {tr(language, 'Shipping Method', 'Mode de Réception', 'طريقة الاستلام')}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`p-5 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer bg-white ${
                        deliveryMethod === 'delivery' ? 'border-usm-blue-primary bg-usm-blue-primary/5' : 'border-usm-border hover:border-usm-border'
                      }`}
                    >
                      <Truck className="text-usm-blue-primary mb-2" size={22} />
                      <p className="text-sm font-bold text-usm-blue-dark">{tr(language, 'Home Delivery', 'Livraison à Domicile', 'التوصيل للمنزل')}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Expédié sous 24-48h partout en Tunisie par transporteur officiel.
                      </p>
                    </button>
                    <button
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-5 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer bg-white ${
                        deliveryMethod === 'pickup' ? 'border-usm-blue-primary bg-usm-blue-primary/5' : 'border-usm-border hover:border-usm-border'
                      }`}
                    >
                      <Store className="text-usm-blue-primary mb-2" size={22} />
                      <p className="text-sm font-bold text-usm-blue-dark">{tr(language, 'Boutique Pickup', 'Retrait en Boutique', 'الاستلام من المتجر')}</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Gratuit. Récupérez vos produits directement dans les points agréés.
                      </p>
                    </button>
                  </div>

                  {/* Delivery Selection */}
                  {deliveryMethod === 'delivery' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                          {tr(language, 'Delivery Zone', 'Région de Livraison', 'جهة التوصيل')}
                        </label>
                        <select
                          value={selectedZoneId}
                          onChange={(e) => setSelectedZoneId(e.target.value)}
                          className="w-full bg-white border border-usm-border text-xs text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary cursor-pointer"
                        >
                          {deliveryZones.map((z) => (
                            <option key={z._id} value={z._id}>
                              {tr(language, z.name, z.nameFr, z.nameAr)} (+{formatMoney(z.price)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                          {tr(language, 'Full Delivery Address', 'Adresse Complète de Livraison', 'العنوان الكامل')} *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Rue, Immeuble, Appartement"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all placeholder-slate-655"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pickup Selection */}
                  {deliveryMethod === 'pickup' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">
                        {tr(language, 'Select Boutique Point', 'Choisir la Boutique', 'اختر المغازة')}
                      </label>
                      <div className="space-y-2">
                        {pickupPoints.map((pt) => (
                          <label
                            key={pt._id}
                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer bg-white transition-all ${
                              selectedPointId === pt._id ? 'border-usm-blue-primary bg-usm-blue-primary/5' : 'border-usm-border hover:border-usm-border'
                            }`}
                          >
                            <input
                              type="radio"
                              name="pickupPoint"
                              checked={selectedPointId === pt._id}
                              onChange={() => setSelectedPointId(pt._id)}
                              className="accent-usm-blue-primary mt-0.5 shrink-0"
                            />
                            <div className="text-xs">
                              <p className="font-bold text-usm-blue-dark">{tr(language, pt.name, pt.nameFr, pt.nameAr)}</p>
                              <p className="text-[10px] text-slate-450 mt-1">{tr(language, pt.address, pt.addressFr, pt.addressAr)}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-usm-border text-slate-500 text-xs font-bold uppercase rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
                    >
                      {tr(language, 'Back', 'Retour', 'رجوع')}
                    </button>
                    <button
                      disabled={!canProceedStep2}
                      onClick={() => setStep(3)}
                      className="px-6 py-3 bg-usm-blue-primary text-white text-xs font-black uppercase rounded-lg hover:bg-usm-blue-primary/95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {tr(language, 'Next: Confirm', 'Suivant : Confirmer', 'التالي: التأكيد')}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wide">
                    {tr(language, 'Review details', 'Vérifiez votre réservation', 'راجع طلبك')}
                  </h3>

                  <div className="bg-white border border-usm-border rounded-2xl p-5 space-y-2.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">{tr(language, 'Name', 'Nom', 'الاسم')}</span><strong className="text-usm-blue-dark">{name}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">{tr(language, 'Phone', 'Téléphone', 'الهاتف')}</span><strong className="text-usm-blue-dark font-mono">{phone}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">{tr(language, 'City', 'Ville', 'المدينة')}</span><strong className="text-usm-blue-dark">{city}</strong></div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tr(language, 'Method', 'Méthode', 'طريقة الاستلام')}</span>
                      <strong className="text-usm-blue-dark">
                        {deliveryMethod === 'delivery'
                          ? tr(language, 'Home Delivery', 'Livraison à Domicile', 'توصيل للمنزل')
                          : tr(language, 'Store Pickup', 'Retrait en Boutique', 'استلام من المتجر')}
                      </strong>
                    </div>
                    {deliveryMethod === 'delivery' && (
                      <div className="flex justify-between"><span className="text-slate-500">{tr(language, 'Address', 'Adresse', 'العنوان')}</span><strong className="text-usm-blue-dark text-right max-w-[60%]">{address}</strong></div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      {tr(language, 'Notes (Optional)', 'Notes (Facultatif)', 'ملاحظات (اختياري)')}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={tr(language, 'Any special instructions...', 'Instructions particulières...', 'أي تعليمات خاصة...')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-usm-border text-sm text-usm-blue-dark rounded-xl p-3.5 outline-none focus:border-usm-blue-primary transition-all resize-none placeholder-slate-655"
                    />
                  </div>

                  {calcResult?.errors?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-2">
                      {calcResult.errors.map((errStr: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-red-400 text-[11px] font-bold leading-snug">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>{errStr}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-usm-blue-primary/5 border border-usm-blue-primary/10 rounded-2xl p-4 flex items-start gap-3">
                    <Info size={16} className="text-usm-blue-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-450 leading-relaxed">
                      Aucun paiement en ligne. L&apos;équipe de la boutique confirmera la commande par téléphone avant expédition.
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-[11px] font-semibold">
                      {submitError}
                    </div>
                  )}

                  <div className="pt-2 flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 border border-usm-border text-slate-500 text-xs font-bold uppercase rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
                    >
                      {tr(language, 'Back', 'Retour', 'رجوع')}
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={calcResult?.errors?.length > 0 || submitting}
                      className="px-6 py-3 bg-usm-blue-primary text-white text-xs font-black uppercase rounded-lg hover:bg-usm-blue-primary/95 transition-all cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ShieldCheck size={16} />
                      {submitting
                        ? 'Envoi en cours...'
                        : tr(language, 'Confirm My Reservation', 'Confirmer ma Réservation', 'تأكيد الحجز')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Order calculations panel */}
          <div className="bg-white border border-usm-border rounded-3xl p-6 shadow-lg space-y-6">
            <h3 className="text-xs font-bold text-usm-blue-dark uppercase border-b border-usm-border pb-3.5 tracking-wider">
              {tr(language, 'Order Summary', 'Résumé de la Commande', 'ملخص الطلب')}
            </h3>

            {/* Cart products list */}
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs text-slate-600">
                  <img src={(item.product as any).coverImage || item.product.image} className="w-10 h-10 object-cover rounded-lg border border-usm-border shrink-0" alt="" />
                  <div className="flex-1 min-w-0 mx-2.5">
                    <p className="font-bold text-usm-blue-dark truncate">
                      {tr(language, item.product.name, item.product.nameFr, item.product.nameAr)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Qty {item.quantity} • {item.size}
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
                placeholder={tr(language, 'Promo Code', 'Code Promo', 'كود الخصم')}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 bg-white border border-usm-border rounded-xl px-3 py-2 text-xs text-usm-blue-dark uppercase outline-none focus:border-usm-blue-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-usm-blue-soft hover:bg-usm-blue-soft text-usm-blue-dark rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer border border-usm-border"
              >
                Appliquer
              </button>
            </form>

            {/* Calculations Breakdown */}
            {calcResult && (
              <div className="border-t border-usm-border pt-4 space-y-2.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>{tr(language, 'Subtotal', 'Sous-total', 'المجموع الفرعي')}</span>
                  <span className="font-mono text-usm-blue-dark">{formatMoney(calcResult.subtotal)}</span>
                </div>
                
                {calcResult.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1"><Tag size={12} /> Discount (-{calcResult.discountPercent}%)</span>
                    <span className="font-mono">-{formatMoney(calcResult.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{tr(language, 'Delivery Fee', 'Frais de Livraison', 'رسوم التوصيل')}</span>
                  <span className="font-mono text-usm-blue-dark">{formatMoney(calcResult.shippingCost)}</span>
                </div>

                <div className="flex justify-between text-usm-blue-dark font-bold border-t border-usm-border pt-3.5 text-sm">
                  <span>{tr(language, 'Total Amount:', 'Total à régler :', 'المجموع الكلي:')}</span>
                  <span className="font-mono text-usm-blue-primary text-base">{formatMoney(calcResult.total)}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile sticky footer total + CTA */}
      {calcResult && (
        <div className="lg:hidden fixed bottom-24 left-3 right-3 z-30 bg-white border border-usm-border rounded-2xl shadow-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase">{tr(language, 'Total', 'Total', 'المجموع')}</p>
            <p className="font-mono font-black text-usm-blue-primary text-sm">{formatMoney(calcResult.total)}</p>
          </div>
          {step < 3 ? (
            <button
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="px-5 py-2.5 bg-usm-blue-primary text-white text-[11px] font-black uppercase rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {tr(language, 'Continue', 'Continuer', 'التالي')}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={calcResult?.errors?.length > 0 || submitting}
              className="px-5 py-2.5 bg-usm-blue-primary text-white text-[11px] font-black uppercase rounded-xl cursor-pointer disabled:opacity-30"
            >
              {submitting ? '...' : tr(language, 'Confirm', 'Confirmer', 'تأكيد')}
            </button>
          )}
        </div>
      )}

    </div>
  );
};
