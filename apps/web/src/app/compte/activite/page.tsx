'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { Activity, Loader2, Zap, Award } from 'lucide-react';

interface FeedItem {
  key: string;
  type: 'points' | 'badge';
  label: string;
  detail: string;
  date: string;
}

const REASON_LABEL: Record<string, string> = {
  vote_cast: 'Participation à un sondage',
  donation: 'Don confirmé',
  reward_redemption: 'Récompense échangée',
};

export default function MyActivityPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyPointsHistory(), api.getMyBadges()])
      .then(([points, badges]: [any[], any[]]) => {
        const pointsItems: FeedItem[] = (Array.isArray(points) ? points : []).map((p) => ({
          key: `points-${p._id}`,
          type: 'points',
          label: REASON_LABEL[p.reason] || p.reason,
          detail: `${p.points >= 0 ? '+' : ''}${p.points} pts`,
          date: p.createdAt,
        }));
        const badgeItems: FeedItem[] = (Array.isArray(badges) ? badges : [])
          .filter((b) => b.unlocked && b.unlockedAt)
          .map((b) => ({
            key: `badge-${b._id}`,
            type: 'badge',
            label: `Badge débloqué : ${b.name}`,
            detail: b.description,
            date: b.unlockedAt,
          }));
        const merged = [...pointsItems, ...badgeItems].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setFeed(merged);
      })
      .catch(() => setFeed([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
          <Activity size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mon Activité</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Chronologie de votre engagement avec le club.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : feed.length > 0 ? (
        <div className="relative space-y-0 ps-6 border-s-2 border-usm-border">
          {feed.map((item) => (
            <div key={item.key} className="relative pb-5">
              <span className={`absolute -start-[29px] top-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                item.type === 'badge' ? 'bg-usm-accent-gold' : 'bg-usm-blue-primary'
              }`}>
                {item.type === 'badge' ? <Award size={8} className="text-white" /> : <Zap size={8} className="text-white" />}
              </span>
              <p className="text-xs font-bold text-usm-blue-dark">{item.label}</p>
              <p className="text-[10px] text-slate-500">{item.detail}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-1">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <Activity size={16} />
          </div>
          <h4 className="text-xs font-bold text-usm-blue-dark">Aucune activité pour le moment</h4>
          <p className="text-[10px] text-slate-500">Votre engagement avec le club apparaîtra ici.</p>
        </div>
      )}
    </div>
  );
}
