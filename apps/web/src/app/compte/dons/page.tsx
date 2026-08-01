'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api-client';
import { Heart, Calendar, EyeOff, CheckCircle2, ShieldAlert, Loader2, Link as LinkIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MyDonationsPage() {
  const { language, fan } = useApp();

  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDonations = async () => {
    try {
      const data = await api.getMyDonations();
      setDonations(data || []);
    } catch (err) {
      console.error('Error fetching my donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const completedDonations = donations.filter(d => d.paymentStatus === 'completed');
  const totalDonated = completedDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Heart size={18} className="fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mes Dons & Soutiens</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Retrouvez votre historique de contribution financière au club.</p>
          </div>
        </div>

        <div className="bg-white border border-usm-border px-4 py-2 rounded-xl text-center shrink-0 min-w-32">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Total Donné</span>
          <span className="text-lg font-mono font-black text-usm-blue-primary">{totalDonated} TND</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement de votre historique...</span>
        </div>
      ) : donations.length > 0 ? (
        <div className="bg-usm-blue-soft0 border border-usm-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-usm-border text-slate-500 font-bold uppercase text-[9px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Visibilité</th>
                  <th className="py-3 px-4">Référence de paiement</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-usm-blue-hover/[0.02] transition-colors text-slate-600">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-usm-blue-dark">
                      {d.amount} {d.currency || 'TND'}
                    </td>
                    <td className="py-3 px-4">
                      {d.visibility === 'anonymous' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase">
                          <EyeOff size={10} /> Anonyme
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase">
                          Public
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {d.paymentReference || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {d.paymentStatus === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase font-bold">
                          Confirmé
                        </span>
                      ) : d.paymentStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md uppercase font-bold">
                          En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md uppercase font-bold">
                          Échoué
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <Heart size={16} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-usm-blue-dark">Aucun don enregistré</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Soutenez votre club favori en faisant un don direct sécurisé.</p>
          </div>
          <Link
            href="/don"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors"
          >
            Faire un premier don
          </Link>
        </div>
      )}
    </div>
  );
}
