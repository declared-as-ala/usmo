'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/i18n';
import { Trophy, Shield, Users, ArrowRight, Star, Flame, Sparkles } from 'lucide-react';

interface BasketballTeamRow {
  position: number;
  team: string;
  badge: string | null;
  played: number;
  won: number;
  lost: number;
  points: number;
  isUSM: boolean;
}

const BASKETBALL_STANDINGS_2026: BasketballTeamRow[] = [
  { position: 1, team: 'US Monastir', badge: '/logo basket.png', played: 0, won: 0, lost: 0, points: 0, isUSM: true },
  { position: 2, team: 'Club Africain', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
  { position: 3, team: 'Étoile du Sahel', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
  { position: 4, team: 'JS Kairouan', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
  { position: 5, team: 'US Ansar', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
  { position: 6, team: 'DS Grombalia', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
  { position: 7, team: 'Stade Nabeulien', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
  { position: 8, team: 'ES Radès', badge: null, played: 0, won: 0, lost: 0, points: 0, isUSM: false },
];

export const BasketballStandingsView: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="min-h-screen bg-white text-usm-blue-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Cinematic Basketball Header Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-usm-border p-8 sm:p-12 bg-gradient-to-r from-amber-500/10 via-white to-usm-blue-soft shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-[0.55] contrast-120 pointer-events-none opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=1200&q=80')` }}
          />
          <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-amber-500/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
            <div className="text-center md:text-left rtl:text-right">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-600 flex items-center justify-center md:justify-start gap-1.5 mb-2">
                <Trophy size={14} className="text-amber-500 fill-amber-500" />
                {tr(language, 'Tunisian Pro A • Champions BAL 2022', 'Championnat Pro A • Champions BAL 2022', 'البطولة المحترفة لكرة السلة • بطل إفريقيا BAL 2022')}
              </span>
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-wider text-usm-blue-dark">
                  {tr(language, 'Basketball Standings', 'Classement Basketball', 'ترتيب بطولة كرة السلة')}
                </h1>
                <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full tracking-wider shadow">
                  Saison 2026 / 2027
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-xl mt-3 leading-relaxed">
                {tr(
                  language,
                  'Official standings for the 2026-2027 Tunisian Pro A Basketball League. US Monastir enters the season as defending champions.',
                  'Classement officiel de la Ligue Pro A de Basketball (Saison 2026-2027). L\'US Monastir aborde la compétition en tant que tenant du titre.',
                  'الترتيب الرسمي للبطولة الوطنية المحترفة لكرة السلة 2026-2027. يدخل الاتحاد المنستيري الموسم كبطل للمسابقة.'
                )}
              </p>
            </div>

            {/* Trophies Summary Card */}
            <div className="flex items-center gap-4 bg-white/80 border border-amber-500/30 px-6 py-4 rounded-2xl shadow-lg backdrop-blur">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
                <Flame size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 font-mono font-black text-lg text-usm-blue-dark">
                  <span>9x Pro A</span>
                  <span className="text-amber-500">•</span>
                  <span>1x BAL</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  {tr(language, 'National & Continental Titles', 'Titres Nationaux & Continentaux', 'الألقاب الوطنية والقارية')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pro A Standings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wider text-usm-blue-dark flex items-center gap-2">
              <Shield size={18} className="text-usm-blue-primary" />
              {tr(language, 'Pro A Tunisia Standings (2026–2027)', 'Classement Pro A Tunisie (2026–2027)', 'جدول ترتيب البطولة المحترفة (2026-2027)')}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-usm-blue-soft border border-usm-border text-slate-500 px-3 py-1 rounded-full">
              Pre-season • 0 Matchs
            </span>
          </div>

          <div className="bg-white border border-usm-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-600 text-left rtl:text-right">
                <thead className="bg-usm-blue-soft font-bold text-usm-blue-dark text-[10px] uppercase tracking-wider border-b border-usm-border">
                  <tr>
                    <th className="px-5 py-3.5 text-center w-16">Position</th>
                    <th className="px-5 py-3.5">Club</th>
                    <th className="px-5 py-3.5 text-center">Joués (J)</th>
                    <th className="px-5 py-3.5 text-center">Victoires (V)</th>
                    <th className="px-5 py-3.5 text-center">Défaites (D)</th>
                    <th className="px-5 py-3.5 text-center font-black text-usm-blue-primary">Points (PTS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {BASKETBALL_STANDINGS_2026.map((row) => (
                    <tr
                      key={row.team}
                      className={
                        row.isUSM
                          ? 'bg-amber-500/10 border-l-4 border-amber-500 text-usm-blue-dark font-bold hover:bg-amber-500/15 transition-colors'
                          : 'hover:bg-slate-50 transition-colors'
                      }
                    >
                      <td className="px-5 py-4 text-center font-mono font-black text-sm">
                        {row.isUSM ? (
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-500 text-white font-mono text-xs font-black shadow-md">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-400">{row.position}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 flex items-center space-x-3 rtl:space-x-reverse">
                        {row.isUSM ? (
                          <img src="/logo basket.png" alt="USM Basket" className="h-7 w-7 object-contain drop-shadow" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {row.team.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-bold text-usm-blue-dark flex items-center gap-2">
                          {row.team}
                          {row.isUSM && (
                            <span className="bg-amber-500/20 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/30">
                              Tenant du Titre
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-mono">{row.played}</td>
                      <td className="px-5 py-4 text-center font-mono text-emerald-600 font-bold">{row.won}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-400">{row.lost}</td>
                      <td className="px-5 py-4 text-center font-mono font-black text-sm text-usm-blue-primary">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Staff & Information Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-usm-blue-soft/50 border border-usm-border p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-usm-blue-dark">
                {tr(language, 'Technical Staff & Management', 'Staff Technique & Direction', 'الطاقم الفني والإداري')}
              </h4>
              <p className="text-[11px] text-slate-500">
                {tr(language, 'Head Coach: Miodrag Perišić', 'Entraîneur Principal: Miodrag Perišić', 'المدرب الأول: ميودراغ بيريسيتش')}
              </p>
            </div>
          </div>
          <Link
            href="/basketball/staff"
            className="inline-flex items-center gap-2 rounded-full border border-usm-border bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-usm-blue-dark shadow-sm hover:border-usm-blue-primary hover:text-usm-blue-primary transition-colors shrink-0"
          >
            <Users size={14} />
            {tr(language, 'View Technical Staff', 'Voir le Staff Technique', 'مشاهدة الطاقم الفني')}
            <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        </div>

      </div>
    </div>
  );
};
