'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { Package, Calendar, Loader2, ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-500/20 text-amber-500' },
  confirmed: { label: 'Confirmée', className: 'bg-usm-blue-primary/20 text-usm-blue-primary' },
  prepared: { label: 'Préparée', className: 'bg-indigo-500/20 text-indigo-500' },
  shipped: { label: 'Expédiée', className: 'bg-sky-500/20 text-sky-500' },
  delivered: { label: 'Livrée', className: 'bg-emerald-500/20 text-emerald-500' },
  cancelled: { label: 'Annulée', className: 'bg-red-500/20 text-red-500' },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders()
      .then((data: any) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
          <Package size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mes Commandes</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Historique de vos commandes passées sur la boutique officielle.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement de vos commandes...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
            const total = (order.items || []).reduce((sum: number, i: any) => sum + (i.subtotal || 0), 0);
            return (
              <Link
                key={order._id}
                href="/commande"
                className="usm-card border border-usm-border p-4 flex items-center justify-between gap-4 hover:border-usm-blue-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-usm-blue-soft border border-usm-border flex items-center justify-center text-slate-500 shrink-0">
                    <Truck size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-usm-blue-dark font-mono">{order.orderNumber}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      <span className="mx-1">·</span>
                      {(order.items || []).length} article{(order.items || []).length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-xs font-black text-usm-blue-dark">
                    {(total / 1000).toFixed(0)} TND
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${status.className}`}>
                    {status.label}
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <Package size={16} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-usm-blue-dark">Aucune commande</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Vous n&apos;avez pas encore passé de commande sur la boutique officielle.</p>
          </div>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors"
          >
            Visiter la boutique
          </Link>
        </div>
      )}
    </div>
  );
}
