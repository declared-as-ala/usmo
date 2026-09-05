'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api-client';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight, Phone, MapPin, ShoppingBag } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';

interface TrackedOrder {
  orderNumber: string;
  customer: { name: string; phone: string; city: string; address?: string };
  deliveryMethod: 'delivery' | 'pickup';
  items: {
    name: string;
    size: string;
    quantity: number;
    price: number;
    subtotal: number;
    customName?: string;
    customNumber?: string;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponApplied?: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; updatedAt: string; notes?: string }[];
  createdAt: string;
}

const STEPS: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
  { key: 'pending',   label: 'Commande reçue',  icon: Clock },
  { key: 'confirmed', label: 'Confirmée',        icon: CheckCircle2 },
  { key: 'prepared',  label: 'En préparation',   icon: Package },
  { key: 'shipped',   label: 'Expédiée',         icon: Truck },
  { key: 'delivered', label: 'Livrée',           icon: CheckCircle2 },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'prepared', 'shipped', 'delivered'];

const formatTND = (millimes: number) => `${(millimes / 1000).toFixed(3)} TND`;

export default function OrderTrackingPage() {
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = ref.trim().toUpperCase();
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.trackOrder(cleaned);
      setOrder(data);
    } catch (err: any) {
      setError('Commande introuvable. Vérifiez la référence et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <main className="min-h-screen bg-gradient-to-br from-usm-blue-soft via-white to-usm-blue-soft py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-usm-blue-primary/10 border border-usm-blue-primary/30 rounded-full px-4 py-1.5 mb-4">
            <ShoppingBag size={13} className="text-usm-blue-primary" />
            <span className="text-xs font-bold text-usm-blue-primary uppercase tracking-wider">Boutique Officielle</span>
          </div>
          <h1 className="text-3xl font-black text-usm-blue-dark mb-2">Suivi de Commande</h1>
          <p className="text-slate-500 text-sm">Entrez votre référence de commande pour suivre son état en temps réel.</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="Ex: ORD-1234-5678"
                className="w-full pl-11 pr-4 py-3.5 bg-usm-blue-soft border border-usm-border text-usm-blue-dark rounded-xl font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/50 focus:border-usm-blue-primary/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Recherche…' : 'Suivre'}
            </button>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Order found */}
        {order && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
            {/* Header card */}
            <div className="bg-usm-blue-soft border border-usm-border rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Référence</p>
                  <h2 className="text-xl font-black text-usm-blue-dark font-mono">{order.orderNumber}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full font-bold text-xs uppercase border ${
                  isCancelled
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-usm-blue-primary/20 text-usm-blue-primary border-usm-blue-primary/40'
                }`}>
                  {order.status}
                </div>
              </div>
            </div>

            {/* Progress tracker */}
            {!isCancelled ? (
              <div className="bg-usm-blue-soft border border-usm-border rounded-2xl p-6">
                <h3 className="text-sm font-bold text-usm-blue-dark mb-6">Progression de la commande</h3>
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-usm-blue-soft" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-usm-blue-primary transition-all duration-700"
                    style={{ width: `calc(${Math.max(0, currentStep) * 25}%)` }}
                  />

                  <div className="relative flex justify-between">
                    {STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 w-[20%]">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                            isCompleted
                              ? 'bg-usm-blue-primary border-usm-blue-primary'
                              : 'bg-usm-blue-soft border-usm-border'
                          } ${isCurrent ? 'ring-2 ring-usm-blue-primary/40 ring-offset-2 ring-offset-[#0a1628]' : ''}`}>
                            <Icon size={16} className={isCompleted ? 'text-usm-blue-dark' : 'text-slate-600'} />
                          </div>
                          <span className={`text-[10px] text-center font-semibold leading-tight ${
                            isCompleted ? 'text-usm-blue-dark' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-4">
                <XCircle size={32} className="text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-300">Commande annulée</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {order.statusHistory.find(h => h.status === 'cancelled')?.notes || 'Cette commande a été annulée.'}
                  </p>
                </div>
              </div>
            )}

            {/* Customer & delivery info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-usm-blue-soft border border-usm-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Phone size={14} className="text-usm-blue-primary" />
                  <h4 className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">Client</h4>
                </div>
                <p className="font-bold text-usm-blue-dark">{order.customer.name}</p>
                <p className="text-xs text-slate-500 mt-1">{order.customer.phone}</p>
              </div>

              <div className="bg-usm-blue-soft border border-usm-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-usm-blue-primary" />
                  <h4 className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">Livraison</h4>
                </div>
                <p className="font-bold text-usm-blue-dark capitalize">
                  {order.deliveryMethod === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile'}
                </p>
                <p className="text-xs text-slate-500 mt-1">{order.customer.city}{order.customer.address ? ` — ${order.customer.address}` : ''}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-usm-blue-soft border border-usm-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-usm-border">
                <h4 className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">Articles commandés</h4>
              </div>
              <div className="divide-y divide-white/5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-usm-blue-dark">{item.name}</p>
                      <p className="text-xs text-slate-500">Taille: {item.size} · Qté: {item.quantity}</p>
                      {(item.customName || item.customNumber) && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-[#0D63FF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          Flocage: {[item.customName, item.customNumber ? '#' + item.customNumber : ''].filter(Boolean).join(' ')}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-usm-blue-dark font-mono text-sm">{formatTND(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-5 py-4 border-t border-usm-border space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total</span>
                  <span className="font-mono">{formatTND(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Livraison</span>
                  <span className="font-mono">
                    {order.shippingCost === 0 ? 'Gratuit' : formatTND(order.shippingCost)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Remise {order.couponApplied && `(${order.couponApplied})`}</span>
                    <span className="font-mono">-{formatTND(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-usm-blue-dark text-base pt-2 border-t border-usm-border">
                  <span>Total</span>
                  <span className="font-mono text-usm-blue-primary">{formatTND(order.total)}</span>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-usm-blue-soft border border-usm-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-usm-border">
                <h4 className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">Historique des statuts</h4>
              </div>
              <div className="divide-y divide-white/5">
                {[...order.statusHistory].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <div className="w-2 h-2 rounded-full bg-usm-blue-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-usm-blue-dark capitalize">{entry.status}</p>
                      {entry.notes && <p className="text-xs text-slate-500 italic mt-0.5">{entry.notes}</p>}
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(entry.updatedAt).toLocaleString('fr-TN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
