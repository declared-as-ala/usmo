'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { Logo } from '../../components/Common/Logo';
import { Heart, Coins, ShieldAlert, CheckCircle2, User, Mail, CreditCard, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DonationPage() {
  const { isLoggedIn, fan, showToast, refreshMe } = useApp();
  const router = useRouter();

  // Form states
  const [amount, setAmount] = useState('50');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'anonymous'>('public');
  const [message, setMessage] = useState('');

  // UI state flow: 'input' -> 'payment' -> 'success'
  const [step, setStep] = useState<'input' | 'payment' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<any | null>(null);

  useEffect(() => {
    if (fan) {
      setDonorName(fan.name || '');
      setDonorEmail(fan.email || '');
    }
  }, [fan]);

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) {
      showToast('Le montant doit être supérieur à 0.', 'error');
      return;
    }
    if (!donorName.trim() || !donorEmail.trim()) {
      showToast('Veuillez remplir votre nom et email.', 'error');
      return;
    }

    setLoading(true);
    try {
      const donation = await api.createDonation({
        amount: Number(amount),
        donorName,
        donorEmail,
        visibility,
        message: message.trim() || undefined,
      });
      setCreatedDonation(donation);
      setStep('payment');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création du don.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdDonation) return;
    setLoading(true);
    try {
      const dummyRef = `PAY-SIM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await api.confirmDonation(createdDonation._id, dummyRef);
      showToast('Paiement simulé avec succès !', 'success');
      setStep('success');
      if (isLoggedIn) {
        await refreshMe();
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la confirmation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen relative overflow-hidden pt-24 lg:pt-28 pb-16 flex items-center justify-center">
      {/* Decorative Blur elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-usm-blue-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-usm-blue-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg px-4 relative z-10">
        
        {/* Step 1: Input details */}
        {step === 'input' && (
          <div className="bg-white/80 border border-usm-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="text-center space-y-2">
              <Logo size={50} className="mx-auto" />
              <h1 className="font-display font-black text-2xl uppercase tracking-wider text-usm-blue-dark">
                Soutenir l'US <span className="text-usm-blue-primary">Monastir</span>
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Chaque contribution aide le club à développer ses infrastructures et ses équipes de jeunes.
              </p>
            </div>

            {isLoggedIn && (
              <div className="p-3.5 bg-usm-blue-primary/5 border border-usm-blue-primary/20 rounded-2xl flex items-center gap-3">
                <Sparkles className="text-usm-blue-primary shrink-0" size={18} />
                <p className="text-[10px] text-slate-700 leading-normal">
                  Vous êtes connecté ! Vous recevrez <strong className="text-usm-blue-primary">{amount} points USM</strong> (1 point par TND) suite à cette donation.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitDetails} className="space-y-4 text-xs">
              {/* Presets */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Montant (TND)</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['20', '50', '100', '250'].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        amount === val
                          ? 'bg-usm-blue-primary text-white border-usm-blue-primary shadow-md'
                          : 'bg-usm-blue-soft border-usm-border text-slate-600 hover:border-usm-border'
                      }`}
                    >
                      {val} DT
                    </button>
                  ))}
                </div>
                <input
                  required
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/80 border border-usm-border text-sm text-usm-blue-dark rounded-xl px-4 py-3 outline-none focus:border-usm-blue-primary/50 transition-colors"
                  placeholder="Autre montant..."
                />
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Nom Complet</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      required
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full bg-white/80 border border-usm-border text-usm-blue-dark rounded-xl pl-9 pr-4 py-3 outline-none focus:border-usm-blue-primary/50"
                      placeholder="Nom complet"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Adresse Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      required
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full bg-white/80 border border-usm-border text-usm-blue-dark rounded-xl pl-9 pr-4 py-3 outline-none focus:border-usm-blue-primary/50"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Message d'encouragement (Optionnel)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  className="w-full bg-white/80 border border-usm-border text-usm-blue-dark rounded-xl px-4 py-3 outline-none focus:border-usm-blue-primary/50 h-20 resize-none"
                  placeholder="Laissez un message pour le mur des supporters..."
                />
              </div>

              {/* Visibility Options */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Options de visibilité</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                      className="h-4 w-4 text-usm-blue-primary"
                    />
                    <span>Public (Nom & Message visibles)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'anonymous'}
                      onChange={() => setVisibility('anonymous')}
                      className="h-4 w-4 text-usm-blue-primary"
                    />
                    <span>Anonyme (Masqué du classement)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-usm-blue-primary to-yellow-500 text-usm-blue-dark font-black uppercase tracking-wider text-xs rounded-xl shadow-lg hover:from-white hover:to-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Coins size={14} />}
                Valider le don de {amount} TND
              </button>

              <button
                type="button"
                onClick={() => router.push('/dons-donateurs')}
                className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-usm-blue-primary transition-colors mt-2"
              >
                Consulter le tableau des donateurs
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Payment Simulator */}
        {step === 'payment' && (
          <div className="bg-white/80 border border-usm-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-center">
            <div className="h-12 w-12 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center mx-auto">
              <CreditCard className="text-usm-blue-light" size={20} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-display font-black text-usm-blue-dark uppercase tracking-wider">Simulateur de Paiement</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vous effectuez un don de <strong className="text-usm-blue-dark">{amount} DT</strong> au nom de <strong className="text-usm-blue-dark">{donorName}</strong>.
              </p>
            </div>

            {/* Simulated credit card interface */}
            <div className="bg-gradient-to-br from-usm-blue-soft via-white to-usm-blue-soft border border-usm-border rounded-2xl p-5 text-left max-w-sm mx-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Portail US Monastir</span>
                <Logo size={20} />
              </div>
              <div className="py-2 text-center text-usm-blue-dark font-mono text-sm tracking-widest">
                ••••  ••••  ••••  4321
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                <span>Exp: 12/30</span>
                <span>CVC: •••</span>
              </div>
            </div>

            <div className="flex gap-3 max-w-xs mx-auto">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-2.5 bg-usm-blue-soft border border-usm-border text-xs font-bold text-usm-blue-dark hover:bg-usm-blue-soft rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-500 text-usm-blue-dark font-black uppercase text-xs rounded-xl hover:bg-usm-blue-hover transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle2 size={12} />}
                Payer {amount} TND
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="bg-white/80 border border-usm-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={30} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-display font-black text-usm-blue-dark uppercase tracking-wider">Merci pour votre Don !</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Votre transaction a été validée avec succès. Nous apprécions énormément votre engagement envers les couleurs de l'US Monastir.
              </p>
            </div>

            {isLoggedIn && (
              <div className="p-4 bg-usm-blue-primary/10 border border-usm-blue-primary/30 rounded-2xl inline-block">
                <p className="text-[10px] uppercase font-black text-usm-blue-primary tracking-widest">Points accumulés</p>
                <p className="text-2xl font-display font-black text-usm-blue-dark mt-1">+{amount} Points</p>
                <p className="text-[9px] text-slate-500 mt-1">Crédités sur votre compte supporter.</p>
              </div>
            )}

            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <button
                onClick={() => router.push('/dons-donateurs')}
                className="w-full py-3 bg-usm-blue-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-usm-blue-hover transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                Voir le tableau des donateurs <ArrowRight size={12} />
              </button>
              <button
                onClick={() => router.push('/fanzone')}
                className="w-full py-2 border border-usm-border text-xs font-bold text-slate-500 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                Retourner à la Fan Zone
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
