'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api-client';
import { Heart, ArrowRight, Trophy } from 'lucide-react';

interface Donation {
  _id: string;
  amount: number;
  currency: string;
  donorName: string;
  message?: string;
  createdAt: string;
}

export const DonationHighlightWidget: React.FC = () => {
  const [donations, setDonations] = useState<Donation[] | null>(null);

  useEffect(() => {
    api.getPublicDonations().then((data: any) => setDonations(Array.isArray(data) ? data : [])).catch(() => setDonations([]));
  }, []);

  if (!donations || donations.length === 0) return null;

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const recent = donations.slice(0, 4);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="usm-card rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-usm-blue-primary fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-usm-blue-primary">Soutenez le club</span>
          </div>
          <div className="bg-usm-blue-soft border border-usm-border px-4 py-2 rounded-xl text-center shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Total collecté</span>
            <span className="text-lg font-mono font-black text-usm-blue-primary">{total.toLocaleString('fr-FR')} TND</span>
          </div>
        </div>

        <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase mb-5">Merci à nos donateurs</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {recent.map((d) => (
            <div key={d._id} className="flex items-center justify-between gap-3 bg-usm-blue-soft/60 border border-usm-border rounded-xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-usm-blue-dark truncate">{d.donorName}</p>
                {d.message && <p className="text-[10px] text-slate-500 truncate mt-0.5">&ldquo;{d.message}&rdquo;</p>}
              </div>
              <span className="font-mono text-xs font-black text-usm-blue-primary shrink-0">{d.amount} {d.currency}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/don"
            className="inline-flex items-center gap-2 px-5 py-3 bg-usm-blue-primary text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors"
          >
            <Heart size={14} /> Faire un don <ArrowRight size={14} />
          </Link>
          <Link
            href="/dons-donateurs"
            className="inline-flex items-center gap-2 px-5 py-3 bg-usm-blue-soft border border-usm-border text-usm-blue-dark text-xs font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover hover:text-white transition-colors"
          >
            <Trophy size={14} /> Classement des donateurs
          </Link>
        </div>
      </div>
    </section>
  );
};
