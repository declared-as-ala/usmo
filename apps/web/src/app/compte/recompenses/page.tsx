'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { Gift, Loader2, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Reward {
  _id: string;
  title: string;
  description: string;
  pointsCost: number;
  stock: number | null;
}

interface Redemption {
  _id: string;
  rewardTitle: string;
  pointsSpent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: 'En attente', className: 'bg-amber-500/20 text-amber-500', icon: Clock },
  fulfilled: { label: 'Remise', className: 'bg-emerald-500/20 text-emerald-500', icon: CheckCircle2 },
  cancelled: { label: 'Annulée', className: 'bg-red-500/20 text-red-500', icon: XCircle },
};

export default function MyRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getRewards(),
      api.getMyRewardRedemptions(),
      api.getMyPointsHistory(),
    ])
      .then(([rewardsData, redemptionsData, history]) => {
        if (!active) return;
        setRewards(Array.isArray(rewardsData) ? rewardsData : []);
        setRedemptions(Array.isArray(redemptionsData) ? redemptionsData : []);
        const total = (Array.isArray(history) ? history : []).reduce((sum: number, h: any) => sum + h.points, 0);
        setBalance(total);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleRedeem = async (id: string) => {
    setError(null);
    setRedeemingId(id);
    try {
      await api.redeemReward(id);
      const [rewardsData, redemptionsData, history] = await Promise.all([
        api.getRewards(),
        api.getMyRewardRedemptions(),
        api.getMyPointsHistory(),
      ]);
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setRedemptions(Array.isArray(redemptionsData) ? redemptionsData : []);
      const total = (Array.isArray(history) ? history : []).reduce((sum: number, h: any) => sum + h.points, 0);
      setBalance(total);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'échanger cette récompense');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Gift size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Récompenses</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Échangez vos points bleus contre des récompenses exclusives.</p>
          </div>
        </div>
        <div className="bg-white border border-usm-border px-4 py-2 rounded-xl text-center shrink-0 min-w-32">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Solde disponible</span>
          <span className="text-lg font-mono font-black text-usm-blue-primary">{balance} pts</span>
        </div>
      </div>

      {error && (
        <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((r) => {
              const affordable = balance >= r.pointsCost;
              const outOfStock = r.stock != null && r.stock <= 0;
              return (
                <div key={r._id} className="usm-card border border-usm-border p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-black text-usm-blue-dark">{r.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{r.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-usm-blue-primary">
                      <Zap size={12} className="fill-current" /> {r.pointsCost} pts
                    </span>
                    <button
                      onClick={() => handleRedeem(r._id)}
                      disabled={!affordable || outOfStock || redeemingId === r._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-usm-blue-primary text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {redeemingId === r._id ? <Loader2 size={11} className="animate-spin" /> : null}
                      {outOfStock ? 'Épuisé' : 'Échanger'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {redemptions.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Historique d&apos;échanges</h4>
              {redemptions.map((r) => {
                const status = STATUS_LABEL[r.status];
                const StatusIcon = status.icon;
                return (
                  <div key={r._id} className="usm-card border border-usm-border p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-usm-blue-dark">{r.rewardTitle}</p>
                      <p className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString('fr-FR')} · {r.pointsSpent} pts</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${status.className}`}>
                      <StatusIcon size={10} /> {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
