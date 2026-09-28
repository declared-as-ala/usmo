'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import {
  Users,
  Shield,
  ShieldCheck,
  Search,
  Plus,
  Loader2,
  X,
  Trash2,
  Pencil,
  UserCheck,
  UserX,
  CheckCircle,
  Copy,
  Check,
  Eye,
  Download,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Award,
  ExternalLink,
} from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

interface UserAccount {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | string;
  status: 'Active' | 'Inactive' | string;
  isSuspended?: boolean;
  phone?: string;
  city?: string;
  createdAt: string;
  internalNotes?: string;
  favoriteSport?: 'football' | 'basketball' | string;
  favoritePlayer?: string;
  bluePoints?: number;
  membershipSummary?: {
    status?: string;
    planName?: string;
    endDate?: string;
  } | null;
}

export default function AdminUsers() {
  const { isSuperAdmin, showToast } = useApp();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // View Detailed Fan Profile Modal
  const [viewingFan, setViewingFan] = useState<UserAccount | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [fanNote, setFanNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Edit / Role Change Modal
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [editRole, setEditRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'USER'>('USER');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Invite Admin Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'USER'>('USER');
  const [inviteResultUrl, setInviteResultUrl] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers({ search, status: statusFilter });
      setUsers(data || []);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des supporters', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleOpenFanDetail = async (u: UserAccount) => {
    setViewingLoading(true);
    setViewingFan({ ...u });
    setFanNote(u.internalNotes || '');
    try {
      const detail = await api.getAdminFanDetail(u._id);
      if (detail) {
        setViewingFan(detail);
        setFanNote(detail.internalNotes || '');
      }
    } catch {
      // keep basic info
    } finally {
      setViewingLoading(false);
    }
  };

  const handleSaveFanNote = async () => {
    if (!viewingFan) return;
    setSavingNote(true);
    try {
      await api.updateAdminUserNotes(viewingFan._id, fanNote);
      showToast('Note administrative enregistrée', 'success');
      setViewingFan((prev) => (prev ? { ...prev, internalNotes: fanNote } : null));
      setUsers((prev) => prev.map((f) => (f._id === viewingFan._id ? { ...f, internalNotes: fanNote } : f)));
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde de la note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleStatus = (u: UserAccount) => {
    const isCurrentlyActive = u.status === 'Active' && !u.isSuspended;
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    requestConfirmation({
      title: isCurrentlyActive ? 'Suspendre ce supporter ?' : 'Réactiver ce supporter ?',
      message: `${u.name} (${u.email}) ${isCurrentlyActive ? 'ne pourra plus accéder à son compte supporter.' : 'pourra à nouveau accéder à son compte supporter.'}`,
      confirmLabel: isCurrentlyActive ? 'Suspendre' : 'Réactiver',
      onConfirm: async () => {
        try {
          await api.updateAdminFanStatus(u._id, nextStatus);
          showToast(`Statut de ${u.name} mis à jour (${nextStatus === 'Active' ? 'Actif' : 'Suspendu'})`, 'success');
          setUsers((prev) =>
            prev.map((item) =>
              item._id === u._id
                ? { ...item, status: nextStatus, isSuspended: nextStatus === 'Inactive' }
                : item,
            ),
          );
          if (viewingFan && viewingFan._id === u._id) {
            setViewingFan({ ...viewingFan, status: nextStatus, isSuspended: nextStatus === 'Inactive' });
          }
        } catch (err: any) {
          showToast(err.message || 'Erreur lors du changement de statut', 'error');
        }
      },
    });
  };

  const handleDeleteUser = (u: UserAccount) => {
    requestConfirmation({
      title: 'Supprimer ce compte supporter ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${u.name} (${u.email}) ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer définitivement',
      onConfirm: async () => {
        try {
          await api.deleteAdminUser(u._id);
          showToast(`Compte de ${u.name} supprimé avec succès`, 'success');
          loadUsers();
          if (viewingFan && viewingFan._id === u._id) {
            setViewingFan(null);
          }
        } catch (err: any) {
          showToast(err.message || 'Erreur lors de la suppression', 'error');
        }
      },
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      if (editName !== selectedUser.name || editEmail !== selectedUser.email) {
        await api.updateAdminProfile(selectedUser._id, { name: editName, email: editEmail });
      }
      if (editRole !== selectedUser.role) {
        await api.updateAdminRole(selectedUser._id, editRole, editRole === 'SUPER_ADMIN' ? ['*'] : []);
      }
      if (notes !== selectedUser.internalNotes) {
        await api.updateAdminUserNotes(selectedUser._id, notes);
      }
      showToast(`Compte de ${editName} mis à jour avec succès`, 'success');
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setInviting(true);
    try {
      const parts = inviteName.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const res = await api.createAdminInvitation({
        firstName,
        lastName,
        email: inviteEmail,
        role: inviteRole,
        permissions: inviteRole === 'SUPER_ADMIN' ? ['*'] : [],
      });
      setInviteResultUrl(res.invitationUrl);
      showToast('Compte créé et invitation générée !', 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteResultUrl) return;
    navigator.clipboard.writeText(inviteResultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (users.length === 0) {
      showToast('Aucun supporter à exporter', 'info');
      return;
    }
    const headers = ['Nom', 'Email', 'Téléphone', 'Ville', 'Statut Compte', 'Adhésion', 'Date Inscription'];
    const rows = users.map((u) => [
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.city || ''}"`,
      `"${u.status === 'Active' && !u.isSuspended ? 'Actif' : 'Suspendu'}"`,
      `"${u.membershipSummary?.planName || 'Non-adhérent'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supporters_usm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé', 'success');
  };

  // KPI Calculations
  const activeCount = users.filter((u) => u.status === 'Active' && !u.isSuspended).length;
  const suspendedCount = users.length - activeCount;
  const thisMonthCount = users.filter((u) => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Membres & Comptes Supporters (Fans)"
        description="Consultez et pilotez l'ensemble des supporters et fans inscrits : coordonnées, statut de compte, cartes d'adhésion et fiches individuelles."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs"
              title="Exporter au format CSV"
            >
              <Download size={14} /> Exporter CSV
            </button>
            <button
              onClick={() => {
                setInviteName('');
                setInviteEmail('');
                setInviteRole('USER');
                setInviteResultUrl(null);
                setShowInviteModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <Plus size={14} /> Créer un Compte
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Fans Inscrits" value={users.length} icon={Users} accent="blue" />
        <StatCard label="Comptes Actifs" value={activeCount} icon={ShieldCheck} accent="emerald" />
        <StatCard label="Comptes Suspendus" value={suspendedCount} icon={UserX} accent="amber" />
        <StatCard label="Inscrits ce mois" value={thisMonthCount} icon={Calendar} accent="violet" />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2.5 pl-9 pr-3 outline-none focus:border-usm-blue-primary shadow-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-usm-blue-primary shadow-xs"
        >
          <option value="">Tous les statuts</option>
          <option value="Active">Actif uniquement</option>
          <option value="Inactive">Suspendu uniquement</option>
        </select>
      </div>

      {/* Main Fans & Members Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Supporter</th>
                <th className="py-3.5 px-4">Coordonnées</th>
                <th className="py-3.5 px-4">Carte / Adhésion</th>
                <th className="py-3.5 px-4">Statut Compte</th>
                <th className="py-3.5 px-4">Date d&apos;Inscription</th>
                <th className="py-3.5 px-5 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 size={20} className="animate-spin inline-block mr-2" />
                    Chargement des comptes supporters...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun supporter trouvé pour ces critères de recherche.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = u.status === 'Active' && !u.isSuspended;
                  const membership = u.membershipSummary;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-5">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => handleOpenFanDetail(u)}
                        >
                          <div className="w-8 h-8 rounded-full bg-usm-blue-primary/10 text-usm-blue-primary font-bold flex items-center justify-center shrink-0 border border-usm-blue-primary/20 group-hover:scale-105 transition-transform">
                            {u.name ? u.name.substring(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-usm-blue-primary transition-colors flex items-center gap-1.5">
                              {u.name || 'Supporter'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {u.phone ? (
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <Phone size={11} className="text-slate-400" />
                              {u.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Téléphone non renseigné</span>
                          )}
                          {u.city && (
                            <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                              <MapPin size={10} className="text-slate-400" />
                              {u.city}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {membership?.planName ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Crown size={11} className="text-amber-600" />
                            {membership.planName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            <Shield size={11} className="text-slate-400" />
                            Supporter
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {isActive ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-3 px-5 text-right rtl:text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenFanDetail(u)}
                            className="p-1.5 text-slate-500 hover:text-usm-blue-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Voir la fiche détaillée du supporter"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditRole(u.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : u.role === 'ADMIN' ? 'ADMIN' : 'USER');
                              setEditName(u.name || '');
                              setEditEmail(u.email || '');
                              setNotes(u.internalNotes || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-usm-blue-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier nom, rôle & notes"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Suspendre le compte' : 'Réactiver le compte'}
                          >
                            {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer définitivement"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fan Details Drawer / Modal */}
      {viewingFan && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingFan(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-usm-blue-primary text-white font-black flex items-center justify-center shadow-xs">
                  {viewingFan.name ? viewingFan.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewingFan.name || 'Supporter'}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{viewingFan.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingFan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {viewingLoading && (
                <div className="flex items-center justify-center py-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Actualisation des données du supporter...
                </div>
              )}

              {/* Status and Membership Header Card */}
              <div className="p-4 bg-gradient-to-r from-usm-blue-dark/5 to-usm-blue-primary/10 rounded-2xl border border-usm-blue-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Statut du compte</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      viewingFan.status === 'Active' && !viewingFan.isSuspended
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {viewingFan.status === 'Active' && !viewingFan.isSuspended ? 'Compte Actif' : 'Compte Suspendu'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(viewingFan)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs ${
                    viewingFan.status === 'Active' && !viewingFan.isSuspended
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {viewingFan.status === 'Active' && !viewingFan.isSuspended ? 'Suspendre' : 'Réactiver'}
                </button>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Phone size={11} /> Téléphone
                  </span>
                  <p className="font-semibold text-slate-800 font-mono">
                    {viewingFan.phone || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <MapPin size={11} /> Ville / Région
                  </span>
                  <p className="font-semibold text-slate-800">
                    {viewingFan.city || 'Non renseignée'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Calendar size={11} /> Inscription
                  </span>
                  <p className="font-semibold text-slate-800">
                    {viewingFan.createdAt ? new Date(viewingFan.createdAt).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Award size={11} /> Points Bleus (Loyalty)
                  </span>
                  <p className="font-semibold text-usm-blue-primary font-mono text-sm">
                    {viewingFan.bluePoints ?? 0} pts
                  </p>
                </div>
              </div>

              {/* Membership Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-500" />
                    Carte de Membre & Adhésion
                  </span>
                  {viewingFan.membershipSummary?.status && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {viewingFan.membershipSummary.status}
                    </span>
                  )}
                </div>

                {viewingFan.membershipSummary ? (
                  <div className="space-y-1 text-slate-700">
                    <p>
                      <strong>Formule :</strong> {viewingFan.membershipSummary.planName || 'Adhésion Club'}
                    </p>
                    {viewingFan.membershipSummary.endDate && (
                      <p className="text-slate-500 text-[11px]">
                        <strong>Valide jusqu&apos;au :</strong>{' '}
                        {new Date(viewingFan.membershipSummary.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Aucune carte d&apos;adhésion active enregistrée pour ce supporter.
                  </p>
                )}
              </div>

              {/* Fan Preferences */}
              {(viewingFan.favoriteSport || viewingFan.favoritePlayer) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Préférences Sportives
                  </span>
                  <div className="flex flex-wrap gap-2 text-slate-700">
                    {viewingFan.favoriteSport && (
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold">
                        Sport favori : {viewingFan.favoriteSport === 'basketball' ? '🏀 Basketball' : '⚽ Football'}
                      </span>
                    )}
                    {viewingFan.favoritePlayer && (
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold">
                        Joueur favori : {viewingFan.favoritePlayer}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Internal Admin Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">
                  Notes internes d&apos;administration (visibles uniquement par le staff)
                </label>
                <textarea
                  rows={3}
                  value={fanNote}
                  onChange={(e) => setFanNote(e.target.value)}
                  placeholder="Notes sur les commandes, réservations, comportement, etc..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-usm-blue-primary focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSaveFanNote}
                  disabled={savingNote}
                  className="px-3.5 py-1.5 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {savingNote ? 'Enregistrement...' : 'Enregistrer la note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role & Name Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Modifier {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom Complet</label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:border-usm-blue-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse Email</label>
                <input
                  required
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:border-usm-blue-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle Système</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:border-usm-blue-primary"
                >
                  <option value="USER">USER (Supporter / Fan)</option>
                  <option value="ADMIN">ADMIN (Administrateur)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrateur)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes Internes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter une note administrative sur cet utilisateur..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90 cursor-pointer transition-colors"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite / Create User Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Créer un Compte Supporter / Utilisateur</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {inviteResultUrl ? (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Compte créé et invitation générée !
                  </div>
                  <p className="text-[11px]">
                    Envoyez ce lien au supporter afin qu&apos;il définisse son mot de passe :
                  </p>
                  <div className="p-2 bg-white rounded-xl border border-emerald-300 font-mono text-[10px] break-all select-all">
                    {inviteResultUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-700 cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Lien Copié !' : 'Copier le Lien d\'Invitation'}
                  </button>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom Complet *</label>
                  <input
                    required
                    type="text"
                    placeholder="ex: Mohamed Ali"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Adresse Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="supporter@usmonastir.com.tn"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                  >
                    <option value="USER">USER (Supporter / Fan)</option>
                    <option value="ADMIN">ADMIN (Administrateur)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrateur)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full py-3 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90 cursor-pointer transition-colors"
                >
                  {inviting ? 'Création...' : 'Créer et Générer Invitation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
