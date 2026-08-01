'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { Zap, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface PointEntry {
  _id: string;
  points: number;
  reason: string;
  createdAt: string;
}

const REASON_LABEL: Record<string, string> = {
  vote_cast: 'Participation à un sondage',
  donation: 'Don confirmé',
  reward_redemption: 'Récompense échangée',
};

export default function MyPointsPage() {
  const [history, setHistory] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyPointsHistory()
      .then((data: any) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const total = history.reduce((sum, h) => sum + h.points, 0);

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Zap size={18} className="fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mes Points Bleus</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Cumulez des points en participant à la vie du club et échangez-les contre des récompenses.</p>
          </div>
        </div>
        <div className="bg-white border border-usm-border px-4 py-2 rounded-xl text-center shrink-0 min-w-32">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Solde actuel</span>
          <span className="text-lg font-mono font-black text-usm-blue-primary">{total} pts</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h._id} className="usm-card border border-usm-border p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {h.points >= 0 ? (
                  <TrendingUp size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <TrendingDown size={15} className="text-red-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-usm-blue-dark">{REASON_LABEL[h.reason] || h.reason}</p>
                  <p className="text-[10px] text-slate-500">{new Date(h.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <span className={`font-mono text-xs font-black ${h.points >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {h.points >= 0 ? '+' : ''}{h.points} pts
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-1">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <Zap size={16} />
          </div>
          <h4 className="text-xs font-bold text-usm-blue-dark">Aucun point pour le moment</h4>
          <p className="text-[10px] text-slate-500">Votez, soutenez le club et participez pour gagner vos premiers points.</p>
        </div>
      )}
    </div>
  );
}
