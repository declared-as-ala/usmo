'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { SponsorLogo } from '../../components/Common/SponsorLogo';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { api } from '../../lib/api-client';
import { Plus, X, Trash2, Pencil, Handshake, Eye, MousePointerClick, Percent, Loader2, Mail } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface PartnerLead {
  _id: string; company: string; contactName: string; email: string; phone: string;
  objective: string; message: string; status: 'new' | 'contacted' | 'closed'; createdAt: string;
}

type SponsorCategory = 'Main' | 'Official' | 'Technical' | 'Media' | 'Academy';

interface Sponsor {
  _id: string;
  name: string;
  category: SponsorCategory;
  logo: string;
  story: string;
  storyFr: string;
  storyAr: string;
  offer?: string;
  offerFr: string;
  offerAr: string;
  link: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

const CATEGORIES: SponsorCategory[] = ['Main', 'Official', 'Technical', 'Media', 'Academy'];

const emptyForm = {
  name: '',
  category: 'Official' as SponsorCategory,
  logo: '',
  story: '',
  link: '',
  offer: '',
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
      const data = await api.getSponsors();
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
    setForm({ name: s.name, category: s.category, logo: s.logo, story: s.story, link: s.link, offer: s.offer ?? '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.story) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.updateSponsor(editingId, {
          name: form.name,
          category: form.category,
          logo: form.logo,
          story: form.story,
          storyFr: form.story,
          storyAr: form.story,
          offer: form.offer || undefined,
          link: form.link,
        });
      } else {
        await api.createSponsor({
          name: form.name,
          category: form.category,
          logo: form.logo,
          story: form.story,
          storyFr: form.story,
          storyAr: form.story,
          offer: form.offer || undefined,
          offerAr: form.offer || '',
          link: form.link,
        });
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
    requestConfirmation({ title: 'Supprimer ce partenaire ?', message: `« ${s.name} » sera retiré définitivement.`, confirmLabel: 'Supprimer', onConfirm: async () => {
    try {
      await api.deleteSponsor(s._id);
      await loadSponsors();
    } catch (err: any) {
      setError(err.message || 'Failed to delete sponsor');
    }}});
  };

  const totalImpressions = sponsors.reduce((sum, s) => sum + s.metrics.impressions, 0);
  const totalClicks = sponsors.reduce((sum, s) => sum + s.metrics.clicks, 0);
  const avgCtr = sponsors.length ? (sponsors.reduce((sum, s) => sum + s.metrics.ctr, 0) / sponsors.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sponsors"
        description="Manage partner logos, stories, offers, and track impressions/clicks across the site."
        actions={
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={14} /> Create Sponsor
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Sponsors" value={sponsors.length} icon={Handshake} accent="blue" />
        <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon={Eye} accent="slate" />
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} accent="emerald" />
        <StatCard label="Average CTR" value={`${avgCtr}%`} icon={Percent} accent="amber" />
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 w-fit">
        <button onClick={() => setActiveTab('sponsors')} className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${activeTab === 'sponsors' ? 'bg-white shadow-sm text-usm-blue-primary' : 'text-slate-500'}`}>Sponsors</button>
        <button onClick={() => setActiveTab('leads')} className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${activeTab === 'leads' ? 'bg-white shadow-sm text-usm-blue-primary' : 'text-slate-500'}`}>
          <Mail size={13} /> Demandes de partenariat
          {leads.filter((l) => l.status === 'new').length > 0 && (
            <span className="bg-usm-blue-primary text-white text-[9px] font-black rounded-full px-1.5 py-0.5">{leads.filter((l) => l.status === 'new').length}</span>
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
                        <select value={lead.status} onChange={(e) => setLeadStatus(lead, e.target.value as PartnerLead['status'])} className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase rounded-lg px-2 py-1 outline-none focus:border-usm-blue-primary cursor-pointer">
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
                <th className="py-3 px-4">Sponsor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Impressions</th>
                <th className="py-3 px-4">Clicks</th>
                <th className="py-3 px-4">CTR</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Loader2 size={20} className="animate-spin inline-block" />
                  </td>
                </tr>
              ) : sponsors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No sponsors yet.
                  </td>
                </tr>
              ) : (
                sponsors.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <SponsorLogo name={s.name} logo={s.logo} size={28} variant="dark" />
                        <span className="font-bold text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{s.category}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{s.metrics.impressions.toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{s.metrics.clicks.toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{s.metrics.ctr}%</td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button
                          onClick={() => openEditForm(s)}
                          className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
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
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Edit Sponsor' : 'Create Sponsor'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sponsor Name *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SponsorCategory }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Logo</label>
                <MediaUploader
                  compact
                  folder="sponsors"
                  currentUrl={form.logo}
                  onUpload={(file) => setForm((f) => ({ ...f, logo: file.url }))}
                  onRemove={() => setForm((f) => ({ ...f, logo: '' }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Partnership Story *</label>
                <textarea required rows={2} value={form.story} onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fan Offer</label>
                <input type="text" value={form.offer} onChange={(e) => setForm((f) => ({ ...f, offer: e.target.value }))} placeholder="e.g. 10% off for USM members" className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Website</label>
                <input type="text" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:bg-slate-300 text-white text-xs font-black uppercase rounded-lg cursor-pointer disabled:cursor-not-allowed transition-colors mt-2"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Sponsor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
