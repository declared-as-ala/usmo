'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { Match, MatchEvent } from '../../data/mockData';
import {
  Plus,
  X,
  Trash2,
  Radio,
  Send,
  AlertTriangle,
} from 'lucide-react';

const STATUS_STYLES: Record<Match['status'], string> = {
  upcoming: 'bg-slate-100 text-slate-600',
  live: 'bg-red-50 text-red-600',
  finished: 'bg-emerald-50 text-emerald-700',
};

export default function AdminMatches() {
  const { matches, addMatch, deleteMatch, updateMatchScore, addMatchEvent, updateMatchStatus } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sportFilter, setSportFilter] = useState<'all' | 'football' | 'basketball'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Match['status']>('all');
  const [showAddForm, setShowAddForm] = useState(() => searchParams.get('new') === '1');

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/admin/matches');
    }
  }, [searchParams, router]);

  // Add match form state
  const [form, setForm] = useState({
    sport: 'football' as 'football' | 'basketball',
    competition: '',
    homeTeam: 'US Monastir',
    awayTeam: '',
    date: '',
    time: '',
    venue: '',
  });

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.awayTeam || !form.competition || !form.date || !form.venue) return;

    const newMatch: Match = {
      id: `m-${Date.now()}`,
      sport: form.sport,
      competition: form.competition,
      competitionAr: form.competition,
      homeTeam: form.homeTeam,
      homeTeamAr: form.homeTeam,
      homeLogo: '/logo.webp',
      awayTeam: form.awayTeam,
      awayTeamAr: form.awayTeam,
      awayLogo: '',
      date: form.date,
      time: form.time,
      venue: form.venue,
      venueAr: form.venue,
      status: 'upcoming',
      score: { home: 0, away: 0 },
      timeline: [],
      stats: {},
    };
    addMatch(newMatch);
    setShowAddForm(false);
    setForm({ sport: 'football', competition: '', homeTeam: 'US Monastir', awayTeam: '', date: '', time: '', venue: '' });
  };

  const filteredMatches = matches.filter(
    (m) => (sportFilter === 'all' || m.sport === sportFilter) && (statusFilter === 'all' || m.status === statusFilter)
  );

  // Live control room state
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches.find((m) => m.status === 'live')?.id ?? matches[0]?.id ?? '');
  const activeMatch = matches.find((m) => m.id === selectedMatchId) ?? matches[0];
  const [eventType, setEventType] = useState<MatchEvent['type']>('goal');
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventDetail, setEventDetail] = useState('');

  const handleTriggerEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventPlayer.trim() || !activeMatch) return;

    addMatchEvent(activeMatch.id, {
      time: activeMatch.status === 'live' ? Math.floor(Math.random() * 85 + 5) : 45,
      type: eventType,
      team: 'home',
      player: eventPlayer,
      playerAr: eventPlayer,
      detail: eventDetail,
      detailAr: eventDetail,
    });

    if (eventType === 'goal') updateMatchScore(activeMatch.id, 'home', 1);
    else if (eventType === 'basket') updateMatchScore(activeMatch.id, 'home', eventDetail.includes('Three') ? 3 : 2);

    setEventPlayer('');
    setEventDetail('');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Match Center"
        description="Manage fixtures and run the live control room for football and basketball."
        actions={
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={14} /> Add Match
          </button>
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
              {s}
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
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Fixture</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatches.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 capitalize text-slate-600">{m.sport}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {m.homeTeam} <span className="text-slate-400 font-normal">vs</span> {m.awayTeam}
                    <span className="block text-[10px] text-slate-400 font-normal">{m.competition}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {m.date} <span className="text-slate-400">{m.time}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate">{m.venue}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {m.score.home} - {m.score.away}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                      <button
                        onClick={() => setSelectedMatchId(m.id)}
                        className="px-2.5 py-1 bg-usm-blue-primary/10 text-usm-blue-primary hover:bg-usm-blue-primary hover:text-white rounded font-bold cursor-pointer transition-all"
                      >
                        Control
                      </button>
                      <button
                        onClick={() => requestConfirmation({ title: 'Supprimer ce match ?', message: `${m.homeTeam} vs ${m.awayTeam} sera supprimé définitivement.`, confirmLabel: 'Supprimer', onConfirm: () => deleteMatch(m.id) })}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No matches match these filters.
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
          <div className="flex items-center gap-2 mb-4">
            <Radio size={16} className="text-red-500" />
            <h3 className="text-sm font-black text-slate-900">Live Control Room</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match selector + status + score */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Select Match</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.homeTeam} vs {m.awayTeam} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['upcoming', 'live', 'finished'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateMatchStatus(activeMatch.id, status)}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all ${
                      activeMatch.status === status ? 'bg-usm-blue-primary text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4">
                {(['home', 'away'] as const).map((side) => (
                  <div key={side} className="text-center space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase truncate">
                      {side === 'home' ? activeMatch.homeTeam : activeMatch.awayTeam}
                    </span>
                    <span className="font-black text-2xl text-slate-900 block">{activeMatch.score[side]}</span>
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => updateMatchScore(activeMatch.id, side, 1)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-usm-blue-primary cursor-pointer text-xs font-bold"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => updateMatchScore(activeMatch.id, side, -1)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:border-red-300 cursor-pointer text-xs font-bold"
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as MatchEvent['type'])}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                    >
                      {activeMatch.sport === 'football' ? (
                        <>
                          <option value="goal">⚽ Goal scored</option>
                          <option value="card-yellow">🟨 Yellow Card</option>
                          <option value="card-red">🟥 Red Card</option>
                          <option value="substitution">🔄 Substitution</option>
                          <option value="foul">🛑 Foul committed</option>
                        </>
                      ) : (
                        <>
                          <option value="basket">🏀 Basket scored</option>
                          <option value="foul">🛑 Foul committed</option>
                          <option value="timeout">⏱️ Timeout called</option>
                          <option value="substitution">🔄 Substitution</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Player</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Adem Alimi"
                      value={eventPlayer}
                      onChange={(e) => setEventPlayer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Event Detail / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Assist by Ifia, or Three-pointer"
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
                  <Send size={13} /> Push Timeline Event
                </button>
                {activeMatch.status !== 'live' && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" /> Set match status to LIVE to push timeline events.
                  </p>
                )}
              </form>

              {/* Recent timeline */}
              {activeMatch.timeline.length > 0 && (
                <div className="mt-4 space-y-1.5 max-h-40 overflow-y-auto">
                  {activeMatch.timeline.slice(0, 5).map((ev) => (
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

      {/* Add match modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Match</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddMatch} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sport</label>
                  <select
                    value={form.sport}
                    onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as 'football' | 'basketball' }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  >
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Competition *</label>
                  <input
                    required
                    type="text"
                    value={form.competition}
                    onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))}
                    placeholder="Ligue 1 Tunisia"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Home Team</label>
                  <input
                    type="text"
                    value={form.homeTeam}
                    onChange={(e) => setForm((f) => ({ ...f, homeTeam: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Away Team *</label>
                  <input
                    required
                    type="text"
                    value={form.awayTeam}
                    onChange={(e) => setForm((f) => ({ ...f, awayTeam: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Venue *</label>
                <input
                  required
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  placeholder="Stade Mustapha Ben Jannet, Monastir"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2"
              >
                Schedule Match
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
