'use client';

import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { standingsData } from '../../data/mockData';
import { api } from '../../lib/api-client';
import { Users, Shield, Trophy, Plus, X, Trash2, Pencil, Image as ImageIcon } from 'lucide-react';
import { MediaUploader } from '../../components/Admin/MediaUploader';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

type Sport = 'football' | 'basketball';
type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'Guard' | 'Forward-C' | 'Center';

interface RosterPlayer {
  _id: string; name: string; nameAr: string; number: number;
  position: string; nationality: string; image: string;
  height: string; weight: string; age: number | null; bio: string;
  stats: Record<string, number | string>;
}

interface RosterStaff {
  _id: string; name: string; nameAr: string; role: string; image: string; sport: Sport | null;
}

const FOOTBALL_POSITIONS: Position[] = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const BASKETBALL_POSITIONS: Position[] = ['Guard', 'Forward', 'Forward-C', 'Center'];

const emptyPlayerForm = {
  name: '', nameAr: '', number: 1, position: '' as Position | '',
  nationality: 'Tunisian', image: '', height: '', weight: '', age: 20, bio: '',
  statLabel1: '', statValue1: '', statLabel2: '', statValue2: '', statLabel3: '', statValue3: '',
};

const emptyStaffForm = { name: '', nameAr: '', role: '', image: '' };

export default function AdminSquad() {
  const [sport, setSport] = useState<Sport>('football');
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [allStaff, setAllStaff] = useState<RosterStaff[]>([]);

  const staff = allStaff.filter((s) => s.sport === sport || s.sport === null);
  const positions = sport === 'football' ? FOOTBALL_POSITIONS : BASKETBALL_POSITIONS;

  const loadPlayers = () => api.getAdminPlayers(sport).then((data: RosterPlayer[]) => setPlayers(data || [])).catch(() => {});
  const loadStaff = () => api.getAdminStaff().then((data: RosterStaff[]) => setAllStaff(data || [])).catch(() => {});

  useEffect(() => { loadPlayers(); }, [sport]);
  useEffect(() => { loadStaff(); }, []);

  // Live standings
  const [liveUsmPosition, setLiveUsmPosition] = useState<number | null>(null);
  useEffect(() => {
    if (sport !== 'football') return;
    api.getStandings()
      .then((rows: { isUSM: boolean; position: number }[]) => {
        setLiveUsmPosition(rows.find((r) => r.isUSM)?.position ?? null);
      })
      .catch(() => {});
  }, [sport]);
  const usmPosition = sport === 'football'
    ? liveUsmPosition
    : standingsData.basketball.find((s) => s.team === 'US Monastir')?.position;

  const [footballBannerUrl, setFootballBannerUrl] = useState('');
  const [basketballBannerUrl, setBasketballBannerUrl] = useState('');
  const [savingBanners, setSavingBanners] = useState(false);
  const [footballBannerUploading, setFootballBannerUploading] = useState(false);
  const [basketballBannerUploading, setBasketballBannerUploading] = useState(false);
  const isBannerImageUploading = footballBannerUploading || basketballBannerUploading;

  useEffect(() => {
    api.getHomepageSettings()
      .then((settings) => {
        if (settings?.footballBannerUrl) setFootballBannerUrl(settings.footballBannerUrl);
        if (settings?.basketballBannerUrl) setBasketballBannerUrl(settings.basketballBannerUrl);
      })
      .catch(() => {});
  }, []);

  const saveSectionBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanners(true);
    try {
      await api.updateHomepageSettings({ footballBannerUrl, basketballBannerUrl });
      alert('Bannières des sections mises à jour avec succès !');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde des bannières');
    } finally {
      setSavingBanners(false);
    }
  };

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerForm, setPlayerForm] = useState(emptyPlayerForm);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerImageUploading, setPlayerImageUploading] = useState(false);

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [staffImageUploading, setStaffImageUploading] = useState(false);

  const openAddPlayer = () => {
    setEditingPlayerId(null);
    setPlayerForm({ ...emptyPlayerForm, position: positions[0] });
    setShowPlayerForm(true);
  };

  const openEditPlayer = (p: RosterPlayer) => {
    const statEntries = Object.entries(p.stats);
    setEditingPlayerId(p._id);
    setPlayerForm({
      name: p.name, nameAr: p.nameAr, number: p.number, position: p.position as Position,
      nationality: p.nationality, image: p.image, height: p.height, weight: p.weight,
      age: p.age ?? 20, bio: p.bio,
      statLabel1: statEntries[0]?.[0] ?? '', statValue1: statEntries[0] ? String(statEntries[0][1]) : '',
      statLabel2: statEntries[1]?.[0] ?? '', statValue2: statEntries[1] ? String(statEntries[1][1]) : '',
      statLabel3: statEntries[2]?.[0] ?? '', statValue3: statEntries[2] ? String(statEntries[2][1]) : '',
    });
    setShowPlayerForm(true);
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.name || !playerForm.position) return;

    const stats: Record<string, number | string> = {};
    if (playerForm.statLabel1) stats[playerForm.statLabel1] = isNaN(Number(playerForm.statValue1)) ? playerForm.statValue1 : Number(playerForm.statValue1);
    if (playerForm.statLabel2) stats[playerForm.statLabel2] = isNaN(Number(playerForm.statValue2)) ? playerForm.statValue2 : Number(playerForm.statValue2);
    if (playerForm.statLabel3) stats[playerForm.statLabel3] = isNaN(Number(playerForm.statValue3)) ? playerForm.statValue3 : Number(playerForm.statValue3);

    const payload = {
      name: playerForm.name, nameAr: playerForm.nameAr || playerForm.name,
      number: playerForm.number, position: playerForm.position, positionAr: playerForm.position,
      nationality: playerForm.nationality, nationalityAr: playerForm.nationality,
      image: playerForm.image, height: playerForm.height, weight: playerForm.weight,
      age: playerForm.age, bio: playerForm.bio, bioAr: playerForm.bio, stats, sport,
    };

    if (editingPlayerId) await api.updatePlayer(editingPlayerId, payload);
    else await api.createPlayer(payload);
    setShowPlayerForm(false);
    loadPlayers();
  };

  const openAddStaff = () => {
    setEditingStaffId(null);
    setStaffForm(emptyStaffForm);
    setShowStaffForm(true);
  };

  const openEditStaff = (s: RosterStaff) => {
    setEditingStaffId(s._id);
    setStaffForm({ name: s.name, nameAr: s.nameAr, role: s.role, image: s.image });
    setShowStaffForm(true);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.role) return;
    const payload = { name: staffForm.name, nameAr: staffForm.nameAr || staffForm.name, role: staffForm.role, roleAr: staffForm.role, image: staffForm.image, sport };
    if (editingStaffId) await api.updateStaff(editingStaffId, payload);
    else await api.createStaff(payload);
    setShowStaffForm(false);
    loadStaff();
  };

  const deletePlayerConfirmed = (p: RosterPlayer) => requestConfirmation({
    title: 'Remove this player?', message: `${p.name} will be removed from the ${sport} squad.`, confirmLabel: 'Remove',
    onConfirm: async () => { await api.deletePlayer(p._id); loadPlayers(); },
  });

  const deleteStaffConfirmed = (s: RosterStaff) => requestConfirmation({
    title: 'Remove staff member?', message: `${s.name} will be removed.`, confirmLabel: 'Remove',
    onConfirm: async () => { await api.deleteStaff(s._id); loadStaff(); },
  });

  const filteredPlayers = players.filter((p) =>
    !playerSearch.trim() ||
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.position.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.nationality.toLowerCase().includes(playerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Équipe"
        description="Unified squad roster and technical staff management for Football & Basketball."
        actions={
          <button
            onClick={openAddPlayer}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={14} /> Add Player
          </button>
        }
      />

      {/* ── Sport Toggle ── */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {(['football', 'basketball'] as Sport[]).map((s) => (
          <button
            key={s}
            onClick={() => { setSport(s); setPlayerSearch(''); }}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer capitalize ${
              sport === s ? 'bg-usm-blue-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Section Banners Editor ── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <ImageIcon size={16} className="text-usm-blue-primary" />
          <h3 className="text-sm font-black text-slate-900 font-display">Bannières des sections Équipe</h3>
        </div>
        <form onSubmit={saveSectionBanners} className="space-y-4">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Bannière Section Football</label>
              <MediaUploader
                folder="banners/football"
                currentUrl={footballBannerUrl}
                label="Déposer l'image ou cliquer pour choisir la bannière Football"
                onUpload={(file) => setFootballBannerUrl(file.url)}
                onRemove={() => setFootballBannerUrl('')}
                onUploadingChange={setFootballBannerUploading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Bannière Section Basketball</label>
              <MediaUploader
                folder="banners/basketball"
                currentUrl={basketballBannerUrl}
                label="Déposer l'image ou cliquer pour choisir la bannière Basketball"
                onUpload={(file) => setBasketballBannerUrl(file.url)}
                onRemove={() => setBasketballBannerUrl('')}
                onUploadingChange={setBasketballBannerUploading}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingBanners || isBannerImageUploading}
              className="px-4 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isBannerImageUploading ? 'Envoi de l’image…' : savingBanners ? 'Enregistrement...' : 'Enregistrer les bannières'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Squad Size" value={players.length} icon={Users} accent="blue" />
        <StatCard label="Technical Staff" value={staff.length} icon={Shield} accent="slate" />
        <StatCard label="League Position" value={usmPosition ? `#${usmPosition}` : '—'} icon={Trophy} accent="emerald" />
      </div>

      {/* ── Players Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 gap-3">
          <h3 className="text-sm font-black text-slate-900">Players — {sport === 'football' ? 'Football' : 'Basketball'}</h3>
          <input
            type="text"
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            placeholder="Search player…"
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-usm-blue-primary bg-slate-50 w-48"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlayers.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        {p.nameAr && <span className="text-[10px] text-slate-400 font-normal" dir="rtl">{p.nameAr}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">{p.number}</td>
                  <td className="py-2.5 px-4 text-slate-600">{p.position}</td>
                  <td className="py-2.5 px-4 text-slate-600">{p.nationality}</td>
                  <td className="py-2.5 px-4 text-slate-600">{p.age}</td>
                  <td className="py-2.5 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                      <button onClick={() => openEditPlayer(p)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deletePlayerConfirmed(p)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No players found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Technical Staff ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Technical Staff — {sport === 'football' ? 'Football' : 'Basketball'}</h3>
          <button
            onClick={openAddStaff}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={13} /> Add Staff
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {staff.map((s) => (
            <div key={s._id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEditStaff(s)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all">
                  <Pencil size={13} />
                </button>
                <button onClick={() => deleteStaffConfirmed(s)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {staff.length === 0 && <p className="p-4 text-center text-slate-400 text-xs">No staff yet.</p>}
        </div>
      </div>

      {/* ── Player Form Modal ── */}
      {showPlayerForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPlayerForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{editingPlayerId ? 'Edit Player' : 'Add Player'}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{sport}</p>
              </div>
              <button onClick={() => setShowPlayerForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handlePlayerSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Name (EN) *</label>
                  <input required type="text" value={playerForm.name} onChange={(e) => setPlayerForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Name (AR)</label>
                  <input type="text" dir="rtl" value={playerForm.nameAr} onChange={(e) => setPlayerForm((f) => ({ ...f, nameAr: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jersey # *</label>
                  <input required type="number" value={playerForm.number} onChange={(e) => setPlayerForm((f) => ({ ...f, number: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Position *</label>
                  <select required value={playerForm.position} onChange={(e) => setPlayerForm((f) => ({ ...f, position: e.target.value as Position }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    <option value="">Select position</option>
                    {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nationality</label>
                  <input type="text" value={playerForm.nationality} onChange={(e) => setPlayerForm((f) => ({ ...f, nationality: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Age</label>
                  <input type="number" value={playerForm.age} onChange={(e) => setPlayerForm((f) => ({ ...f, age: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Height</label>
                  <input type="text" placeholder="185 cm" value={playerForm.height} onChange={(e) => setPlayerForm((f) => ({ ...f, height: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Photo du joueur</label>
                <MediaUploader
                  folder={`squad/${sport}/players`}
                  currentUrl={playerForm.image}
                  label="Déposer la photo du joueur ou cliquer pour choisir"
                  onUpload={(file) => setPlayerForm((f) => ({ ...f, image: file.url }))}
                  onRemove={() => setPlayerForm((f) => ({ ...f, image: '' }))}
                  onUploadingChange={setPlayerImageUploading}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stats (up to 3)</label>
                <div className="space-y-2">
                  {([
                    ['statLabel1', 'statValue1'] as const,
                    ['statLabel2', 'statValue2'] as const,
                    ['statLabel3', 'statValue3'] as const,
                  ]).map(([lk, vk]) => (
                    <div key={lk} className="flex gap-2">
                      <input type="text" placeholder={lk === 'statLabel1' ? (sport === 'football' ? 'e.g. Goals' : 'e.g. PPG') : 'Stat name'} value={playerForm[lk]} onChange={(e) => setPlayerForm((f) => ({ ...f, [lk]: e.target.value }))} className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                      <input type="text" placeholder="Value" value={playerForm[vk]} onChange={(e) => setPlayerForm((f) => ({ ...f, [vk]: e.target.value }))} className="w-20 bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Bio</label>
                <textarea rows={3} value={playerForm.bio} onChange={(e) => setPlayerForm((f) => ({ ...f, bio: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <button type="submit" disabled={playerImageUploading} className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2 disabled:cursor-not-allowed disabled:opacity-50">
                {playerImageUploading ? 'Uploading image…' : editingPlayerId ? 'Save Changes' : 'Add Player'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Staff Form Modal ── */}
      {showStaffForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowStaffForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingStaffId ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setShowStaffForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleStaffSubmit} className="p-5 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Name *</label>
                <input required type="text" value={staffForm.name} onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role *</label>
                <input required type="text" placeholder={sport === 'football' ? 'Football Head Coach' : 'Basketball Head Coach'} value={staffForm.role} onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Photo du staff</label>
                <MediaUploader
                  folder={`squad/${sport}/staff`}
                  currentUrl={staffForm.image}
                  label="Déposer la photo du membre du staff ou cliquer pour choisir"
                  onUpload={(file) => setStaffForm((f) => ({ ...f, image: file.url }))}
                  onRemove={() => setStaffForm((f) => ({ ...f, image: '' }))}
                  onUploadingChange={setStaffImageUploading}
                />
              </div>
              <button type="submit" disabled={staffImageUploading} className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2 disabled:cursor-not-allowed disabled:opacity-50">
                {staffImageUploading ? 'Uploading image…' : editingStaffId ? 'Save Changes' : 'Add Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
