'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  KeyRound,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Copy,
  Mail,
  Shield,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';

const AVAILABLE_PERMISSIONS = [
  { group: 'Admin Management', perms: ['admins.view', 'admins.create', 'admins.edit', 'admins.delete', 'admins.assign_roles', 'admins.assign_permissions'] },
  { group: 'Users & Fans', perms: ['users.view', 'users.edit', 'users.suspend', 'users.export'] },
  { group: 'Boutique & Products', perms: ['products.view', 'products.create', 'products.edit', 'products.delete'] },
  { group: 'Orders', perms: ['orders.view', 'orders.edit', 'orders.confirm', 'orders.cancel', 'orders.export'] },
  { group: 'Newsroom', perms: ['news.view', 'news.create', 'news.edit', 'news.publish', 'news.delete'] },
  { group: 'Media Portal', perms: ['media.view', 'media.upload', 'media.edit', 'media.delete', 'media.publish'] },
  { group: 'Analytics', perms: ['analytics.view', 'analytics.export'] },
  { group: 'Settings & Security', perms: ['settings.view', 'settings.edit', 'security.audit_logs', 'security.login_history', 'security.sessions'] },
];

export const AdminAdministrateursView: React.FC = () => {
  const { isSuperAdmin, showToast } = useApp();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [invitationResultUrl, setInvitationResultUrl] = useState<string | null>(null);

  // Form states
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('ADMIN');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await api.getAdministrateurs({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setAdmins(data || []);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des administrateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search, roleFilter, statusFilter]);

  const handleTogglePermission = (perm: string) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.inviteAdmin({
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        permissions: formPermissions,
      });
      showToast('Administrateur créé avec succès', 'success');
      if (res.invitationUrl) {
        const fullUrl = `${window.location.origin}${res.invitationUrl}`;
        setInvitationResultUrl(fullUrl);
      } else {
        setIsInviteOpen(false);
      }
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de l\'administrateur', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (admin: any) => {
    setSelectedAdmin(admin);
    setFormRole(admin.role);
    setFormPermissions(admin.customPermissions || []);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
      await api.updateAdminRoleAndPermissions(selectedAdmin._id || selectedAdmin.id, formRole, formPermissions);
      showToast('Rôle et permissions mis à jour avec succès', 'success');
      setIsEditOpen(false);
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspendToggle = async (admin: any) => {
    const newStatus = !admin.isSuspended;
    try {
      await api.suspendOrReactivateAdmin(admin._id || admin.id, newStatus);
      showToast(
        newStatus ? 'Administrateur suspendu' : 'Administrateur réactivé',
        'success',
      );
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || 'Action impossible', 'error');
    }
  };

  const handleResetAccess = async (admin: any) => {
    try {
      const res = await api.resetAdminAccess(admin._id || admin.id);
      if (res.resetUrl) {
        const fullUrl = `${window.location.origin}${res.resetUrl}`;
        navigator.clipboard.writeText(fullUrl);
        showToast('Lien de réinitialisation copié dans le presse-papier !', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur de réinitialisation', 'error');
    }
  };

  const handleDeleteAdmin = async (admin: any) => {
    if (!confirm(`Voulez-vous vraiment supprimer l'administrateur ${admin.name} ?`)) return;
    try {
      await api.deleteAdmin(admin._id || admin.id);
      showToast('Administrateur supprimé', 'success');
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || 'Erreur de suppression', 'error');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Accès Réservé au Super Administrateur</h2>
        <p className="text-sm text-slate-500 mt-1">Vous n'avez pas les permissions requises pour gérer les administrateurs de la plateforme.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Gestion des Administrateurs"
        description="Gérez les comptes administratifs, assignez les rôles RBAC, définissez les permissions explicites et suivez la sécurité."
        actions={
          <button
            onClick={() => {
              setFormFirstName('');
              setFormLastName('');
              setFormEmail('');
              setFormPhone('');
              setFormRole('ADMIN');
              setFormPermissions([]);
              setInvitationResultUrl(null);
              setIsInviteOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={14} /> Nouvel Administrateur
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-usm-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-usm-blue-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
          >
            <option value="">Tous les Rôles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Normal Admin</option>
            <option value="BOUTIQUE_ADMIN">Boutique Admin</option>
            <option value="ORDER_ADMIN">Order Admin</option>
            <option value="MEDIA_ADMIN">Media Admin</option>
            <option value="CONTENT_ADMIN">Content Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
          >
            <option value="">Tous les Statuts</option>
            <option value="Active">Actif</option>
            <option value="Inactive">Suspendu</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-usm-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Chargement des administrateurs...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Aucun administrateur trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-usm-border">
                <tr>
                  <th className="px-5 py-3.5">Administrateur</th>
                  <th className="px-5 py-3.5">Rôle</th>
                  <th className="px-5 py-3.5">Permissions Explicites</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Dernière Connexion</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-usm-border">
                {admins.map((adm) => {
                  const isSuper = adm.role === 'SUPER_ADMIN' || adm.role === 'Super Admin';
                  return (
                    <tr key={adm._id || adm.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-usm-blue-primary/10 text-usm-blue-primary font-bold flex items-center justify-center shrink-0 border border-usm-blue-primary/20">
                            {adm.name?.substring(0, 2).toUpperCase() || 'AD'}
                          </div>
                          <div>
                            <p className="font-bold text-usm-blue-dark">{adm.name}</p>
                            <p className="text-[11px] text-slate-400">{adm.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isSuper
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {adm.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-500 font-medium">
                          {isSuper
                            ? 'Toutes (*)'
                            : (adm.customPermissions?.length || 0) + ' permissions'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {adm.isSuspended || adm.status === 'Inactive' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3" /> Suspendu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Actif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {adm.lastLogin
                          ? new Date(adm.lastLogin).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Jamais'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/administrateurs/${adm._id || adm.id}`}
                            className="p-1.5 text-slate-500 hover:text-usm-blue-primary hover:bg-usm-blue-soft rounded-lg transition-colors"
                            title="Voir la fiche complète"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(adm)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier rôle & permissions"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleResetAccess(adm)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Réinitialiser l'accès / invitation"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            onClick={() => handleSuspendToggle(adm)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              adm.isSuspended
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={adm.isSuspended ? 'Réactiver' : 'Suspendre'}
                          >
                            {adm.isSuspended ? <UserCheck size={15} /> : <UserX size={15} />}
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(adm)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-usm-border pb-4">
              <h3 className="text-base font-bold text-usm-blue-dark">Créer un Compte Administrateur</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {invitationResultUrl ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800">Invitation Générée avec Succès !</h4>
                <p className="text-xs text-slate-500">Transmettez ce lien sécurisé à l'administrateur afin qu'il définisse son mot de passe :</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <input readOnly value={invitationResultUrl} className="text-xs text-slate-600 bg-transparent flex-1 focus:outline-none" />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(invitationResultUrl);
                      showToast('Lien copié !', 'success');
                    }}
                    className="px-3 py-1.5 bg-usm-blue-primary text-white text-xs font-bold rounded-lg hover:bg-usm-blue-primary/90 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={13} /> Copier
                  </button>
                </div>
                <button onClick={() => setIsInviteOpen(false)} className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl mt-4 cursor-pointer">
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAdmin} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prénom *</label>
                    <input required value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nom *</label>
                    <input required value={formLastName} onChange={(e) => setFormLastName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Professionnel *</label>
                    <input required type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Téléphone (Optionnel)</label>
                    <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle Principal *</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary">
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Accès Total)</option>
                    <option value="ADMIN">ADMIN (Normal Admin)</option>
                    <option value="BOUTIQUE_ADMIN">BOUTIQUE_ADMIN</option>
                    <option value="ORDER_ADMIN">ORDER_ADMIN</option>
                    <option value="MEDIA_ADMIN">MEDIA_ADMIN</option>
                    <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                    <option value="SPONSOR_ADMIN">SPONSOR_ADMIN</option>
                    <option value="ANALYST">ANALYST</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-2">Permissions Granulaires Explicites</label>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((group) => (
                      <div key={group.group}>
                        <p className="font-bold text-[11px] text-slate-500 uppercase tracking-wide mb-1">{group.group}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {group.perms.map((p) => (
                            <label key={p} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={formPermissions.includes(p)} onChange={() => handleTogglePermission(p)} className="rounded text-usm-blue-primary" />
                              <span className="text-[11px] font-mono text-slate-600">{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-usm-border">
                  <button type="button" onClick={() => setIsInviteOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90">
                    {submitting ? 'Création...' : 'Générer l\'Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Role & Permissions Modal */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-usm-border pb-3">
              <h3 className="font-bold text-usm-blue-dark">Modifier Rôle & Permissions : {selectedAdmin.name}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle Principal</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary">
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Accès Total)</option>
                  <option value="ADMIN">ADMIN (Normal Admin)</option>
                  <option value="BOUTIQUE_ADMIN">BOUTIQUE_ADMIN</option>
                  <option value="ORDER_ADMIN">ORDER_ADMIN</option>
                  <option value="MEDIA_ADMIN">MEDIA_ADMIN</option>
                  <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                  <option value="SPONSOR_ADMIN">SPONSOR_ADMIN</option>
                  <option value="ANALYST">ANALYST</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Permissions Granulaires</label>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((group) => (
                    <div key={group.group}>
                      <p className="font-bold text-[11px] text-slate-500 uppercase tracking-wide mb-1">{group.group}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.perms.map((p) => (
                          <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formPermissions.includes(p)} onChange={() => handleTogglePermission(p)} className="rounded text-usm-blue-primary" />
                            <span className="text-[11px] font-mono text-slate-600">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-usm-border">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
