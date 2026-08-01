'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { Shield, Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Search, X, Loader2, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type MembershipStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended' | 'rejected';

interface Membership {
  _id: string;
  userId: { _id: string; name: string; email: string };
  planId: { _id: string; name: string; price: number };
  status: MembershipStatus;
  startDate?: string;
  endDate?: string;
  proofFile?: string;
  internalNote?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<MembershipStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  active:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  expired:   'bg-slate-100 text-slate-600 border border-slate-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  suspended: 'bg-amber-100 text-amber-800 border border-amber-300',
  rejected:  'bg-red-50 text-red-700 border border-red-200',
};

export default function AdminMemberships() {
  const { showToast } = useApp();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | MembershipStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states for action details
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'renew' | 'suspend' | 'cancel' | null>(null);
  const [note, setNote] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const data = await api.getAdminMemberships(params);
      setMemberships(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des abonnements');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => loadMemberships(), 300);
    return () => clearTimeout(t);
  }, [loadMemberships]);

  const openActionModal = (membership: Membership, type: typeof actionType) => {
    setSelectedMembership(membership);
    setActionType(type);
    setNote('');
    setCustomEndDate('');
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership || !actionType) return;

    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        const payload: any = { note };
        if (customEndDate) payload.endDate = new Date(customEndDate).toISOString();
        await api.approveMembership(selectedMembership._id, payload);
        showToast('Abonnement approuvé et activé !', 'success');
      } else if (actionType === 'reject') {
        await api.rejectMembership(selectedMembership._id, { note });
        showToast('Demande d\'abonnement rejetée', 'info');
      } else if (actionType === 'renew') {
        await api.renewMembership(selectedMembership._id, { note });
        showToast('Renouvellement enregistré', 'success');
      } else if (actionType === 'suspend') {
        await api.suspendMembership(selectedMembership._id, { note });
        showToast('Abonnement suspendu', 'info');
      } else if (actionType === 'cancel') {
        await api.cancelMembership(selectedMembership._id, { note });
        showToast('Abonnement annulé', 'info');
      }
      setActionType(null);
      loadMemberships();
    } catch (err: any) {
      alert(err.message || 'Erreur de traitement de l\'action');
    } finally {
      setActionLoading(false);
    }
  };

  const countByStatus = (s: MembershipStatus) => memberships.filter((m) => m.status === s).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestion des Adhésions / Abonnements"
        description="Consultez et validez les demandes d'adhésion des supporters et gérez les comptes membres activement."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="En attente" value={countByStatus('pending')}   icon={Clock}         accent="amber"   />
        <StatCard label="Actifs"     value={countByStatus('active')}    icon={CheckCircle2}  accent="emerald" />
        <StatCard label="Expirés"    value={countByStatus('expired')}   icon={Shield}        accent="slate"   />
        <StatCard label="Suspendus"  value={countByStatus('suspended')} icon={AlertTriangle} accent="amber"   />
        <StatCard label="Annulés"    value={countByStatus('cancelled')} icon={XCircle}       accent="red"     />
        <StatCard label="Rejetés"    value={countByStatus('rejected')}  icon={XCircle}       accent="red"     />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'active', 'expired', 'suspended', 'cancelled', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                  statusFilter === s
                    ? 'bg-usm-blue-dark text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'Tous' : s}
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
                placeholder="Nom, email supporter..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/30 w-52"
              />
            </div>
            <button
              onClick={loadMemberships}
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
            <div className="p-10 text-center text-slate-400 text-sm animate-pulse">Chargement des abonnements...</div>
          )}

          {!loading && !error && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Supporter</th>
                  <th className="py-3 px-4">Plan / Offre</th>
                  <th className="py-3 px-4">Date de début</th>
                  <th className="py-3 px-4">Date d'expiration</th>
                  <th className="py-3 px-4">Date demande</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberships.map((membership) => (
                  <tr key={membership._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{membership.userId?.name || 'Supporter'}</p>
                      <p className="text-[10px] text-slate-400">{membership.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{membership.planId?.name || 'Inconnu'}</p>
                      <p className="text-[10px] text-slate-400">
                        {membership.planId?.price ? `${Math.round(membership.planId.price / 1000)} TND` : 'Gratuit'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {membership.startDate ? new Date(membership.startDate).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-bold">
                      {membership.endDate ? new Date(membership.endDate).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(membership.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${STATUS_STYLES[membership.status]}`}>
                        {membership.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {membership.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(membership, 'approve')}
                              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-500 border border-emerald-200 text-emerald-700 hover:text-white rounded font-bold cursor-pointer transition-all text-[10px] uppercase"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => openActionModal(membership, 'reject')}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-500 border border-red-200 text-red-600 hover:text-white rounded font-bold cursor-pointer transition-all text-[10px] uppercase"
                            >
                              Rejeter
                            </button>
                          </>
                        )}

                        {membership.status === 'active' && (
                          <>
                            <button
                              onClick={() => openActionModal(membership, 'suspend')}
                              className="px-2 py-1.5 bg-amber-50 hover:bg-amber-500 border border-amber-200 text-amber-700 hover:text-white rounded font-bold cursor-pointer transition-all text-[10px] uppercase"
                            >
                              Suspendre
                            </button>
                            <button
                              onClick={() => openActionModal(membership, 'cancel')}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-500 border border-red-200 text-red-600 hover:text-white rounded font-bold cursor-pointer transition-all text-[10px] uppercase"
                            >
                              Annuler
                            </button>
                          </>
                        )}

                        {(membership.status === 'expired' || membership.status === 'cancelled' || membership.status === 'rejected') && (
                          <button
                            onClick={() => openActionModal(membership, 'renew')}
                            className="px-2 py-1.5 bg-sky-50 hover:bg-sky-500 border border-sky-200 text-sky-700 hover:text-white rounded font-bold cursor-pointer transition-all text-[10px] uppercase"
                          >
                            Renouveler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {memberships.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      Aucune adhésion trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Dialog Modal */}
      {actionType && selectedMembership && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
            <button
              onClick={() => setActionType(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              {actionType === 'approve' && 'Approuver l\'Abonnement'}
              {actionType === 'reject' && 'Rejeter l\'Abonnement'}
              {actionType === 'renew' && 'Renouveler l\'Abonnement'}
              {actionType === 'suspend' && 'Suspendre l\'Abonnement'}
              {actionType === 'cancel' && 'Annuler l\'Abonnement'}
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              Supporter : <span className="font-bold text-slate-800">{selectedMembership.userId?.name}</span> ({selectedMembership.userId?.email})
              <br />
              Offre : <span className="font-bold text-slate-800">{selectedMembership.planId?.name}</span>
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              {actionType === 'approve' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Date d'expiration personnalisée (Laissez vide pour la durée par défaut)
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Note / Raison (Interne)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                  placeholder="Note administrative..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded-lg cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 py-2.5 text-white font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${
                    actionType === 'reject' || actionType === 'cancel'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-usm-blue-primary hover:bg-usm-blue-primary/95'
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
