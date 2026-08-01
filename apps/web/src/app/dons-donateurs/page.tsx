'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { Logo } from '../../components/Common/Logo';
import { Heart, Coins, Trophy, Calendar, MessageSquare, Loader2, ArrowRight, Sparkles, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DonateursPage() {
  const { language } = useApp();
  const router = useRouter();

  const [donations, setDonations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonationsData = async () => {
    try {
      const publicDons = await api.getPublicDonations();
      const board = await api.getDonationsLeaderboard();
      setDonations(publicDons || []);
      setLeaderboard(board || []);
    } catch (err) {
      console.error('Error fetching donations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationsData();
  }, []);

  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen relative overflow-hidden pt-24 lg:pt-28 pb-16">
      {/* Decorative Blur elements */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-usm-blue-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-usm-blue-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-usm-blue-primary/10 text-usm-blue-primary px-3.5 py-1.5 rounded-full border border-usm-blue-primary/20">
            <Heart size={10} className="fill-current animate-pulse" /> Union Sacrée
          </span>
          <h1 className="font-display italic font-black uppercase text-3xl sm:text-5xl text-usm-blue-dark leading-none">
            Mur des <span className="text-usm-blue-primary">Donateurs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Merci aux supporters officiels de l'US Monastir qui contribuent financièrement à la croissance et à la gloire de notre institution sportive.
          </p>
          
          <div className="pt-2">
            <button
              onClick={() => router.push('/don')}
              className="px-6 py-3 bg-gradient-to-r from-usm-blue-primary to-yellow-500 text-usm-blue-dark text-xs font-black uppercase tracking-wider rounded-xl hover:from-white hover:to-white transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              <Coins size={14} /> Faire une donation
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-usm-blue-soft0 border border-usm-border rounded-3xl">
            <Loader2 className="animate-spin text-usm-blue-primary mb-3" size={32} />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chargement des donations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Live Donation Feed */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="font-display font-black text-lg text-usm-blue-dark uppercase tracking-wider flex items-center gap-2">
                <span className="h-4 w-1 bg-usm-blue-primary rounded-full" />
                Dernières contributions
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
                {donations.map((d) => (
                  <div
                    key={d._id}
                    className="p-5 bg-white/80 border border-usm-border rounded-2xl flex items-start gap-4 hover:border-usm-blue-primary/20 transition-all"
                  >
                    <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/20 flex items-center justify-center text-usm-blue-light shrink-0">
                      <Heart size={16} className={d.donorName === 'Donateur Anonyme' ? 'opacity-40' : 'fill-current text-red-500'} />
                    </div>
                    
                    <div className="flex-grow min-w-0 leading-tight space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-usm-blue-dark uppercase truncate">
                          {d.donorName}
                        </h4>
                        <span className="font-mono text-xs font-black text-usm-blue-primary bg-usm-blue-primary/10 px-2.5 py-0.5 rounded border border-usm-blue-primary/20">
                          +{d.amount} {d.currency || 'TND'}
                        </span>
                      </div>

                      {d.message && (
                        <div className="p-3 bg-white/60 rounded-xl border border-usm-border flex items-start gap-2 italic text-xs text-slate-600">
                          <MessageSquare size={12} className="text-slate-500 shrink-0 mt-0.5" />
                          <p>&ldquo;{d.message}&rdquo;</p>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(d.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {donations.length === 0 && (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    Aucune donation enregistrée pour le moment.
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Global Leaderboard */}
            <div className="space-y-5">
              <h2 className="font-display font-black text-lg text-usm-blue-dark uppercase tracking-wider flex items-center gap-2">
                <span className="h-4 w-1 bg-usm-blue-primary rounded-full" />
                Top Supporters
              </h2>

              <div className="bg-white/80 border border-usm-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-usm-border pb-3">
                  <span className="text-[10px] font-black uppercase text-slate-500">Classement</span>
                  <span className="text-[10px] font-black uppercase text-slate-500">Total Donné</span>
                </div>

                <div className="space-y-2.5">
                  {leaderboard.map((user, idx) => {
                    const isGold = idx === 0;
                    const isSilver = idx === 1;
                    const isBronze = idx === 2;
                    return (
                      <div
                        key={user.userId}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isGold
                            ? 'border-usm-blue-primary/30 bg-usm-blue-primary/5'
                            : 'border-usm-border bg-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                              isGold
                                ? 'bg-usm-blue-primary text-white'
                                : isSilver
                                ? 'bg-slate-300 text-slate-800'
                                : isBronze
                                ? 'bg-amber-700 text-usm-blue-dark'
                                : 'text-slate-500 font-mono'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-usm-blue-dark truncate uppercase">
                            {user.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {user.totalAmount.toLocaleString()} TND
                        </span>
                      </div>
                    );
                  })}

                  {leaderboard.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      Aucune donation publique enregistrée.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
