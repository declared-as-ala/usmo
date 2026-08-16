'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Share2,
  TrendingUp,
  Download,
  Activity,
  Zap,
  ShoppingBag,
  Newspaper,
  Handshake,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';

export const AdminAnalyticsView: React.FC = () => {
  const { showToast } = useApp();
  const [range, setRange] = useState('7days');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'geo' | 'devices' | 'pages' | 'content' | 'realtime'>('overview');

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [sources, setSources] = useState<any>({ sources: [], campaigns: [] });
  const [geography, setGeography] = useState<any[]>([]);
  const [devices, setDevices] = useState<any>({ deviceTypes: [], browsers: [], os: [] });
  const [pages, setPages] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = { range, from, to };
      const [ovData, tmData, srcData, geoData, devData, pgData, cntData, rtData] = await Promise.all([
        api.getAnalyticsOverview(params).catch(() => null),
        api.getAnalyticsTraffic(params).catch(() => []),
        api.getAnalyticsSources(params).catch(() => ({ sources: [], campaigns: [] })),
        api.getAnalyticsGeography(params).catch(() => []),
        api.getAnalyticsDevices(params).catch(() => ({ deviceTypes: [], browsers: [], os: [] })),
        api.getAnalyticsPages(params).catch(() => []),
        api.getAnalyticsContent(params).catch(() => null),
        api.getAnalyticsRealtime().catch(() => null),
      ]);

      setOverview(ovData);
      setTimeline(tmData || []);
      setSources(srcData || { sources: [], campaigns: [] });
      setGeography(geoData || []);
      setDevices(devData || { deviceTypes: [], browsers: [], os: [] });
      setPages(pgData || []);
      setContent(cntData);
      setRealtime(rtData);
    } catch (err: any) {
      showToast(err.message || 'Erreur d\'ingestion analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, from, to]);

  const handleExportCsv = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/analytics/export?range=${range}&from=${from}&to=${to}`;
      window.open(url, '_blank');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'exportation', 'error');
    }
  };

  const totalViews = overview?.totalViews || 0;
  const uniqueVisitors = overview?.uniqueVisitors || 0;
  const viewsToday = overview?.viewsToday || 0;
  const viewsYesterday = overview?.viewsYesterday || 0;
  const activeNow = realtime?.activeVisitors || overview?.activeNow || 0;

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Statistiques & Audience du Site Web"
        description="Analytique en temps réel et historique des visiteurs, sources de trafic, campagnes UTM, géolocalisation et performance des contenus."
        actions={
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <Download size={14} /> Exporter Rapport (CSV)
          </button>
        }
      />

      {/* Date Range Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-usm-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={15} className="text-usm-blue-primary" />
          <span className="text-xs font-bold text-slate-700 mr-2">Période :</span>
          {[
            { id: 'today', label: 'Aujourd\'hui' },
            { id: 'yesterday', label: 'Hier' },
            { id: '7days', label: '7 derniers jours' },
            { id: '30days', label: '30 derniers jours' },
            { id: 'season', label: 'Cette Saison' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setRange(item.id);
                setFrom('');
                setTo('');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                range === item.id && !from
                  ? 'bg-usm-blue-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom date range input */}
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setRange('custom');
            }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700"
          />
          <span className="text-slate-400">à</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setRange('custom');
            }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700"
          />
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-usm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pages Vues</span>
            <Eye size={16} className="text-usm-blue-primary" />
          </div>
          <p className="text-2xl font-black text-usm-blue-dark">{totalViews.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Total vues cumulées</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-usm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visiteurs Uniques</span>
            <Users size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-usm-blue-dark">{uniqueVisitors.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Sessions individuelles</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-usm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visiteurs Aujourd'hui</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-usm-blue-dark">{viewsToday.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Hier: {viewsYesterday.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-usm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Temps Moyen Session</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-usm-blue-dark">
            {Math.floor((overview?.avgSessionDuration || 180) / 60)}m {(overview?.avgSessionDuration || 180) % 60}s
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Engagement moyen</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-usm-border">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pages / Session</span>
            <Layers size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-usm-blue-dark">{overview?.pagesPerSession || '1.8'}</p>
          <p className="text-[10px] text-slate-400 mt-1">Profondeur de visite</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> En Direct
            </span>
            <Zap size={16} />
          </div>
          <p className="text-2xl font-black text-emerald-700">{activeNow}</p>
          <p className="text-[10px] text-emerald-600 mt-1">Visiteurs actifs (5 min)</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-usm-border gap-6 text-xs font-bold overflow-x-auto">
        {[
          { id: 'overview', label: 'Vue d\'Ensemble & Trafic' },
          { id: 'sources', label: 'Origine & Campagnes UTM' },
          { id: 'geo', label: 'Géolocalisation & Diasporas' },
          { id: 'devices', label: 'Appareils & Navigateurs' },
          { id: 'pages', label: 'Pages les plus Visitées' },
          { id: 'content', label: 'Performance Boutique & Médias' },
          { id: 'realtime', label: 'Temps Réel' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-usm-blue-primary text-usm-blue-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Chargement des données analytiques...</div>
      ) : totalViews === 0 && activeTab !== 'realtime' ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-usm-border space-y-2">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Aucune donnée disponible pour cette période.</p>
          <p className="text-xs text-slate-400">Naviguez sur le site public pour enregistrer des visites et des événements en direct.</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & TRAFFIC CHART */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="text-sm font-bold text-usm-blue-dark">Évolution des Visiteurs et Pages Vues</h3>
                {timeline.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">Aucune donnée de tendance enregistrée sur cette période.</p>
                ) : (
                  <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-4 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
                    {timeline.map((point) => {
                      const maxVal = Math.max(...timeline.map((t) => t.pageViews || 1));
                      const heightPct = Math.max(10, Math.round((point.pageViews / maxVal) * 100));
                      return (
                        <div key={point.date} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="text-[10px] font-bold text-usm-blue-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            {point.pageViews}
                          </div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-usm-blue-primary/80 group-hover:bg-usm-blue-primary rounded-t-lg transition-all"
                          />
                          <span className="text-[9px] font-mono text-slate-400 rotate-45 sm:rotate-0">
                            {point.date?.substring(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SOURCES & UTM CAMPAIGNS */}
          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark">Sources de Trafic Référentes</h3>
                <div className="space-y-2.5">
                  {sources.sources?.length === 0 ? (
                    <p className="text-slate-400 py-4 text-center">Aucune source référente enregistrée.</p>
                  ) : (
                    sources.sources?.map((s: any) => (
                      <div key={s.source} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 font-bold text-slate-800 capitalize">
                          <Share2 size={14} className="text-usm-blue-primary" />
                          {s.source}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-usm-blue-dark">{s.visitors} visiteurs</p>
                          <p className="text-[10px] text-slate-400">{s.pageViews} vues</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark">Suivi des Campagnes UTM</h3>
                <div className="space-y-2.5">
                  {sources.campaigns?.length === 0 ? (
                    <p className="text-slate-400 py-4 text-center">Aucune campagne UTM détectée (utilisez ?utm_source=...)</p>
                  ) : (
                    sources.campaigns?.map((c: any) => (
                      <div key={c.campaign} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-usm-blue-primary">{c.campaign}</p>
                          <p className="text-[10px] text-slate-400">{c.source} / {c.medium || 'social'}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg">{c.visitors} clics</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEOGRAPHY & DIASPORA */}
          {activeTab === 'geo' && (
            <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4 text-xs">
              <h3 className="font-bold text-sm text-usm-blue-dark">Répartition par Pays des Supporters USM</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {geography.length === 0 ? (
                  <p className="text-slate-400 col-span-3 py-4 text-center">Aucune donnée géographique disponible.</p>
                ) : (
                  geography.map((g: any) => (
                    <div key={g.country} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe size={18} className="text-usm-blue-primary" />
                        <span className="font-bold text-slate-800">{g.country}</span>
                      </div>
                      <span className="font-black text-usm-blue-dark">{g.visitors} visiteurs</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DEVICES & BROWSERS */}
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark">Type d'Appareil</h3>
                <div className="space-y-3">
                  {devices.deviceTypes?.map((d: any) => (
                    <div key={d.device} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold capitalize text-slate-700">{d.device}</span>
                      <span className="font-black text-usm-blue-primary">{d.count} visiteurs</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark">Navigateurs Web</h3>
                <div className="space-y-3">
                  {devices.browsers?.map((b: any) => (
                    <div key={b.browser} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-700">{b.browser}</span>
                      <span className="font-black text-indigo-600">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark">Systèmes d'Exploitation</h3>
                <div className="space-y-3">
                  {devices.os?.map((o: any) => (
                    <div key={o.os} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-700">{o.os}</span>
                      <span className="font-black text-purple-600">{o.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TOP PAGES */}
          {activeTab === 'pages' && (
            <div className="bg-white rounded-2xl border border-usm-border overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-usm-border">
                  <tr>
                    <th className="px-5 py-3.5">Chemin de la Page</th>
                    <th className="px-5 py-3.5">Titre de la Page</th>
                    <th className="px-5 py-3.5">Nombre de Vues</th>
                    <th className="px-5 py-3.5 text-right">Visiteurs Uniques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-usm-border">
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">Aucune page visitée pour le moment.</td>
                    </tr>
                  ) : (
                    pages.map((pg: any) => (
                      <tr key={pg.path} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5 font-mono font-bold text-usm-blue-primary">{pg.path}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">{pg.title}</td>
                        <td className="px-5 py-3.5 font-black text-slate-900">{pg.views}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-500 text-right">{pg.uniqueVisitors}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: CONTENT & BOUTIQUE */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark flex items-center gap-2">
                  <ShoppingBag size={16} className="text-usm-blue-primary" /> Performance Boutique Officielle
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Vues Catalogue</p>
                    <p className="text-xl font-black text-slate-800">{content?.boutique?.views || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Ajouts Panier</p>
                    <p className="text-xl font-black text-usm-blue-primary">{content?.boutique?.cartAdds || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Checkouts Initiés</p>
                    <p className="text-xl font-black text-indigo-600">{content?.boutique?.checkouts || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Commandes Réservées</p>
                    <p className="text-xl font-black text-emerald-600">{content?.boutique?.orders || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
                <h3 className="font-bold text-sm text-usm-blue-dark flex items-center gap-2">
                  <Handshake size={16} className="text-usm-blue-primary" /> Visibilité des Sponsors
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Impressions Logos</p>
                    <p className="text-2xl font-black text-slate-800">{content?.sponsors?.impressions || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Clics / Partenariats</p>
                    <p className="text-2xl font-black text-usm-blue-primary">{content?.sponsors?.clicks || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REALTIME */}
          {activeTab === 'realtime' && (
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 space-y-6 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-base text-emerald-800">
                  {realtime?.activeVisitors || 0} Visiteurs Actifs sur le site en ce moment
                </h3>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-3">Pages actuellement consultées :</h4>
                <div className="space-y-2">
                  {(!realtime?.activePages || realtime.activePages.length === 0) ? (
                    <p className="text-slate-400">Aucune activité enregistrée sur les 5 dernières minutes.</p>
                  ) : (
                    realtime.activePages.map((ap: any) => (
                      <div key={ap.path} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-mono font-bold text-usm-blue-primary">{ap.path}</span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
                          {ap.activeVisitors} actif(s)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
