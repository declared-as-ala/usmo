'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
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
  Calendar,
  MapPin,
  TrendingUp,
  Activity,
  Plus,
  ShoppingBag,
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

  const upcomingFootball = matches.find((m) => m.sport === 'football' && (m.status === 'upcoming' || m.status === 'live'));
  const upcomingBasketball = matches.find((m) => m.sport === 'basketball' && (m.status === 'upcoming' || m.status === 'live'));

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lowStockProducts = products.filter((p) => typeof p.stock === 'number' && p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter((p) => p.available === false || p.stock === 0);
  const activeSponsors = sponsors.length;
  const publishedArticles = newsList.filter((n) => n.published !== false).length;

  const ordersByStatus = [
    { label: 'Pending', count: orders.filter((o) => o.status === 'pending').length, color: 'bg-amber-400' },
    { label: 'Confirmed', count: orders.filter((o) => o.status === 'confirmed').length, color: 'bg-emerald-400' },
    { label: 'Cancelled', count: orders.filter((o) => o.status === 'cancelled').length, color: 'bg-red-400' },
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
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingCart} accent="blue" />
        <StatCard label="Products in Catalog" value={products.length} icon={Package} accent="slate" />
        <StatCard label="Out of Stock" value={outOfStockProducts.length} icon={AlertTriangle} accent="red" />
        <StatCard label="Active Sponsors" value={activeSponsors} icon={Handshake} accent="blue" />
        <StatCard label="Published Articles" value={publishedArticles} icon={Newspaper} accent="emerald" />
        <StatCard label="Live/Upcoming Matches" value={matches.filter((m) => m.status !== 'finished').length} icon={Radio} accent="blue" />
        <StatCard label="Fan Blue Points (session)" value={bluePoints} icon={Users} accent="emerald" />
      </div>

      {/* Next matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { label: 'Next Football Match', match: upcomingFootball },
          { label: 'Next Basketball Match', match: upcomingBasketball },
        ].map(({ label, match }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
              {match?.status === 'live' && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            {match ? (
              <div>
                <p className="text-sm font-black text-slate-900">
                  {match.homeTeam} <span className="text-slate-400 font-normal">vs</span> {match.awayTeam}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {match.date} • {match.time}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={12} /> {match.venue}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No upcoming fixture scheduled.</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-usm-blue-primary" />
            <p className="text-xs font-bold text-slate-900">Website Traffic — Last 7 Days</p>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {trafficTrend.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-usm-blue-primary/15 hover:bg-usm-blue-primary/25 rounded-t-md transition-colors relative group"
                  style={{ height: `${(v / maxTraffic) * 100}%` }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    {v.toLocaleString()}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 font-semibold">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Illustrative — connect real analytics in Settings → Integrations.</p>
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
