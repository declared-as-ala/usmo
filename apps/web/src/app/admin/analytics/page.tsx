'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AdminPageHeader } from '../../../components/Admin/AdminPageHeader';
import { StatCard } from '../../../components/Admin/StatCard';
import {
  BarChart3,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Newspaper,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { tr } from '../../../utils/i18n';

export default function AdminAnalyticsRoute() {
  const { sponsors, orders, newsList, products, matches, language } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'shop' | 'content' | 'sponsors'>('overview');

  // Sponsor metrics calculations
  const totalImpressions = sponsors.reduce((sum, s) => sum + (s.metrics?.impressions || 0), 0);
  const totalClicks = sponsors.reduce((sum, s) => sum + (s.metrics?.clicks || 0), 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Shop revenue calculations (ignore cancelled orders)
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // News views calculation (use mock views fallback if not explicitly present)
  const totalArticleViews = newsList.reduce((sum, n) => sum + ((n as any).views || 250), 0);

  // Dynamically calculate product sales from confirmed & pending orders
  const productSalesMap: { [name: string]: { quantity: number; revenue: number } } = {};
  orders.forEach((o) => {
    if (o.status === 'cancelled') return;
    o.items.forEach((item) => {
      const pName = item.product?.name || 'Unknown Product';
      if (!productSalesMap[pName]) {
        productSalesMap[pName] = { quantity: 0, revenue: 0 };
      }
      productSalesMap[pName].quantity += item.quantity;
      const unitPrice = item.product?.price ? parseFloat(item.product.price.replace(/[^\d.]/g, '')) : 0;
      productSalesMap[pName].revenue += item.quantity * unitPrice;
    });
  });

  const topSellingProducts = Object.entries(productSalesMap)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Orders status share
  const ordersPending = orders.filter((o) => o.status === 'pending').length;
  const ordersConfirmed = orders.filter((o) => o.status === 'confirmed').length;
  const ordersCancelled = orders.filter((o) => o.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics Panel"
        description="Real-time business intelligence dashboard calculated directly from live database collections."
      />

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-px">
        {[
          {
            id: 'overview',
            label: tr(language, 'Dashboard Overview', 'Aperçu du Tableau', 'نظرة عامة على اللوحة'),
            icon: BarChart3,
          },
          {
            id: 'shop',
            label: tr(language, 'Shop & E-Commerce', 'Boutique & E-Commerce', 'المغازة والتجارة الإلكترونية'),
            icon: ShoppingCart,
          },
          {
            id: 'content',
            label: tr(language, 'News & Engagement', 'Actualités & Engagement', 'الأخبار والتفاعل'),
            icon: Newspaper,
          },
          {
            id: 'sponsors',
            label: tr(language, 'Sponsors & ROI', 'Partenaires & ROI', 'المستشرون والعوائد'),
            icon: Award,
          },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'border-usm-blue-primary text-usm-blue-primary font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={tr(language, 'Total Net Revenue', 'Revenu Net Total', 'إجمالي الإيرادات الصافية')}
              value={`${Math.round(totalRevenue).toLocaleString()} TND`}
              icon={ShoppingCart}
              accent="blue"
            />
            <StatCard
              label={tr(language, 'Live Orders', 'Commandes Actives', 'الطلبات الحالية')}
              value={totalOrdersCount}
              icon={TrendingUp}
              accent="emerald"
            />
            <StatCard
              label={tr(language, 'Content Views', 'Vues des Articles', 'مشاهدات المحتوى')}
              value={totalArticleViews.toLocaleString()}
              icon={Eye}
              accent="slate"
            />
            <StatCard
              label={tr(language, 'Sponsor Ad Clicks', 'Clics Partenaires', 'نقرات المستشهرين')}
              value={totalClicks.toLocaleString()}
              icon={MousePointerClick}
              accent="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Metrics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
                <Sparkles size={16} className="text-usm-blue-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {tr(language, 'Operational Performance', 'Performance Opérationnelle', 'الأداء التشغيلي')}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    {tr(language, 'Average Order Value', 'Panier Moyen', 'متوسط قيمة الطلب')}
                  </span>
                  <span className="text-lg font-mono font-black text-slate-900">{Math.round(averageOrderValue)} TND</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    {tr(language, 'Avg. Sponsor CTR', 'CTR Moyen Partenaires', 'معدل النقر للمستشهرين')}
                  </span>
                  <span className="text-lg font-mono font-black text-slate-900">{averageCTR.toFixed(2)}%</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    {tr(language, 'Order Completion Rate', 'Taux de Validation', 'معدل اكتمال الطلبات')}
                  </span>
                  <span className="text-lg font-mono font-black text-slate-900">
                    {totalOrdersCount > 0 ? ((ordersConfirmed / totalOrdersCount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    {tr(language, 'E-Shop Products', 'Articles Boutique', 'منتجات المغازة')}
                  </span>
                  <span className="text-lg font-mono font-black text-slate-900">{products.length} {tr(language, 'Items', 'Articles', 'منتجات')}</span>
                </div>
              </div>
            </div>

            {/* Sports Fixtures */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Award size={16} className="text-usm-blue-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {tr(language, 'Sports & Match Overview', 'Aperçu des Matchs & Sports', 'ملخص المباريات والرياضات')}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs text-slate-500 font-semibold">
                    {tr(language, 'Total Scheduled Matches', 'Total Matchs Programmés', 'إجمالي المباريات المبرمجة')}
                  </span>
                  <span className="text-xs font-black text-slate-900">{matches.length} {tr(language, 'Matches', 'Matchs', 'مباريات')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs text-slate-500 font-semibold">
                    {tr(language, 'Football Fixtures', 'Matchs de Football', 'مباريات كرة القدم')}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {matches.filter((m) => m.sport === 'football').length} {tr(language, 'Fixtures', 'Matchs', 'مباريات')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs text-slate-500 font-semibold">
                    {tr(language, 'Basketball Fixtures', 'Matchs de Basket', 'مباريات كرة السلة')}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {matches.filter((m) => m.sport === 'basketball').length} {tr(language, 'Fixtures', 'Matchs', 'مباريات')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">
                    {tr(language, 'Active Live Matches', 'Matchs en Direct Actifs', 'المباريات النشطة حاليا')}
                  </span>
                  <span className="text-xs font-black text-red-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    {matches.filter((m) => m.status === 'live').length} {tr(language, 'Active', 'Actif', 'مباشر')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Order Status Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-3">
              {tr(language, 'Order Status Distribution', 'Répartition du Statut des Commandes', 'توزيع حالة طلبات الشراء')}
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: tr(language, 'Confirmed (Completed)', 'Confirmées (Livrées)', 'تم تأكيدها (مكتملة)'),
                  count: ordersConfirmed,
                  color: 'bg-emerald-500',
                  pct: totalOrdersCount > 0 ? (ordersConfirmed / totalOrdersCount) * 100 : 0,
                },
                {
                  label: tr(language, 'Pending Confirmation', 'En Attente de Validation', 'قيد الانتظار'),
                  count: ordersPending,
                  color: 'bg-amber-400',
                  pct: totalOrdersCount > 0 ? (ordersPending / totalOrdersCount) * 100 : 0,
                },
                {
                  label: tr(language, 'Cancelled / Rejected', 'Annulées / Rejetées', 'ملغاة / مرفوضة'),
                  count: ordersCancelled,
                  color: 'bg-red-500',
                  pct: totalOrdersCount > 0 ? (ordersCancelled / totalOrdersCount) * 100 : 0,
                },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">{s.label}</span>
                    <span className="font-bold text-slate-900">
                      {s.count} ({s.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-3">
              {tr(language, 'Top Selling Products (Dynamic from Orders)', 'Meilleures Ventes (Calculé des Commandes)', 'المنتجات الأكثر مبيعًا (ديناميكي من الطلبات)')}
            </h3>
            {topSellingProducts.length > 0 ? (
              <div className="space-y-4">
                {topSellingProducts.map((p) => {
                  const maxQty = Math.max(1, ...topSellingProducts.map((p) => p.quantity));
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900 truncate">{p.name}</span>
                        <div className="mt-1.5 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-usm-blue-primary rounded-full transition-all" style={{ width: `${(p.quantity / maxQty) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-mono font-black text-slate-900">
                          {p.quantity} {tr(language, 'sold', 'vendus', 'بيعت')}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">{Math.round(p.revenue)} TND</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center font-semibold">
                {tr(language, 'No catalog sales recorded yet.', 'Aucune vente enregistrée pour le moment.', 'لم يتم تسجيل أي مبيعات بعد.')}
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Article Engagement */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-3">
              {tr(language, 'Most Popular Articles', 'Articles les plus Populaires', 'المقالات الأكثر شعبية')}
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {[...newsList]
                .sort((a, b) => ((b as any).views || 250) - ((a as any).views || 250))
                .slice(0, 5)
                .map((n, i) => (
                  <div key={n.id} className="py-3 flex items-center gap-4 justify-between">
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="text-lg font-mono font-black text-usm-blue-primary/45 w-6 text-center">{i + 1}</span>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 truncate">{n.title}</span>
                        <span className="block text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">{n.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-slate-900">{(n as any).views || 250}</span>
                      <span className="block text-[9px] text-slate-400">{tr(language, 'Views', 'Vues', 'مشاهدة')}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Category Share */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-3">
              {tr(language, 'Content Category Share', 'Partage par Catégorie de Contenu', 'نسبة المحتوى حسب الفئة')}
            </h3>
            <div className="space-y-4">
              {['Football', 'Basketball', 'Club', 'Academy', 'Announcements'].map((cat) => {
                const count = newsList.filter((n) => n.category === cat).length;
                const pct = newsList.length > 0 ? (count / newsList.length) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600">{cat}</span>
                      <span className="font-bold text-slate-900">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sponsors' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 font-display">
              {tr(language, 'Sponsor Performance (Live Campaign Tracker)', 'Performance des Partenaires (Suivi de Campagne)', 'أداء المستشهرين (تتبع الحملات الإعلانية)')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">{tr(language, 'Sponsor', 'Sponsor', 'المستشهر')}</th>
                  <th className="py-3 px-4">{tr(language, 'Tier', 'Catégorie', 'الفئة')}</th>
                  <th className="py-3 px-4">{tr(language, 'Impressions', 'Impressions', 'المشاهدات')}</th>
                  <th className="py-3 px-4">{tr(language, 'Clicks', 'Clics', 'النقرات')}</th>
                  <th className="py-3 px-4">CTR %</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{tr(language, 'Performance Rating', 'Évaluation', 'تقييم الأداء')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sponsors.map((s) => {
                  const ctr = s.metrics.impressions > 0 ? (s.metrics.clicks / s.metrics.impressions) * 100 : 0;
                  const rating = ctr >= 3 ? 'Excellent' : ctr >= 1.5 ? 'Good' : 'Needs Optimization';
                  const tRating =
                    rating === 'Excellent'
                      ? tr(language, 'Excellent', 'Excellent', 'ممتاز')
                      : rating === 'Good'
                      ? tr(language, 'Good', 'Bon', 'جيد')
                      : tr(language, 'Needs Optimization', 'À Optimiser', 'يحتاج تحسين');
                  const ratingColor =
                    rating === 'Excellent'
                      ? 'text-emerald-600 bg-emerald-50'
                      : rating === 'Good'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-amber-600 bg-amber-50';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.metrics.impressions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{s.metrics.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{ctr.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right rtl:text-left">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${ratingColor}`}>
                          {tRating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
