'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { ShoppingCart, Clock, CheckCircle2, XCircle, Truck, Package, PhoneCall, PhoneOff, X, RefreshCw, Search, ChevronDown } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';

interface BackendOrder {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string; city: string; address?: string };
  deliveryMethod: 'delivery' | 'pickup';
  items: { productId: string; name: string; size: string; quantity: number; price: number; subtotal: number }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponApplied?: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; updatedAt: string; notes?: string }[];
  notes?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 border border-sky-200',
  prepared:  'bg-violet-50 text-violet-700 border border-violet-200',
  shipped:   'bg-blue-50 text-blue-700 border border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending:   'confirmed',
  confirmed: 'prepared',
  prepared:  'shipped',
  shipped:   'delivered',
  delivered: null,
  cancelled: null,
};

const formatTND = (millimes: number) => `${(millimes / 1000).toFixed(3)} TND`;

export default function AdminOrders() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialingOrder, setDialingOrder] = useState<BackendOrder | null>(null);
  const [callConnected, setCallConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
  const [savingZoneId, setSavingZoneId] = useState<string | null>(null);

  const loadZones = useCallback(async () => {
    try {
      const z = await api.getDeliveryZones();
      setZones(z || []);
      const initPrices: Record<string, string> = {};
      (z || []).forEach((item: any) => {
        initPrices[item._id] = ((item.price || 0) / 1000).toString();
      });
      setEditingPrice(initPrices);
    } catch (err) {}
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleUpdateZonePrice = async (zoneId: string) => {
    const val = parseFloat(editingPrice[zoneId] || '0');
    if (isNaN(val) || val < 0) return;
    const millimes = Math.round(val * 1000);
    setSavingZoneId(zoneId);
    try {
      await api.updateDeliveryZone(zoneId, { price: millimes });
      await loadZones();
      alert('Tarif de livraison mis à jour avec succès !');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setSavingZoneId(null);
    }
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const data = await api.getAdminOrders(params);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => loadOrders(), 300);
    return () => clearTimeout(t);
  }, [loadOrders]);

  const startCall = (order: BackendOrder) => {
    setDialingOrder(order);
    setCallConnected(false);
    setTimeout(() => setCallConnected(true), 1200);
  };

  const handleStatusChange = async (order: BackendOrder, newStatus: OrderStatus) => {
    setUpdatingId(order._id);
    try {
      await api.updateOrderStatus(order._id, newStatus);
      await loadOrders();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCallAction = async (order: BackendOrder, newStatus: OrderStatus) => {
    setDialingOrder(null);
    await handleStatusChange(order, newStatus);
  };

  const countByStatus = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestion des Commandes"
        description="Toutes les commandes du site boutique. Confirmez chaque commande avant préparation."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="En attente" value={countByStatus('pending')}   icon={Clock}         accent="amber"   />
        <StatCard label="Confirmées" value={countByStatus('confirmed')} icon={CheckCircle2}  accent="blue"    />
        <StatCard label="En prépa"   value={countByStatus('prepared')}  icon={Package}       accent="violet"  />
        <StatCard label="Expédiées"  value={countByStatus('shipped')}   icon={Truck}         accent="blue"    />
        <StatCard label="Livrées"    value={countByStatus('delivered')} icon={CheckCircle2}  accent="emerald" />
        <StatCard label="Annulées"   value={countByStatus('cancelled')} icon={XCircle}       accent="red"     />
      </div>

      {/* Delivery Fee Admin Manager */}
      {zones.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Truck size={16} className="text-usm-blue-primary" />
                Tarifs de Livraison par Région
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gérez les frais de livraison appliqués aux 24 gouvernorats lors du checkout (ex: 4 DT pour Monastir, 8 DT pour les autres régions).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {zones.map((zone) => (
              <div key={zone._id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">{zone.nameFr || zone.name}</p>
                  <p className="text-[10px] text-slate-500">Zone : {zone.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={editingPrice[zone._id] ?? ((zone.price || 0) / 1000)}
                    onChange={(e) => setEditingPrice({ ...editingPrice, [zone._id]: e.target.value })}
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-mono font-bold bg-white"
                  />
                  <span className="text-xs font-bold text-slate-600">DT</span>
                  <button
                    onClick={() => handleUpdateZonePrice(zone._id)}
                    disabled={savingZoneId === zone._id}
                    className="px-3 py-1 bg-usm-blue-primary text-white text-[11px] font-bold rounded-lg hover:bg-usm-blue-hover transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingZoneId === zone._id ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'prepared', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer transition-colors ${
                  statusFilter === s
                    ? 'bg-usm-blue-dark text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'Toutes' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Référence, client, tél…"
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/30 w-52"
              />
            </div>
            <button
              onClick={loadOrders}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Actualiser"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {error && (
            <div className="p-6 text-center text-red-500 text-sm">{error}</div>
          )}

          {loading && !error && (
            <div className="p-10 text-center text-slate-400 text-sm animate-pulse">Chargement des commandes...</div>
          )}

          {!loading && !error && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Réf.</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Articles</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Livraison</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const nextStatus = STATUS_NEXT[order.status];
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-usm-blue-primary">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{order.customer.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {order.customer.phone} · {order.customer.city}
                        </p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {order.items.map((item, i) => (
                          <p key={i} className="truncate text-slate-600">
                            {item.quantity}× {item.name} ({item.size})
                          </p>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono whitespace-nowrap">
                        {formatTND(order.total)}
                        {order.couponApplied && (
                          <span className="block text-[9px] text-emerald-600 font-normal">
                            Coupon: {order.couponApplied}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          order.deliveryMethod === 'pickup'
                            ? 'bg-violet-50 text-violet-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}>
                          {order.deliveryMethod === 'pickup' ? 'Retrait' : 'Livraison'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString('fr-TN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => startCall(order)}
                              title="Appeler le client"
                              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 rounded font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                            >
                              <PhoneCall size={11} /> Appeler
                            </button>
                          )}

                          {nextStatus && order.status !== 'cancelled' && (
                            <button
                              disabled={updatingId === order._id}
                              onClick={() => handleStatusChange(order, nextStatus)}
                              className="px-2 py-1.5 bg-usm-blue-primary text-white hover:bg-usm-blue-primary/85 rounded font-bold cursor-pointer transition-all disabled:opacity-50 capitalize text-[11px]"
                            >
                              {updatingId === order._id ? '…' : nextStatus}
                            </button>
                          )}

                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              disabled={updatingId === order._id}
                              onClick={() => handleStatusChange(order, 'cancelled')}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded font-bold cursor-pointer transition-all disabled:opacity-50 text-[11px]"
                            >
                              Annuler
                            </button>
                          )}

                          {(order.status === 'cancelled' || order.status === 'delivered') && (
                            <span className="text-[10px] text-slate-400">Terminée</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && total > 0 && (
          <div className="p-3 border-t border-slate-100 text-xs text-slate-500 text-right">
            {total} commande{total > 1 ? 's' : ''} au total
          </div>
        )}
      </div>

      {/* Phone call simulation modal */}
      {dialingOrder && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
            <button
              onClick={() => setDialingOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5 animate-pulse">
              <PhoneCall size={26} className="text-emerald-500" />
            </div>

            <span className="text-[9px] bg-slate-100 text-slate-600 font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              USM CRM Outbound Dialer
            </span>

            <h3 className="font-black text-lg text-slate-900 mt-4">{dialingOrder.customer.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">{dialingOrder.customer.phone}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{dialingOrder.customer.city}</p>

            <p className="mt-2 text-[11px] text-slate-500 font-mono">Commande: {dialingOrder.orderNumber}</p>
            <p className="text-[11px] font-bold text-slate-900">{formatTND(dialingOrder.total)}</p>

            <div className="my-6">
              {callConnected ? (
                <>
                  <p className="text-xs text-emerald-600 font-bold uppercase font-mono">Appel connecté</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-normal italic mt-2">
                    &quot;Bonjour {dialingOrder.customer.name}, je vous contacte depuis la boutique officielle USM pour confirmer votre commande de {formatTND(dialingOrder.total)}.&quot;
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 animate-pulse">Connexion en cours...</p>
              )}
            </div>

            {callConnected && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => handleCallAction(dialingOrder, 'confirmed')}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => handleCallAction(dialingOrder, 'cancelled')}
                  className="py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}

            <button
              onClick={() => setDialingOrder(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PhoneOff size={12} /> Raccrocher
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
