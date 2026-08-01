'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { Award, Gift, Plus, X, Trash2, Pencil, Loader2, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface Badge {
  _id: string; key: string; name: string; nameAr: string; description: string; descriptionAr: string;
  icon: string; displayOrder: number; isActive: boolean;
}
interface Reward {
  _id: string; title: string; titleAr: string; description: string; descriptionAr: string;
  pointsCost: number; stock: number | null; displayOrder: number; isActive: boolean;
}
interface Redemption {
  _id: string; rewardTitle: string; pointsSpent: number; status: 'pending' | 'fulfilled' | 'cancelled';
  createdAt: string; userId?: { name?: string; email?: string };
}

const emptyBadgeForm = { key: '', name: '', nameAr: '', description: '', descriptionAr: '', icon: 'Award', displayOrder: 0, isActive: true };
const emptyRewardForm = { title: '', titleAr: '', description: '', descriptionAr: '', pointsCost: 100, stock: null as number | null, displayOrder: 0, isActive: true };

type Tab = 'badges' | 'rewards' | 'redemptions';

export default function AdminLoyalty() {
  const [tab, setTab] = useState<Tab>('badges');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [badgeForm, setBadgeForm] = useState(emptyBadgeForm);

  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, r, red] = await Promise.all([api.getAdminBadges(), api.getAdminRewards(), api.getAdminRewardRedemptions()]);
      setBadges(Array.isArray(b) ? b : []);
      setRewards(Array.isArray(r) ? r : []);
      setRedemptions(Array.isArray(red) ? red : []);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAddBadge = () => { setEditingBadgeId(null); setBadgeForm(emptyBadgeForm); setShowBadgeForm(true); };
  const openEditBadge = (b: Badge) => { setEditingBadgeId(b._id); setBadgeForm(b); setShowBadgeForm(true); };
  const submitBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBadgeId) await api.updateBadge(editingBadgeId, badgeForm);
    else await api.createBadge(badgeForm);
    setShowBadgeForm(false);
    load();
  };
  const deleteBadge = (b: Badge) => {
    requestConfirmation({
      title: 'Supprimer ce badge ?', message: `« ${b.name} » sera retiré du catalogue.`, confirmLabel: 'Supprimer',
      onConfirm: async () => { await api.deleteBadge(b._id); load(); },
    });
  };

  const openAddReward = () => { setEditingRewardId(null); setRewardForm(emptyRewardForm); setShowRewardForm(true); };
  const openEditReward = (r: Reward) => { setEditingRewardId(r._id); setRewardForm(r); setShowRewardForm(true); };
  const submitReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRewardId) await api.updateReward(editingRewardId, rewardForm);
    else await api.createReward(rewardForm);
    setShowRewardForm(false);
    load();
  };
  const deleteReward = (r: Reward) => {
    requestConfirmation({
      title: 'Supprimer cette récompense ?', message: `« ${r.title} » sera retirée du catalogue.`, confirmLabel: 'Supprimer',
      onConfirm: async () => { await api.deleteReward(r._id); load(); },
    });
  };

  const handleRedemptionStatus = async (id: string, status: 'fulfilled' | 'cancelled') => {
    await api.updateRedemptionStatus(id, status);
    load();
  };

  const pendingCount = redemptions.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Fidélité & Récompenses" description="Gérez les badges, les récompenses et les échanges de points." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Badges" value={badges.length} icon={Award} accent="blue" />
        <StatCard label="Récompenses" value={rewards.length} icon={Gift} accent="emerald" />
        <StatCard label="Échanges en attente" value={pendingCount} icon={Zap} accent="amber" />
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        {(['badges', 'rewards', 'redemptions'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              tab === t ? 'border-usm-blue-primary text-usm-blue-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'badges' ? 'Badges' : t === 'rewards' ? 'Récompenses' : 'Échanges'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 size={20} className="animate-spin inline-block text-usm-blue-primary" /></div>
      ) : tab === 'badges' ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openAddBadge} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
              <Plus size={14} /> Ajouter un badge
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Clé</th><th className="py-3 px-4">Nom</th><th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {badges.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{b.key}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{b.name}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {b.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditBadge(b)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer"><Pencil size={13} /></button>
                        <button onClick={() => deleteBadge(b)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'rewards' ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openAddReward} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
              <Plus size={14} /> Ajouter une récompense
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Titre</th><th className="py-3 px-4">Coût</th><th className="py-3 px-4">Stock</th><th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rewards.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{r.title}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{r.pointsCost} pts</td>
                    <td className="py-2.5 px-4 text-slate-600">{r.stock == null ? 'Illimité' : r.stock}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {r.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditReward(r)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer"><Pencil size={13} /></button>
                        <button onClick={() => deleteReward(r)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Fan</th><th className="py-3 px-4">Récompense</th><th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Statut</th><th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {redemptions.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucun échange pour le moment.</td></tr>
              ) : redemptions.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 text-slate-600">{r.userId?.name || r.userId?.email || '-'}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{r.rewardTitle}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">{r.pointsSpent} pts</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-700' : r.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {r.status === 'fulfilled' ? 'Remise' : r.status === 'cancelled' ? 'Annulée' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right rtl:text-left">
                    {r.status === 'pending' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleRedemptionStatus(r._id, 'fulfilled')} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"><CheckCircle2 size={14} /></button>
                        <button onClick={() => handleRedemptionStatus(r._id, 'cancelled')} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"><XCircle size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showBadgeForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBadgeForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingBadgeId ? 'Modifier le badge' : 'Ajouter un badge'}</h3>
              <button onClick={() => setShowBadgeForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={submitBadge} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clé (unique) *</label><input required disabled={!!editingBadgeId} value={badgeForm.key} onChange={(e) => setBadgeForm((f) => ({ ...f, key: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary disabled:opacity-50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom (FR) *</label><input required value={badgeForm.name} onChange={(e) => setBadgeForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom (AR) *</label><input required dir="rtl" value={badgeForm.nameAr} onChange={(e) => setBadgeForm((f) => ({ ...f, nameAr: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
              </div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description (FR) *</label><textarea required rows={2} value={badgeForm.description} onChange={(e) => setBadgeForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description (AR) *</label><textarea required dir="rtl" rows={2} value={badgeForm.descriptionAr} onChange={(e) => setBadgeForm((f) => ({ ...f, descriptionAr: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Icône (lucide)</label><input value={badgeForm.icon} onChange={(e) => setBadgeForm((f) => ({ ...f, icon: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre</label><input type="number" value={badgeForm.displayOrder} onChange={(e) => setBadgeForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2">
                {editingBadgeId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRewardForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRewardForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingRewardId ? 'Modifier la récompense' : 'Ajouter une récompense'}</h3>
              <button onClick={() => setShowRewardForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={submitReward} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre (FR) *</label><input required value={rewardForm.title} onChange={(e) => setRewardForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre (AR) *</label><input required dir="rtl" value={rewardForm.titleAr} onChange={(e) => setRewardForm((f) => ({ ...f, titleAr: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
              </div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description (FR) *</label><textarea required rows={2} value={rewardForm.description} onChange={(e) => setRewardForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description (AR) *</label><textarea required dir="rtl" rows={2} value={rewardForm.descriptionAr} onChange={(e) => setRewardForm((f) => ({ ...f, descriptionAr: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Coût (points) *</label><input required type="number" value={rewardForm.pointsCost} onChange={(e) => setRewardForm((f) => ({ ...f, pointsCost: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stock (vide = illimité)</label><input type="number" value={rewardForm.stock ?? ''} onChange={(e) => setRewardForm((f) => ({ ...f, stock: e.target.value === '' ? null : Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" /></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2">
                {editingRewardId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
