'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { SponsorLogo } from '../../components/Common/SponsorLogo';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { api } from '../../lib/api-client';
import {
  Plus, X, Trash2, Pencil, Handshake, Eye, MousePointerClick, Percent, Loader2, Mail,
  ExternalLink, CheckCircle2, XCircle, ShieldCheck, Sparkles, FileText, ArrowUpDown
} from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface PartnerLead {
  _id: string; company: string; contactName: string; email: string; phone: string;
  objective: string; message: string; status: 'new' | 'contacted' | 'closed'; createdAt: string;
}

type SponsorCategory = 'Main' | 'Official' | 'Technical' | 'Media' | 'Academy' | 'Partner' | 'Institutional';
type SportScope = 'CLUB' | 'FOOTBALL' | 'BASKETBALL' | 'BOTH';

interface Sponsor {
  _id: string;
  name: string;
  slug: string;
  shortName?: string;
  category: SponsorCategory;
  sponsorType?: string;
  sportScope?: SportScope;
  logo: string;
  primaryLogo?: string;
  lightLogo?: string;
  darkLogo?: string;
  thumbnail?: string;
  story: string;
  storyFr?: string;
  storyAr?: string;
  offer?: string;
  link?: string;
  websiteUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  showOnSponsorsPage?: boolean;
  sourceType?: 'PDF_IMPORT' | 'MANUAL';
  sourceFile?: string;
  sourcePage?: number | null;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

const CATEGORIES: SponsorCategory[] = ['Main', 'Official', 'Technical', 'Media', 'Academy', 'Partner', 'Institutional'];
const SPORT_SCOPES: { value: SportScope; label: string }[] = [
  { value: 'CLUB', label: 'Club (Tous)' },
  { value: 'FOOTBALL', label: 'Football' },
  { value: 'BASKETBALL', label: 'Basketball' },
  { value: 'BOTH', label: 'Foot & Basket' },
];

const emptyForm = {
  name: '',
  slug: '',
  category: 'Official' as SponsorCategory,
  sponsorType: 'OFFICIAL',
  sportScope: 'CLUB' as SportScope,
  logo: '',
  primaryLogo: '',
  lightLogo: '',
  darkLogo: '',
  story: '',
  link: '',
  offer: '',
  displayOrder: 0,
  isActive: true,
  isFeatured: false,
  showOnHomepage: true,
  showOnSponsorsPage: true,
};

export default function AdminSponsors() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(() => searchParams.get('new') === '1');
  const [form, setForm] = useState(emptyForm);
  const [logoUploading, setLogoUploading] = useState(false);

  const [activeTab, setActiveTab] = useState<'sponsors' | 'leads'>('sponsors');
  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      setLeads(await api.getAdminPartnerLeads());
    } catch {
      setError('Failed to load partner leads');
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const setLeadStatus = async (lead: PartnerLead, status: PartnerLead['status']) => {
    try {
      await api.updatePartnerLeadStatus(lead._id, status);
      await loadLeads();
    } catch (err: any) {
      setError(err.message || 'Failed to update lead');
    }
  };

  const loadSponsors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAdminSponsors ? await api.getAdminSponsors() : await api.getSponsors();
      setSponsors(data);
    } catch {
      setError('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSponsors();
  }, [loadSponsors]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/admin/sponsors');
    }
  }, [searchParams, router]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (s: Sponsor) => {
    setEditingId(s._id);
    setForm({
      name: s.name,
      slug: s.slug || '',
      category: s.category,
      sponsorType: s.sponsorType || 'OFFICIAL',
      sportScope: s.sportScope || 'CLUB',
      logo: s.logo || s.primaryLogo || '',
      primaryLogo: s.primaryLogo || s.logo || '',
      lightLogo: s.lightLogo || '',
      darkLogo: s.darkLogo || '',
      story: s.story || '',
      link: s.link || s.websiteUrl || '',
      offer: s.offer ?? '',
      displayOrder: s.displayOrder ?? 0,
      isActive: s.isActive !== false,
      isFeatured: !!s.isFeatured,
      showOnHomepage: s.showOnHomepage !== false,
      showOnSponsorsPage: s.showOnSponsorsPage !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        category: form.category,
        sponsorType: form.sponsorType,
        sportScope: form.sportScope,
        logo: form.logo || form.primaryLogo,
        primaryLogo: form.primaryLogo || form.logo,
        lightLogo: form.lightLogo || undefined,
        darkLogo: form.darkLogo || undefined,
        story: form.story,
        storyFr: form.story,
        storyAr: form.story,
        offer: form.offer || undefined,
        link: form.link,
        websiteUrl: form.link,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        showOnHomepage: form.showOnHomepage,
        showOnSponsorsPage: form.showOnSponsorsPage,
      };

      if (editingId) {
        await api.updateSponsor(editingId, payload);
      } else {
        await api.createSponsor(payload);
      }
      setShowForm(false);
      await loadSponsors();
    } catch (err: any) {
      setError(err.message || 'Failed to save sponsor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Sponsor) => {
    requestConfirmation({
      title: 'Supprimer ce partenaire ?',
      message: `« ${s.name} » sera retiré définitivement.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await api.deleteSponsor(s._id);
          await loadSponsors();
        } catch (err: any) {
          setError(err.message || 'Failed to delete sponsor');
        }
      },
    });
  };

  const totalImpressions = sponsors.reduce((sum, s) => sum + (s.metrics?.impressions || 0), 0);
  const totalClicks = sponsors.reduce((sum, s) => sum + (s.metrics?.clicks || 0), 0);
  const avgCtr = sponsors.length ? (sponsors.reduce((sum, s) => sum + (s.metrics?.ctr || 0), 0) / sponsors.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partenaires & Sponsors"
        description="Gérez les sponsors officiels du club, les logos haute définition, les catégories et la visibilité."
        actions={
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={14} /> Nouveau Sponsor
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sponsors Actifs" value={sponsors.length} icon={Handshake} accent="blue" />
        <StatCard label="Impressions Totales" value={totalImpressions.toLocaleString()} icon={Eye} accent="slate" />
        <StatCard label="Clics Totaux" value={totalClicks.toLocaleString()} icon={MousePointerClick} accent="emerald" />
        <StatCard label="CTR Moyen" value={`${avgCtr}%`} icon={Percent} accent="amber" />
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 w-fit">
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'sponsors' ? 'bg-white shadow-sm text-usm-blue-primary' : 'text-slate-500'
          }`}
        >
          Sponsors ({sponsors.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'leads' ? 'bg-white shadow-sm text-usm-blue-primary' : 'text-slate-500'
          }`}
        >
          <Mail size={13} /> Demandes de partenariat
          {leads.filter((l) => l.status === 'new').length > 0 && (
            <span className="bg-usm-blue-primary text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
              {leads.filter((l) => l.status === 'new').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'leads' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Objectif</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadsLoading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucune demande pour le moment.</td></tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors align-top">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{lead.company}</td>
                      <td className="py-2.5 px-4 text-slate-600">{lead.contactName}<br /><span className="text-slate-400">{lead.email}</span></td>
                      <td className="py-2.5 px-4 text-slate-600">{lead.objective}</td>
                      <td className="py-2.5 px-4 text-slate-500 max-w-xs">{lead.message}</td>
                      <td className="py-2.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => setLeadStatus(lead, e.target.value as PartnerLead['status'])}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase rounded-lg px-2 py-1 outline-none focus:border-usm-blue-primary cursor-pointer"
                        >
                          <option value="new">Nouveau</option>
                          <option value="contacted">Contacté</option>
                          <option value="closed">Clos</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Logo</th>
                  <th className="py-3 px-4">Sponsor</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Discipline</th>
                  <th className="py-3 px-4 text-center">Accueil</th>
                  <th className="py-3 px-4 text-center">Ordre</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      <Loader2 size={20} className="animate-spin inline-block" />
                    </td>
                  </tr>
                ) : sponsors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Aucun sponsor enregistré.
                    </td>
                  </tr>
                ) : (
                  sponsors.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="h-10 w-24 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-1.5">
                          {s.logo ? (
                            <img src={s.logo} alt={s.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Logo manquant</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">slug: {s.slug}</span>
                            {s.sourceType === 'PDF_IMPORT' && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                                PDF p.{s.sourcePage || 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-usm-blue-primary/10 text-usm-blue-primary">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-medium">
                        {SPORT_SCOPES.find((sc) => sc.value === s.sportScope)?.label || 'Club'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {s.showOnHomepage !== false ? (
                          <span className="text-emerald-600 font-bold text-[10px]">Oui</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Non</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">
                        {s.displayOrder || 0}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {s.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} /> Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            <XCircle size={11} /> Inactif
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                          <button
                            onClick={() => openEditForm(s)}
                            className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Modifier le Partenaire' : 'Créer un Partenaire'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom du Sponsor *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Slug (Identifiant)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="Auto-généré si vide"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SponsorCategory }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary cursor-pointer"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Périmètre Sportif</label>
                  <select
                    value={form.sportScope}
                    onChange={(e) => setForm((f) => ({ ...f, sportScope: e.target.value as SportScope }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary cursor-pointer"
                  >
                    {SPORT_SCOPES.map((sc) => <option key={sc.value} value={sc.value}>{sc.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Logo Uploads */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Logo Principal (Fond Clair) *</label>
                <MediaUploader
                  compact
                  folder="sponsors"
                  currentUrl={form.logo}
                  onUpload={(file) => setForm((f) => ({ ...f, logo: file.url, primaryLogo: file.url }))}
                  onRemove={() => setForm((f) => ({ ...f, logo: '', primaryLogo: '' }))}
                  onUploadingChange={setLogoUploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Logo Variante Sombre / Monochrome</label>
                  <input
                    type="text"
                    value={form.darkLogo}
                    onChange={(e) => setForm((f) => ({ ...f, darkLogo: e.target.value }))}
                    placeholder="/sponsors/slug/logo-dark.webp"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Histoire / Description du partenariat</label>
                <textarea
                  rows={2}
                  value={form.story}
                  onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
                  placeholder="Partenaire officiel engagé aux côtés de l’Union Sportive Monastirienne."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Site Web officiel</label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="https://www.biat.com.tn"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded text-usm-blue-primary focus:ring-0"
                  />
                  <span>Actif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.showOnHomepage}
                    onChange={(e) => setForm((f) => ({ ...f, showOnHomepage: e.target.checked }))}
                    className="rounded text-usm-blue-primary focus:ring-0"
                  />
                  <span>Afficher Accueil</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                    className="rounded text-usm-blue-primary focus:ring-0"
                  />
                  <span>Mis en avant</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving || logoUploading}
                className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:bg-slate-300 text-white text-xs font-black uppercase rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors mt-2"
              >
                {logoUploading ? 'Téléchargement de l’image…' : saving ? 'Enregistrement…' : editingId ? 'Enregistrer les Modifications' : 'Créer le Sponsor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
