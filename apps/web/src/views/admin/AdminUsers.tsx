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
  ShieldAlert,
  Search,
  Plus,
  Loader2,
  X,
  Trash2,
  Pencil,
  FileText,
  UserCheck,
  UserX,
  CheckCircle,
  KeyRound,
  Copy,
  Check,
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
}

export default function AdminUsers() {
  const { isSuperAdmin, showToast } = useApp();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Edit / Role Change Modal
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [editRole, setEditRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'USER'>('USER');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Invite Admin Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'USER'>('ADMIN');
  const [inviteResultUrl, setInviteResultUrl] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers({ search, role: roleFilter, status: statusFilter });
      setUsers(data || []);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleToggleStatus = (u: UserAccount) => {
    const isCurrentlyActive = u.status === 'Active' && !u.isSuspended;
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    requestConfirmation({
      title: isCurrentlyActive ? 'Suspendre cet utilisateur ?' : 'Réactiver cet utilisateur ?',
      message: `${u.name} (${u.email}) ${isCurrentlyActive ? 'ne pourra plus accéder à son compte.' : 'pourra à nouveau accéder à son compte.'}`,
      confirmLabel: isCurrentlyActive ? 'Suspendre' : 'Réactiver',
      onConfirm: async () => {
        try {
          await api.updateAdminFanStatus(u._id, nextStatus);
          showToast(`Statut de ${u.name} mis à jour (${nextStatus})`, 'success');
          loadUsers();
        } catch (err: any) {
          showToast(err.message || 'Erreur lors du changement de statut', 'error');
        }
      },
    });
  };

  const handleDeleteUser = (u: UserAccount) => {
    requestConfirmation({
      title: 'Supprimer cet utilisateur ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${u.name} (${u.email}) ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer définitivement',
      onConfirm: async () => {
        try {
          await api.deleteAdminUser(u._id);
          showToast(`Compte de ${u.name} supprimé avec succès`, 'success');
          loadUsers();
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
      await api.updateAdminRole(selectedUser._id, editRole, editRole === 'SUPER_ADMIN' ? ['*'] : []);
      if (notes !== selectedUser.internalNotes) {
        await api.updateAdminUserNotes(selectedUser._id, notes);
      }
      showToast(`Utilisateur ${selectedUser.name} mis à jour avec le rôle ${editRole}`, 'success');
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

  // KPI Calculations
  const superAdminCount = users.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'Super Admin').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'Admin').length;
  const userCount = users.filter((u) => u.role === 'USER' || u.role === 'User' || u.role === 'Fan' || u.role === 'Customer').length;

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Gestion des Utilisateurs"
        description="Gérez l'ensemble des comptes de la plateforme : Super Administrateurs, Administrateurs et Supporters."
        actions={
          <button
            onClick={() => {
              setInviteName('');
              setInviteEmail('');
              setInviteRole('ADMIN');
              setInviteResultUrl(null);
              setShowInviteModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={14} /> Créer / Inviter Utilisateur
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Utilisateurs" value={users.length} icon={Users} accent="blue" />
        <StatCard label="Super Admins" value={superAdminCount} icon={ShieldAlert} accent="violet" />
        <StatCard label="Administrateurs" value={adminCount} icon={ShieldCheck} accent="slate" />
        <StatCard label="Supporters / Fans" value={userCount} icon={Shield} accent="emerald" />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2.5 pl-9 pr-3 outline-none focus:border-usm-blue-primary shadow-xs"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-usm-blue-primary shadow-xs"
        >
          <option value="">Tous les rôles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Supporter / Fan</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-usm-blue-primary shadow-xs"
        >
          <option value="">Tous les statuts</option>
          <option value="Active">Actif</option>
          <option value="Inactive">Suspendu</option>
        </select>
      </div>

      {/* Main Users Table */}
      <div className="bg-white border border-usm-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-usm-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Nom & Email</th>
                <th className="py-3.5 px-4">Rôle</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date d'Inscription</th>
                <th className="py-3.5 px-5 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-usm-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 size={20} className="animate-spin inline-block mr-2" />
                    Chargement des comptes utilisateurs...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Aucun utilisateur trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuper = u.role === 'SUPER_ADMIN' || u.role === 'Super Admin';
                  const isAdmin = u.role === 'ADMIN' || u.role === 'Admin';
                  const isActive = u.status === 'Active' && !u.isSuspended;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-usm-blue-primary/10 text-usm-blue-primary font-bold flex items-center justify-center shrink-0 border border-usm-blue-primary/20">
                            {u.name ? u.name.substring(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name || 'Utilisateur'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isSuper
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : isAdmin
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isSuper ? 'Super Admin' : isAdmin ? 'Admin' : 'Supporter / Fan'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {isActive ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-3 px-5 text-right rtl:text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditRole(
                                isSuper ? 'SUPER_ADMIN' : isAdmin ? 'ADMIN' : 'USER'
                              );
                              setNotes(u.internalNotes || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-usm-blue-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier rôle & notes"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Suspendre' : 'Réactiver'}
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

      {/* Edit Role & Notes Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-usm-border overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-usm-border bg-slate-50">
              <h3 className="text-sm font-bold text-usm-blue-dark">Gérer {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle Système (Permission)</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:border-usm-blue-primary"
                >
                  <option value="USER">USER (Supporter / Fan)</option>
                  <option value="ADMIN">ADMIN (Administrateur)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrateur)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  • <strong>SUPER_ADMIN</strong> : Accès total et exclusif à la gestion des administrateurs.<br />
                  • <strong>ADMIN</strong> : Accès administratif complet aux modules.<br />
                  • <strong>USER</strong> : Compte public supporter (aucun accès dashboard).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes Internes d'Administration</label>
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
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-usm-border overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-usm-border bg-slate-50">
              <h3 className="text-sm font-bold text-usm-blue-dark">Créer / Inviter un Utilisateur</h3>
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
                    Envoyez ce lien à l'utilisateur afin qu'il définisse son mot de passe :
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
                    placeholder="utilisateur@usmonastir.com.tn"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle Attribué</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                  >
                    <option value="ADMIN">ADMIN (Administrateur)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Super Administrateur)</option>
                    <option value="USER">USER (Supporter / Fan)</option>
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
