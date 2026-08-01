'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import {
  Award, Sparkles, Vote, ShoppingBag, Heart, IdCard, Loader2, Lock, CheckCircle2,
} from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  Award, Sparkles, Vote, ShoppingBag, Heart, IdCard,
};

interface BadgeEntry {
  _id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export default function MyBadgesPage() {
  const [badges, setBadges] = useState<BadgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyBadges()
      .then((data: any) => setBadges(Array.isArray(data) ? data : []))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mes Badges</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Distinctions débloquées en soutenant et suivant le club.</p>
          </div>
        </div>
        <div className="bg-white border border-usm-border px-4 py-2 rounded-xl text-center shrink-0 min-w-24">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Débloqués</span>
          <span className="text-lg font-mono font-black text-usm-blue-primary">{unlockedCount}/{badges.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((b) => {
            const Icon = ICONS[b.icon] || Award;
            return (
              <div
                key={b._id}
                className={`usm-card border p-4 text-center space-y-2 ${
                  b.unlocked ? 'border-usm-blue-primary/40 bg-usm-blue-soft' : 'border-usm-border opacity-60'
                }`}
              >
                <div className="relative inline-flex">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto ${
                    b.unlocked ? 'bg-usm-blue-primary text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  {b.unlocked ? (
                    <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full" />
                  ) : (
                    <Lock size={12} className="absolute -top-1 -right-1 text-slate-400 bg-white rounded-full p-0.5" />
                  )}
                </div>
                <p className="text-[11px] font-black text-usm-blue-dark">{b.name}</p>
                <p className="text-[9px] text-slate-500 leading-snug">{b.description}</p>
                {b.unlocked && b.unlockedAt && (
                  <p className="text-[8px] text-usm-blue-primary font-bold uppercase">
                    {new Date(b.unlockedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
