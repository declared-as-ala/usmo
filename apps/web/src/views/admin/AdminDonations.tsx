'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { Heart, Download, FileSpreadsheet, Loader2, Calendar, Mail, EyeOff, ShieldCheck, CreditCard } from 'lucide-react';

export default function AdminDonations() {
  const { showToast } = useApp();

  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminDonations = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDonations();
      setDonations(data || []);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des donations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDonations();
  }, []);

  const handleExportCsv = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/admin/donations/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du fichier CSV.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_donations_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Export CSV réussi et journal d\'audit mis à jour.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Échec de l\'exportation CSV.', 'error');
    }
  };

  const completed = donations.filter(d => d.paymentStatus === 'completed');
  const pending = donations.filter(d => d.paymentStatus === 'pending');
  const totalFunds = completed.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen p-6 space-y-6">
      
      {/* Page Header */}
      <AdminPageHeader
        title="Journal des Donations & Mécénats"
        description="Gérez les contributions financières, inspectez les références bancaires, et téléchargez les journaux d'audit réglementaires."
        actions={
          <button
            onClick={handleExportCsv}
            disabled={donations.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            <Download size={14} /> Exporter le registre CSV
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Collecté" value={`${totalFunds.toLocaleString()} TND`} icon={Heart} accent="emerald" />
        <StatCard label="Dons Validés" value={completed.length} icon={ShieldCheck} accent="blue" />
        <StatCard label="Paiements en Attente" value={pending.length} icon={CreditCard} accent="amber" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={28} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement du grand livre...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900">Grand livre des transactions</h3>
            <span className="text-xs font-bold text-slate-500">{donations.length} transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Donateur</th>
                  <th className="py-3 px-4">Adresse Email</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Visibilité</th>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-1.5 text-slate-500">
                      <Calendar size={13} />
                      <span>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-950">
                      {d.donorName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      <span>{d.donorEmail}</span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-slate-900">
                      {d.amount} {d.currency || 'TND'}
                    </td>
                    <td className="py-3 px-4">
                      {d.visibility === 'anonymous' ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">
                          <EyeOff size={10} /> Anonyme
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase font-bold">
                          Public
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {d.paymentReference || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {d.paymentStatus === 'completed' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700">
                          confirmé
                        </span>
                      ) : d.paymentStatus === 'pending' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700">
                          en attente
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-700">
                          échoué
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
