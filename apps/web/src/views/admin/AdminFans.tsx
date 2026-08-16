'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { Users, Loader2, X, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';
import { useApp } from '../../context/AppContext';

interface Fan {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  city?: string;
  phone?: string;
  createdAt: string;
}

interface FanDetail extends Fan {
  favoriteSport?: string;
  favoritePlayer?: string;
  membershipSummary?: { status?: string; planName?: string; endDate?: string } | null;
}

export default function AdminFans() {
  const { isSuperAdmin } = useApp();
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<FanDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFans(await api.getAdminFans({ search, status: statusFilter }));
    } catch {
      setFans([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const openDetail = async (fan: Fan) => {
    setDetailLoading(true);
    setSelected({ ...fan });
    try {
      const detail = await api.getAdminFanDetail(fan._id);
      setSelected(detail);
    } catch {
      // keep basic info
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = (fan: Fan) => {
    const nextStatus = fan.status === 'Active' ? 'Inactive' : 'Active';
    requestConfirmation({
      title: nextStatus === 'Inactive' ? 'Suspendre ce compte ?' : 'Réactiver ce compte ?',
      message: `${fan.name} ${nextStatus === 'Inactive' ? 'ne pourra plus se connecter.' : 'pourra à nouveau se connecter.'}`,
      confirmLabel: nextStatus === 'Inactive' ? 'Suspendre' : 'Réactiver',
      onConfirm: async () => {
        await api.updateAdminFanStatus(fan._id, nextStatus);
        setFans((prev) => prev.map((f) => (f._id === fan._id ? { ...f, status: nextStatus } : f)));
        if (selected?._id === fan._id) setSelected({ ...selected, status: nextStatus });
      },
    });
  };

  const activeCount = fans.filter((f) => f.status === 'Active').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Comptes Fans"
        description="Gérez les comptes des supporters inscrits sur la plateforme."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Comptes" value={fans.length} icon={Users} accent="blue" />
        <StatCard label="Actifs" value={activeCount} icon={ShieldCheck} accent="emerald" />
        <StatCard label="Suspendus" value={fans.length - activeCount} icon={ShieldOff} accent="amber" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full bg-white border border-slate-200 text-xs rounded-lg py-2.5 pl-9 pr-3 outline-none focus:border-usm-blue-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
        >
          <option value="">Tous les statuts</option>
          <option value="Active">Actif</option>
          <option value="Inactive">Suspendu</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Ville</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Inscription</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
              ) : fans.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Aucun compte trouvé.</td></tr>
              ) : (
                fans.map((fan) => (
                  <tr key={fan._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openDetail(fan)}>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{fan.name}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono">{fan.email}</td>
                    <td className="py-2.5 px-4 text-slate-600">{fan.city || '-'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${fan.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {fan.status === 'Active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{new Date(fan.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2.5 px-4 text-right rtl:text-left" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStatus(fan)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                          fan.status === 'Active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {fan.status === 'Active' ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              {detailLoading ? (
                <Loader2 size={18} className="animate-spin mx-auto text-usm-blue-primary" />
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Email</span><span className="font-mono">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Téléphone</span><span>{selected.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Ville</span><span>{selected.city || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Sport favori</span><span className="capitalize">{selected.favoriteSport || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Joueur favori</span><span>{selected.favoritePlayer || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Abonnement</span><span className="capitalize">{selected.membershipSummary?.status || 'Aucun'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[10px]">Inscription</span><span>{new Date(selected.createdAt).toLocaleDateString('fr-FR')}</span></div>

                  {isSuperAdmin && (
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          const role = prompt('Assigner quel rôle d\'administrateur ? (ex: BOUTIQUE_ADMIN, CONTENT_ADMIN, ADMIN)', 'ADMIN');
                          if (!role) return;
                          try {
                            await api.promoteUserToAdmin(selected._id, role, []);
                            alert(`${selected.name} a été promu au rôle ${role}.`);
                            setSelected(null);
                            load();
                          } catch (err: any) {
                            alert(err.message || 'Erreur lors de la promotion.');
                          }
                        }}
                        className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 cursor-pointer transition-colors"
                      >
                        Promouvoir en Administrateur (Super Admin Only)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
