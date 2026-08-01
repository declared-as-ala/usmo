'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';
import { Vote, LogIn } from 'lucide-react';

interface PollOption { key: string; label: string; }
interface ActivePoll {
  _id: string; title: string; options: PollOption[];
  results: Record<string, number>; totalVotes: number;
}

export const PublicPollWidget: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useApp();
  const [poll, setPoll] = useState<ActivePoll | null | undefined>(undefined);

  useEffect(() => {
    api.getActiveVote().then((data) => setPoll(data)).catch(() => setPoll(null));
  }, []);

  if (!poll) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="usm-card rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-5">
          <Vote size={18} className="text-usm-blue-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-usm-blue-primary">Sondage des supporters</span>
        </div>
        <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-5">{poll.title}</h3>
        <div className="space-y-3">
          {poll.options.map((opt) => {
            const count = poll.results[opt.key] || 0;
            const pct = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
            return (
              <div key={opt.key} className="relative">
                <div className="flex items-center justify-between text-xs font-bold text-usm-blue-dark mb-1">
                  <span>{opt.label}</span>
                  <span className="text-usm-blue-primary">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-usm-blue-soft overflow-hidden">
                  <div className="h-full rounded-full bg-usm-blue-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-4">{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''} au total</p>
        {!isLoggedIn && (
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-5 inline-flex items-center gap-2 text-xs font-black text-usm-blue-primary uppercase tracking-wider hover:underline cursor-pointer"
          >
            <LogIn size={13} /> Connectez-vous pour voter
          </button>
        )}
      </div>
    </section>
  );
};
