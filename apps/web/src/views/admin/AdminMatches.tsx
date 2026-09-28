'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { Match, MatchEvent } from '../../data/mockData';
import { api } from '../../lib/api-client';
import {
  Plus,
  X,
  Trash2,
  Radio,
  Send,
  AlertTriangle,
  Lock,
  RefreshCw,
  Pencil,
  ArrowLeftRight,
  Image as ImageIcon,
} from 'lucide-react';
import { MediaUploader } from '../../components/Admin/MediaUploader';

const STATUS_STYLES: Record<Match['status'], string> = {
  upcoming: 'bg-slate-100 text-slate-600',
  live: 'bg-red-50 text-red-600',
  finished: 'bg-emerald-50 text-emerald-700',
};

const DATA_SOURCE_STYLES: Record<string, string> = {
  MANUAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  HYBRID: 'bg-sky-50 text-sky-700 border-sky-200',
  EXTERNAL_API: 'bg-purple-50 text-purple-700 border-purple-200',
  sportsdb: 'bg-purple-50 text-purple-700 border-purple-200',
  manual: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const BASKETBALL_TUNISIAN_TEAMS = [
  { name: 'CSS Sfax', nameAr: 'النادي الرياضي صفاقس', venue: 'Salle Raed Béjaoui, Sfax', logo: '/teams/css.png' },
  { name: 'Étoile du Sahel', nameAr: 'النجم الرياضي الساحلي', venue: 'Salle Olympique de Sousse', logo: '/teams/ess.png' },
  { name: 'Club Africain', nameAr: 'النادي الإفريقي', venue: 'Salle Chérif Bellamine (Gorjani), Tunis', logo: '/teams/ca.png' },
  { name: 'JS Kairouan', nameAr: 'الجمعية الرياضية القيروانية', venue: 'Salle Aziz Miled, Kairouan', logo: '/teams/jsk.svg' },
  { name: 'ES Radès', nameAr: 'النجم الرادسي', venue: 'Salle Taoufik Bouhima, Radès', logo: '/teams/esg.svg' },
  { name: 'Stade Nabeulien', nameAr: 'الملعب النابلي', venue: 'Salle Bir Challouf, Nabeul', logo: '/teams/st.png' },
  { name: 'DS Grombalia', nameAr: 'الدالية الرياضية بقرمبالية', venue: 'Salle Omnisports de Grombalia', logo: '/teams/dsg.svg' },
  { name: 'US Ansar', nameAr: 'الاتحاد الرياضي الأنصاري', venue: 'Salle Dar Chaabane El Fehri', logo: '' },
  { name: 'Ezzahra Sports', nameAr: 'الزهراء الرياضية', venue: 'Salle Ezzahra', logo: '/teams/esz.png' },
  { name: 'JS Manazeh', nameAr: 'شبيبة المنازه', venue: 'Palais des Sports d\'El Menzah', logo: '/teams/jso.png' },
];

export const BASKETBALL_JOURNEES = [
  'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10',
  'J11', 'J12', 'J13', 'J14', 'J15', 'J16', 'J17', 'J18', 'J19', 'J20', 'J21', 'J22',
  'Play-off J1', 'Play-off J2', 'Play-off J3', 'Play-off J4', 'Play-off J5', 'Play-off J6',
  'Super Play-off (1/2)', 'Super Play-off (Finale)',
  'Coupe de Tunisie', 'BAL (Basketball Africa League)',
];

interface BackendMatch {
  _id?: string;
  id?: string;
  slug: string;
  sport: 'football' | 'basketball';
  competition: string;
  competitionAr?: string;
  season?: string;
  homeTeam: string;
  homeTeamAr?: string;
  homeLogo?: string;
  awayTeam: string;
  awayTeamAr?: string;
  awayLogo?: string;
  date: string;
  time?: string;
  venue?: string;
  venueAr?: string;
  status: 'upcoming' | 'live' | 'finished';
  score?: { home: number; away: number };
  quarters?: { home: number[]; away: number[] } | null;
  timeline?: MatchEvent[];
  stats?: Record<string, { home: number; away: number }>;
  dataSource?: string;
  manualOverride?: boolean;
}

function normalizeMatch(m: any): Match & { quarters?: { home: number[]; away: number[] } | null; dataSource?: string; manualOverride?: boolean } {
  const isBasketball = m.sport === 'basketball';
  const defaultUsmLogo = isBasketball ? '/images/usm-basketball-logo.png' : '/brand/usm-logo.webp';

  return {
    id: m._id || m.id || m.slug,
    sport: m.sport,
    competition: m.competition,
    competitionAr: m.competitionAr || m.competition,
    homeTeam: m.homeTeam,
    homeTeamAr: m.homeTeamAr || m.homeTeam,
    homeLogo: m.homeLogo || (m.homeTeam?.toLowerCase().includes('monastir') ? defaultUsmLogo : ''),
    awayTeam: m.awayTeam,
    awayTeamAr: m.awayTeamAr || m.awayTeam,
    awayLogo: m.awayLogo || (m.awayTeam?.toLowerCase().includes('monastir') ? defaultUsmLogo : ''),
    date: typeof m.date === 'string' ? m.date.slice(0, 10) : m.date,
    time: m.time || '18:00',
    venue: m.venue || (isBasketball ? 'Salle Omnisports Mohamed Mzali, Monastir' : 'Stade Mustapha Ben Jannet, Monastir'),
    venueAr: m.venueAr || m.venue,
    status: m.status || 'upcoming',
    score: m.score || { home: 0, away: 0 },
    quarters: m.quarters || null,
    timeline: m.timeline || [],
    stats: m.stats || {},
    dataSource: m.dataSource || 'MANUAL',
    manualOverride: m.manualOverride ?? false,
  };
}

export default function AdminMatches() {
  const { matches: contextMatches, showToast } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [dbMatches, setDbMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<'all' | 'football' | 'basketball'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Match['status']>('all');
  const [showAddForm, setShowAddForm] = useState(() => searchParams.get('new') === '1');

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAdminMatches();
      if (Array.isArray(res) && res.length > 0) {
        setDbMatches(res.map(normalizeMatch));
      } else {
        setDbMatches(contextMatches);
      }
    } catch {
      setDbMatches(contextMatches);
    } finally {
      setLoading(false);
    }
  }, [contextMatches]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/admin/matches');
    }
  }, [searchParams, router]);

  // Add / Edit match form state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [form, setForm] = useState({
    sport: 'basketball' as 'football' | 'basketball',
    competition: 'Championnat National Pro A',
    journee: 'J1',
    season: '2026/2027',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد الرياضي المنستيري',
    homeLogo: '/images/usm-basketball-logo.png',
    awayTeam: '',
    awayTeamAr: '',
    awayLogo: '',
    date: '',
    time: '18:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'upcoming' as 'upcoming' | 'live' | 'finished',
    scoreHome: 0,
    scoreAway: 0,
    q1Home: 0,
    q1Away: 0,
    q2Home: 0,
    q2Away: 0,
    q3Home: 0,
    q3Away: 0,
    q4Home: 0,
    q4Away: 0,
  });

  const handleSportChange = (sport: 'football' | 'basketball') => {
    const isBb = sport === 'basketball';
    setForm((f) => ({
      ...f,
      sport,
      competition: isBb ? 'Championnat National Pro A' : 'Ligue 1 Professionnelle',
      journee: isBb ? (f.journee || 'J1') : '',
      venue: isBb
        ? 'Salle Omnisports Mohamed Mzali, Monastir'
        : 'Stade Mustapha Ben Jannet, Monastir',
      venueAr: isBb ? 'قاعة محمد مزالي، المنستير' : 'ملعب مصطفى بن جنات، المنستير',
      homeLogo: isBb ? '/images/usm-basketball-logo.png' : '/brand/usm-logo.webp',
    }));
  };

  const handleOpenAdd = () => {
    setEditingMatchId(null);
    setForm({
      sport: 'basketball',
      competition: 'Championnat National Pro A',
      journee: 'J1',
      season: '2026/2027',
      homeTeam: 'US Monastir',
      homeTeamAr: 'الاتحاد الرياضي المنستيري',
      homeLogo: '/images/usm-basketball-logo.png',
      awayTeam: '',
      awayTeamAr: '',
      awayLogo: '',
      date: '',
      time: '18:00',
      venue: 'Salle Omnisports Mohamed Mzali, Monastir',
      venueAr: 'قاعة محمد مزالي، المنستير',
      status: 'upcoming',
      scoreHome: 0,
      scoreAway: 0,
      q1Home: 0,
      q1Away: 0,
      q2Home: 0,
      q2Away: 0,
      q3Home: 0,
      q3Away: 0,
      q4Home: 0,
      q4Away: 0,
    });
    setShowAddForm(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingMatchId(m.id);
    let comp = m.competition || '';
    let j = '';
    if (comp.includes('—')) {
      const parts = comp.split('—').map((s: string) => s.trim());
      comp = parts[0];
      j = parts[1] || '';
    } else if (comp.includes(' - ')) {
      const parts = comp.split(' - ').map((s: string) => s.trim());
      comp = parts[0];
      j = parts[1] || '';
    }

    setForm({
      sport: m.sport || 'basketball',
      competition: comp || (m.sport === 'basketball' ? 'Championnat National Pro A' : 'Ligue 1 Professionnelle'),
      journee: j,
      season: m.season || '2026/2027',
      homeTeam: m.homeTeam || 'US Monastir',
      homeTeamAr: m.homeTeamAr || '',
      homeLogo: m.homeLogo || (m.sport === 'basketball' ? '/images/usm-basketball-logo.png' : '/brand/usm-logo.webp'),
      awayTeam: m.awayTeam || '',
      awayTeamAr: m.awayTeamAr || '',
      awayLogo: m.awayLogo || '',
      date: typeof m.date === 'string' ? m.date.slice(0, 10) : '',
      time: m.time || '18:00',
      venue: m.venue || (m.sport === 'basketball' ? 'Salle Omnisports Mohamed Mzali, Monastir' : 'Stade Mustapha Ben Jannet, Monastir'),
      venueAr: m.venueAr || '',
      status: m.status || 'upcoming',
      scoreHome: m.score?.home ?? 0,
      scoreAway: m.score?.away ?? 0,
      q1Home: m.quarters?.home?.[0] ?? 0,
      q1Away: m.quarters?.away?.[0] ?? 0,
      q2Home: m.quarters?.home?.[1] ?? 0,
      q2Away: m.quarters?.away?.[1] ?? 0,
      q3Home: m.quarters?.home?.[2] ?? 0,
      q3Away: m.quarters?.away?.[2] ?? 0,
      q4Home: m.quarters?.home?.[3] ?? 0,
      q4Away: m.quarters?.away?.[3] ?? 0,
    });
    setShowAddForm(true);
  };

  const handleInvertHomeAway = () => {
    setForm((f) => {
      const newHome = f.awayTeam;
      const newHomeAr = f.awayTeamAr;
      const newHomeLogo = f.awayLogo;
      const newAway = f.homeTeam;
      const newAwayAr = f.homeTeamAr;
      const newAwayLogo = f.homeLogo;

      // Smart venue prediction
      let newVenue = f.venue;
      if (f.sport === 'basketball') {
        if (newHome.toLowerCase().includes('monastir')) {
          newVenue = 'Salle Omnisports Mohamed Mzali, Monastir';
        } else {
          const matchOpp = BASKETBALL_TUNISIAN_TEAMS.find((t) => t.name.toLowerCase() === newHome.toLowerCase());
          if (matchOpp) newVenue = matchOpp.venue;
        }
      }

      return {
        ...f,
        homeTeam: newHome,
        homeTeamAr: newHomeAr,
        homeLogo: newHomeLogo,
        awayTeam: newAway,
        awayTeamAr: newAwayAr,
        awayLogo: newAwayLogo,
        venue: newVenue,
        scoreHome: f.scoreAway,
        scoreAway: f.scoreHome,
        q1Home: f.q1Away,
        q1Away: f.q1Home,
        q2Home: f.q2Away,
        q2Away: f.q2Home,
        q3Home: f.q3Away,
        q3Away: f.q3Home,
        q4Home: f.q4Away,
        q4Away: f.q4Home,
      };
    });
  };

  const handleSelectJournee = (j: string) => {
    setForm((f) => ({
      ...f,
      journee: j,
    }));
  };

  const handleSelectOpponent = (opp: typeof BASKETBALL_TUNISIAN_TEAMS[0]) => {
    setForm((f) => {
      const isUsmHome = f.homeTeam.toLowerCase().includes('monastir');
      if (isUsmHome) {
        return {
          ...f,
          awayTeam: opp.name,
          awayTeamAr: opp.nameAr,
          awayLogo: opp.logo || f.awayLogo || '',
        };
      } else {
        return {
          ...f,
          homeTeam: opp.name,
          homeTeamAr: opp.nameAr,
          homeLogo: opp.logo || f.homeLogo || '',
          venue: opp.venue,
        };
      }
    });
  };

  const isUsmHome = form.homeTeam.toLowerCase().includes('monastir');
  const isUsmAway = form.awayTeam.toLowerCase().includes('monastir');
  const adversaryIsAway = isUsmHome || !isUsmAway;
  const adversaryTeamName = adversaryIsAway ? form.awayTeam : form.homeTeam;
  const adversaryLogoUrl = adversaryIsAway ? form.awayLogo : form.homeLogo;

  const setAdversaryLogo = (url: string) => {
    setForm((f) => {
      const usmHome = f.homeTeam.toLowerCase().includes('monastir');
      const usmAway = f.awayTeam.toLowerCase().includes('monastir');
      const isAway = usmHome || !usmAway;
      return isAway ? { ...f, awayLogo: url } : { ...f, homeLogo: url };
    });
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.competition || !form.date || !form.venue) {
      showToast?.('Veuillez remplir tous les champs obligatoires (équipes, date, lieu).', 'error');
      return;
    }

    try {
      const quarters =
        form.sport === 'basketball' && form.status !== 'upcoming'
          ? {
              home: [Number(form.q1Home), Number(form.q2Home), Number(form.q3Home), Number(form.q4Home)],
              away: [Number(form.q1Away), Number(form.q2Away), Number(form.q3Away), Number(form.q4Away)],
            }
          : null;

      const fullComp = form.journee ? `${form.competition} — ${form.journee}` : form.competition;
      const fullCompAr = form.journee ? `${form.competition} — ${form.journee}` : form.competition;

      const defaultUsmLogo = form.sport === 'basketball' ? '/images/usm-basketball-logo.png' : '/brand/usm-logo.webp';

      const payload = {
        sport: form.sport,
        competition: fullComp,
        competitionAr: fullCompAr,
        season: form.season,
        homeTeam: form.homeTeam,
        homeTeamAr: form.homeTeamAr || form.homeTeam,
        homeLogo: form.homeLogo || (form.homeTeam.toLowerCase().includes('monastir') ? defaultUsmLogo : ''),
        awayTeam: form.awayTeam,
        awayTeamAr: form.awayTeamAr || form.awayTeam,
        awayLogo: form.awayLogo || (form.awayTeam.toLowerCase().includes('monastir') ? defaultUsmLogo : ''),
        date: form.date,
        time: form.time,
        venue: form.venue,
        venueAr: form.venueAr || form.venue,
        status: form.status,
        score: {
          home: Number(form.scoreHome),
          away: Number(form.scoreAway),
        },
        quarters,
        dataSource: 'MANUAL',
        manualOverride: true,
      };

      if (editingMatchId) {
        await api.updateAdminMatch(editingMatchId, payload);
        showToast?.('Match mis à jour avec succès.', 'success');
      } else {
        await api.createAdminMatch(payload);
        showToast?.('Match créé et verrouillé manuellement avec succès.', 'success');
      }

      setShowAddForm(false);
      setEditingMatchId(null);
      fetchMatches();
    } catch (err: any) {
      showToast?.(`Erreur lors de l'enregistrement : ${err.message || 'Échec réseau'}`, 'error');
    }
  };

  const matchesList = dbMatches.length > 0 ? dbMatches : contextMatches;

  const filteredMatches = matchesList.filter(
    (m) =>
      (sportFilter === 'all' || m.sport === sportFilter) &&
      (statusFilter === 'all' || m.status === statusFilter),
  );

  // Live control room state
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  useEffect(() => {
    if (!selectedMatchId && matchesList.length > 0) {
      const live = matchesList.find((m) => m.status === 'live');
      setSelectedMatchId(live?.id ?? matchesList[0]?.id ?? '');
    }
  }, [matchesList, selectedMatchId]);

  const activeMatch = matchesList.find((m) => m.id === selectedMatchId) ?? matchesList[0];
  const [eventType, setEventType] = useState<MatchEvent['type']>('goal');
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventDetail, setEventDetail] = useState('');

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await api.deleteAdminMatch(matchId);
      showToast?.('Match supprimé avec succès.', 'success');
      fetchMatches();
    } catch (err: any) {
      showToast?.(`Erreur lors de la suppression : ${err.message}`, 'error');
    }
  };

  const handleScoreUpdate = async (team: 'home' | 'away', amount: number) => {
    if (!activeMatch) return;
    try {
      await api.updateAdminMatchScore(activeMatch.id, team, amount);
      fetchMatches();
    } catch (err: any) {
      showToast?.(`Erreur de score : ${err.message}`, 'error');
    }
  };

  const handleStatusUpdate = async (status: 'upcoming' | 'live' | 'finished') => {
    if (!activeMatch) return;
    try {
      await api.updateAdminMatchStatus(activeMatch.id, status);
      showToast?.(`Statut mis à jour : ${status}`, 'success');
      fetchMatches();
    } catch (err: any) {
      showToast?.(`Erreur de statut : ${err.message}`, 'error');
    }
  };

  const handleTriggerEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventPlayer.trim() || !activeMatch) return;

    try {
      await api.addAdminMatchEvent(activeMatch.id, {
        time: activeMatch.status === 'live' ? Math.floor(Math.random() * 85 + 5) : 45,
        type: eventType,
        team: 'home',
        player: eventPlayer,
        playerAr: eventPlayer,
        detail: eventDetail,
        detailAr: eventDetail,
      });

      if (eventType === 'goal') {
        await api.updateAdminMatchScore(activeMatch.id, 'home', 1);
      } else if (eventType === 'basket') {
        await api.updateAdminMatchScore(activeMatch.id, 'home', eventDetail.includes('Three') ? 3 : 2);
      }

      setEventPlayer('');
      setEventDetail('');
      fetchMatches();
      showToast?.('Événement ajouté au direct.', 'success');
    } catch (err: any) {
      showToast?.(`Erreur lors de l'ajout de l'événement : ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Match Center & Gestion des Rencontres"
        description="Gérez les matchs officiels Football & Basketball, saisissez manuellement les quarts-temps et pilotez le Live Center."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMatches()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <button
              onClick={() => handleOpenAdd()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={14} /> Planifier un match
            </button>
          </div>
        }
      />

      {/* All matches table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          {(['all', 'football', 'basketball'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer transition-colors ${
                sportFilter === s ? 'bg-usm-blue-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Tous les sports' : s}
            </button>
          ))}
          <span className="w-px h-5 bg-slate-200 mx-1" />
          {(['all', 'upcoming', 'live', 'finished'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer transition-colors ${
                statusFilter === s ? 'bg-usm-blue-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Tous statuts' : s === 'upcoming' ? 'À venir' : s === 'live' ? 'En direct' : 'Terminé'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Affiche</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Lieu</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatches.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      m.sport === 'basketball' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                    }`}>
                      {m.sport === 'basketball' ? '🏀 Basket' : '⚽ Foot'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {m.homeLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.homeLogo} alt={m.homeTeam} className="w-5 h-5 object-contain rounded shrink-0 bg-slate-50 p-0.5 border border-slate-100" />
                        ) : (
                          <span className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {m.homeTeam ? m.homeTeam.substring(0, 2).toUpperCase() : 'US'}
                          </span>
                        )}
                        <span className="truncate max-w-[120px]">{m.homeTeam}</span>
                      </div>
                      <span className="text-slate-400 font-normal text-[10px] shrink-0">vs</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {m.awayLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.awayLogo} alt={m.awayTeam} className="w-5 h-5 object-contain rounded shrink-0 bg-slate-50 p-0.5 border border-slate-100" />
                        ) : (
                          <span className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {m.awayTeam ? m.awayTeam.substring(0, 2).toUpperCase() : 'OP'}
                          </span>
                        )}
                        <span className="truncate max-w-[120px]">{m.awayTeam}</span>
                      </div>
                    </div>
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{m.competition}</span>
                    {m.quarters && (
                      <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                        Q1: {m.quarters.home[0]}-{m.quarters.away[0]} | Q2: {m.quarters.home[1]}-{m.quarters.away[1]} | Q3: {m.quarters.home[2]}-{m.quarters.away[2]} | Q4: {m.quarters.home[3]}-{m.quarters.away[3]}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {m.date} <span className="text-slate-400 font-mono">{m.time}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate" title={m.venue}>{m.venue}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                    {m.score.home} - {m.score.away}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        DATA_SOURCE_STYLES[m.dataSource || 'MANUAL'] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.manualOverride && <Lock size={10} className="text-amber-600" />}
                      {m.dataSource || 'MANUAL'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[m.status as Match['status']] || 'bg-slate-100'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="px-2.5 py-1 rounded font-bold cursor-pointer transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px]"
                        title="Modifier ce match (Journée, date, score...)"
                      >
                        <Pencil size={11} /> Modifier
                      </button>
                      <button
                        onClick={() => setSelectedMatchId(m.id)}
                        className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                          activeMatch?.id === m.id
                            ? 'bg-usm-blue-primary text-white'
                            : 'bg-usm-blue-primary/10 text-usm-blue-primary hover:bg-usm-blue-primary hover:text-white'
                        }`}
                      >
                        Piloter
                      </button>
                      <button
                        onClick={() =>
                          requestConfirmation({
                            title: 'Supprimer ce match ?',
                            message: `${m.homeTeam} vs ${m.awayTeam} sera supprimé définitivement de la base de données.`,
                            confirmLabel: 'Supprimer',
                            onConfirm: () => handleDeleteMatch(m.id),
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMatches.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Aucun match ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Control Room */}
      {activeMatch && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Radio size={16} className={activeMatch.status === 'live' ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
              <h3 className="text-sm font-black text-slate-900">
                Live Control Room — {activeMatch.homeTeam} vs {activeMatch.awayTeam} ({activeMatch.sport.toUpperCase()})
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Source: <strong className="text-slate-800">{activeMatch.dataSource || 'MANUAL'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match selector + status + score */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Sélectionner un match</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                >
                  {matchesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.sport.toUpperCase()}] {m.homeTeam} vs {m.awayTeam} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['upcoming', 'live', 'finished'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all ${
                      activeMatch.status === status
                        ? 'bg-usm-blue-primary text-white shadow'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'upcoming' ? 'À venir' : status === 'live' ? 'En direct' : 'Terminé'}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4">
                {(['home', 'away'] as const).map((side) => (
                  <div key={side} className="text-center space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase truncate">
                      {side === 'home' ? activeMatch.homeTeam : activeMatch.awayTeam}
                    </span>
                    <span className="font-black text-2xl text-slate-900 block font-mono">
                      {activeMatch.score?.[side] ?? 0}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <button
                        onClick={() => handleScoreUpdate(side, 1)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-usm-blue-primary cursor-pointer text-xs font-bold"
                      >
                        +1
                      </button>
                      {activeMatch.sport === 'basketball' && (
                        <>
                          <button
                            onClick={() => handleScoreUpdate(side, 2)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-usm-blue-primary cursor-pointer text-xs font-bold"
                          >
                            +2
                          </button>
                          <button
                            onClick={() => handleScoreUpdate(side, 3)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-usm-blue-primary cursor-pointer text-xs font-bold"
                          >
                            +3
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleScoreUpdate(side, -1)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-red-300 cursor-pointer text-xs font-bold text-red-600"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event generator */}
            <div className="lg:col-span-2">
              <form onSubmit={handleTriggerEvent} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type d&apos;événement</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as MatchEvent['type'])}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                    >
                      {activeMatch.sport === 'football' ? (
                        <>
                          <option value="goal">⚽ But marqué</option>
                          <option value="card-yellow">🟨 Carton jaune</option>
                          <option value="card-red">🟥 Carton rouge</option>
                          <option value="substitution">🔄 Remplacement</option>
                          <option value="foul">🛑 Faute</option>
                        </>
                      ) : (
                        <>
                          <option value="basket">🏀 Panier marqué (2 ou 3 pts)</option>
                          <option value="foul">🛑 Faute commise</option>
                          <option value="timeout">⏱️ Temps mort</option>
                          <option value="substitution">🔄 Remplacement</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Joueur concerné *</label>
                    <input
                      required
                      type="text"
                      placeholder={activeMatch.sport === 'basketball' ? 'ex. Lassaad Chouaya' : 'ex. Adem Alimi'}
                      value={eventPlayer}
                      onChange={(e) => setEventPlayer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Détail / Note (ex: Tir à 3 points, Passe décisive)</label>
                  <input
                    type="text"
                    placeholder="ex. Tir à 3 points réussi"
                    value={eventDetail}
                    onChange={(e) => setEventDetail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={activeMatch.status !== 'live'}
                  className="px-4 py-2.5 bg-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black uppercase rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Send size={13} /> Diffuser l&apos;événement
                </button>
                {activeMatch.status !== 'live' && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" /> Passez le statut du match à « EN DIRECT » pour diffuser des événements sur le flux public.
                  </p>
                )}
              </form>

              {/* Recent timeline */}
              {activeMatch.timeline && activeMatch.timeline.length > 0 && (
                <div className="mt-4 space-y-1.5 max-h-40 overflow-y-auto">
                  {activeMatch.timeline.slice(0, 5).map((ev: any) => (
                    <div key={ev.id} className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">
                      <span className="font-mono font-bold text-usm-blue-primary shrink-0">{ev.time}&apos;</span>
                      <span className="capitalize font-semibold">{ev.type.replace('-', ' ')}</span>
                      <span className="text-slate-400">—</span>
                      <span className="truncate">{ev.player}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit match modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowAddForm(false); setEditingMatchId(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingMatchId ? 'Modifier la rencontre' : 'Planifier / Ajouter un Match (Manuel Garanti)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingMatchId ? 'Ajustez la journée, les scores par quart-temps, la date ou la salle.' : 'Planifiez facilement les matchs de basketball par journée.'}
                </p>
              </div>
              <button onClick={() => { setShowAddForm(false); setEditingMatchId(null); }} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-5 space-y-3 max-h-[78vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sport</label>
                  <select
                    value={form.sport}
                    onChange={(e) => handleSportChange(e.target.value as 'football' | 'basketball')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-bold"
                  >
                    <option value="basketball">🏀 Basketball</option>
                    <option value="football">⚽ Football</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Compétition *</label>
                  <input
                    required
                    type="text"
                    value={form.competition}
                    onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))}
                    placeholder={form.sport === 'basketball' ? 'Championnat National Pro A' : 'Ligue 1 Professionnelle'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>

              {/* Journée selector for Basketball */}
              {form.sport === 'basketball' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      🏀 Journée du Championnat Pro A
                    </span>
                    {form.journee && (
                      <span className="text-[10px] font-mono font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                        {form.journee}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    {BASKETBALL_JOURNEES.map((j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleSelectJournee(j)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          form.journee === j
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        {j}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Basketball Opponents & Home/Away swap */}
              {form.sport === 'basketball' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800">
                      Adversaires Pro A Tunisie (sélection rapide)
                    </span>
                    <button
                      type="button"
                      onClick={handleInvertHomeAway}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-2xs"
                      title="Inverser Domicile et Extérieur"
                    >
                      <ArrowLeftRight size={11} /> Inverser Domicile / Extérieur
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {BASKETBALL_TUNISIAN_TEAMS.map((opp) => (
                      <button
                        key={opp.name}
                        type="button"
                        onClick={() => handleSelectOpponent(opp)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          form.awayTeam === opp.name || form.homeTeam === opp.name
                            ? 'bg-usm-blue-primary text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Saison *</label>
                  <input
                    required
                    type="text"
                    value={form.season}
                    onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                    placeholder="2026/2027"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Statut *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  >
                    <option value="upcoming">À venir (Upcoming)</option>
                    <option value="live">En direct (Live)</option>
                    <option value="finished">Terminé (Finished)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Équipe Domicile *</label>
                  <input
                    required
                    type="text"
                    value={form.homeTeam}
                    onChange={(e) => setForm((f) => ({ ...f, homeTeam: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Équipe Extérieur *</label>
                  <input
                    required
                    type="text"
                    value={form.awayTeam}
                    onChange={(e) => setForm((f) => ({ ...f, awayTeam: e.target.value }))}
                    placeholder="ex. CSS Sfax, Club Africain, Etoile du Sahel..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>

              {/* Photo / Logo de l'Adversaire */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-usm-blue-primary" />
                    <span className="text-[11px] font-bold text-slate-800">
                      Photo / Logo de l&apos;adversaire ({adversaryTeamName || 'Équipe adverse'})
                    </span>
                  </div>
                  {adversaryLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setAdversaryLogo('')}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Effacer la photo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Téléverser le logo / la photo
                    </label>
                    <MediaUploader
                      folder="teams"
                      currentUrl={adversaryLogoUrl}
                      label="Glisser ou choisir la photo adverse"
                      compact
                      onUpload={(file) => setAdversaryLogo(file.url)}
                      onRemove={() => setAdversaryLogo('')}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Ou URL / Chemin direct
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={adversaryLogoUrl}
                        onChange={(e) => setAdversaryLogo(e.target.value)}
                        placeholder="/teams/css.png ou https://..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-usm-blue-primary font-mono"
                      />
                      {adversaryLogoUrl && (
                        <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={adversaryLogoUrl} alt="Logo adverse" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced: individual logos for both teams */}
                <details className="text-[10px] text-slate-500 pt-1">
                  <summary className="cursor-pointer font-bold hover:text-usm-blue-primary">
                    Options avancées : Personnaliser les 2 logos (Domicile & Extérieur)
                  </summary>
                  <div className="grid grid-cols-2 gap-2.5 mt-2 pt-2 border-t border-slate-200">
                    <div>
                      <span className="block font-semibold mb-1 truncate">Logo {form.homeTeam || 'Domicile'}</span>
                      <input
                        type="text"
                        value={form.homeLogo}
                        onChange={(e) => setForm((f) => ({ ...f, homeLogo: e.target.value }))}
                        placeholder="/brand/usm-logo.webp"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <span className="block font-semibold mb-1 truncate">Logo {form.awayTeam || 'Extérieur'}</span>
                      <input
                        type="text"
                        value={form.awayLogo}
                        onChange={(e) => setForm((f) => ({ ...f, awayLogo: e.target.value }))}
                        placeholder="/teams/adversaire.png"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] font-mono outline-none"
                      />
                    </div>
                  </div>
                </details>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Heure</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lieu / Salle / Stade *</label>
                <input
                  required
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                />
              </div>

              {form.status !== 'upcoming' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-[11px] text-slate-800">Score Final</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">Score {form.homeTeam || 'Domicile'}</label>
                      <input
                        type="number"
                        min="0"
                        value={form.scoreHome}
                        onChange={(e) => setForm((f) => ({ ...f, scoreHome: parseInt(e.target.value, 10) || 0 }))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">Score {form.awayTeam || 'Extérieur'}</label>
                      <input
                        type="number"
                        min="0"
                        value={form.scoreAway}
                        onChange={(e) => setForm((f) => ({ ...f, scoreAway: parseInt(e.target.value, 10) || 0 }))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>

                  {form.sport === 'basketball' && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="font-bold text-[11px] text-slate-800">Scores par quart-temps (Basketball)</div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div>
                          <span className="block font-bold text-slate-400 mb-1">Q1 (Dom - Ext)</span>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={form.q1Home}
                              onChange={(e) => setForm((f) => ({ ...f, q1Home: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                            <input
                              type="number"
                              value={form.q1Away}
                              onChange={(e) => setForm((f) => ({ ...f, q1Away: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 mb-1">Q2 (Dom - Ext)</span>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={form.q2Home}
                              onChange={(e) => setForm((f) => ({ ...f, q2Home: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                            <input
                              type="number"
                              value={form.q2Away}
                              onChange={(e) => setForm((f) => ({ ...f, q2Away: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 mb-1">Q3 (Dom - Ext)</span>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={form.q3Home}
                              onChange={(e) => setForm((f) => ({ ...f, q3Home: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                            <input
                              type="number"
                              value={form.q3Away}
                              onChange={(e) => setForm((f) => ({ ...f, q3Away: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 mb-1">Q4 (Dom - Ext)</span>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={form.q4Home}
                              onChange={(e) => setForm((f) => ({ ...f, q4Home: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                            <input
                              type="number"
                              value={form.q4Away}
                              onChange={(e) => setForm((f) => ({ ...f, q4Away: parseInt(e.target.value, 10) || 0 }))}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                <Lock size={14} className="shrink-0 text-emerald-600" />
                <span>Ce match sera sauvegardé avec le drapeau <strong>MANUAL (Verrouillé)</strong> afin que les synchronisations externes ne l&apos;écrasent jamais.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2 shadow-sm"
              >
                {editingMatchId ? 'Mettre à jour et Verrouiller le Match' : 'Enregistrer et Verrouiller le Match'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
