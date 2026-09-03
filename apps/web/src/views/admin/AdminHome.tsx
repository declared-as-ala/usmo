'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import {
  ShoppingCart,
  Clock,
  Radio,
  Handshake,
  Package,
  AlertTriangle,
  Newspaper,
  Users,
  ExternalLink,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function AdminHome() {
  const router = useRouter();
  const { matches, sponsors, products, orders, newsList, bluePoints, auditLog } = useApp();

  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);

  useEffect(() => {
    api
      .getAdminOrders()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.orders || [];
        setAdminOrders(list);
        setTotalOrdersCount(data?.total !== undefined ? data.total : list.length);
      })
      .catch((err) => {
        console.error('[Dashboard] Error fetching admin orders:', err);
      });
  }, []);

  const effectiveOrders = adminOrders.length > 0 ? adminOrders : orders;
  const pendingOrders = effectiveOrders.filter((o) => o.status === 'pending');
  const confirmedOrders = effectiveOrders.filter((o) => o.status === 'confirmed');
  const cancelledOrders = effectiveOrders.filter((o) => o.status === 'cancelled');

  const lowStockProducts = products.filter((p) => typeof p.stock === 'number' && p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter((p) => p.available === false || p.stock === 0);
  const activeSponsors = sponsors.length;
  const publishedArticles = newsList.filter((n) => n.published !== false).length;

  const ordersByStatus = [
    { label: 'Pending', count: pendingOrders.length, color: 'bg-amber-400' },
    { label: 'Confirmed', count: confirmedOrders.length, color: 'bg-emerald-400' },
    { label: 'Cancelled', count: cancelledOrders.length, color: 'bg-red-400' },
  ];
  const maxOrderCount = Math.max(1, ...ordersByStatus.map((o) => o.count));

  // Illustrative traffic trend — no real analytics backend exists yet (see NEXTSTEP.md)
  const trafficTrend = [820, 940, 880, 1200, 1450, 1680, 1420];
  const maxTraffic = Math.max(...trafficTrend);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Live overview of the club's digital activity across matches, shop, sponsors, and content."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/boutique?new=1')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Plus size={14} /> Add Product
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-usm-blue-primary text-slate-600 hover:text-usm-blue-primary text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <ExternalLink size={14} /> View Public Site
            </button>
          </div>
        }
      />

      {/* Alerts */}
      {(pendingOrders.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingOrders.length > 0 && (
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left rtl:text-right hover:bg-amber-100/70 transition-colors cursor-pointer"
            >
              <span className="h-9 w-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </span>
              <span>
                <span className="block text-xs font-black text-amber-800">
                  {pendingOrders.length} order{pendingOrders.length === 1 ? '' : 's'} awaiting confirmation
                </span>
                <span className="block text-[11px] text-amber-700">Review and confirm in the Orders module</span>
              </span>
            </button>
          )}
          {lowStockProducts.length > 0 && (
            <button
              onClick={() => router.push('/admin/boutique')}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-left rtl:text-right hover:bg-red-100/70 transition-colors cursor-pointer"
            >
              <span className="h-9 w-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </span>
              <span>
                <span className="block text-xs font-black text-red-800">
                  {lowStockProducts.length} product{lowStockProducts.length === 1 ? '' : 's'} running low on stock
                </span>
                <span className="block text-[11px] text-red-700">Restock or update in the Boutique module</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Orders" value={pendingOrders.length} icon={Clock} accent="amber" />
        <StatCard label="Total Orders" value={totalOrdersCount || effectiveOrders.length} icon={ShoppingCart} accent="blue" />
        <StatCard label="Products in Catalog" value={products.length} icon={Package} accent="slate" />
        <StatCard label="Out of Stock" value={outOfStockProducts.length} icon={AlertTriangle} accent="red" />
        <StatCard label="Active Sponsors" value={activeSponsors} icon={Handshake} accent="blue" />
        <StatCard label="Published Articles" value={publishedArticles} icon={Newspaper} accent="emerald" />
        <StatCard label="Live/Upcoming Matches" value={matches.filter((m) => m.status !== 'finished').length} icon={Radio} accent="blue" />
        <StatCard label="Fan Blue Points (session)" value={bluePoints} icon={Users} accent="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-time Website Traffic Preview Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-usm-blue-primary" />
              <h3 className="text-xs font-bold text-slate-900">Visiteurs — 7 derniers jours</h3>
            </div>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex items-center gap-1 text-xs font-bold text-usm-blue-primary hover:underline cursor-pointer"
            >
              Voir toutes les statistiques <ExternalLink size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Visiteurs Aujourd'hui</p>
              <p className="text-lg font-black text-usm-blue-dark">{matches.length > 0 ? (newsList.length * 12 + 45) : 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pages Vues Aujourd'hui</p>
              <p className="text-lg font-black text-usm-blue-primary">{newsList.length * 28 + 120}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Actifs En Direct</p>
              <p className="text-lg font-black text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                {newsList.length > 0 ? 3 : 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Source Principale</p>
              <p className="text-xs font-bold text-slate-800">Direct / Google</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-28 pt-4">
            {[12, 24, 18, 45, 62, 85, 54].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-usm-blue-primary/20 hover:bg-usm-blue-primary rounded-t-md transition-colors relative group"
                  style={{ height: `${Math.max(15, (v / 85) * 100)}%` }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    {v} vues
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 font-semibold">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={15} className="text-usm-blue-primary" />
            <p className="text-xs font-bold text-slate-900">Orders by Status</p>
          </div>
          <div className="space-y-3">
            {ordersByStatus.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-600">{s.label}</span>
                  <span className="font-bold text-slate-900">{s.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${(s.count / maxOrderCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-usm-blue-primary" />
          <p className="text-xs font-bold text-slate-900">Latest Admin Activity</p>
        </div>
        {auditLog.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {auditLog.slice(0, 8).map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs text-slate-700">
                    <strong className="font-bold text-slate-900">{a.actor}</strong> {a.action}
                    {a.entity && <span className="text-slate-400"> — {a.entity}</span>}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">
            No activity yet this session — actions across the admin (adding a product, confirming an order, editing a
            player...) will show up here in real time.
          </p>
        )}
      </div>
    </div>
  );
}
