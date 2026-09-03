'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  KeyRound,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Copy,
  Shield,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';

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
  const [formRole, setFormRole] = useState<'ADMIN' | 'GESTIONNAIRE_COMMANDES'>('ADMIN');
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

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.inviteAdmin({
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        role: formRole,
      });
      showToast('Compte administrateur créé avec succès', 'success');
      if (res.invitationUrl) {
        const fullUrl = `${window.location.origin}${res.invitationUrl}`;
        setInvitationResultUrl(fullUrl);
      } else {
        setIsInviteOpen(false);
      }
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la création de l'administrateur", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (admin: any) => {
    setSelectedAdmin(admin);
    const rawRole = (admin.role || '').toUpperCase().replace(/[\s_]+/g, '_');
    const r = rawRole === 'GESTIONNAIRE_COMMANDES' ? 'GESTIONNAIRE_COMMANDES' : 'ADMIN';
    setFormRole(r);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
      await api.updateAdminRoleAndPermissions(
        selectedAdmin._id || selectedAdmin.id,
        formRole,
        [],
      );
      showToast('Rôle mis à jour avec succès', 'success');
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
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black text-[#071A30] uppercase tracking-tight font-display">
            Accès refusé
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Cette section et la gestion des administrateurs sont strictement réservées au Super Administrateur de la plateforme.
          </p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const r = (role || '').toUpperCase().replace(/[\s_]+/g, '_');
    if (r === 'SUPER_ADMIN') {
      return {
        label: 'Super Administrateur',
        cls: 'bg-purple-100 text-purple-700 border border-purple-200',
        scope: 'Accès absolu (*)',
      };
    }
    if (r === 'GESTIONNAIRE_COMMANDES') {
      return {
        label: 'Gestionnaire des commandes',
        cls: 'bg-teal-100 text-teal-700 border border-teal-200',
        scope: 'Commandes + Codes promo (lecture)',
      };
    }
    return {
      label: 'Administrateur',
      cls: 'bg-blue-100 text-blue-700 border border-blue-200',
      scope: 'Toutes les fonctionnalités (sauf admins)',
    };
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Gestion des Administrateurs"
        description="Gérez les comptes administratifs et attribuez les rôles système fixes."
        actions={
          <button
            onClick={() => {
              setFormFirstName('');
              setFormLastName('');
              setFormEmail('');
              setFormPhone('');
              setFormRole('ADMIN');
              setInvitationResultUrl(null);
              setIsInviteOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-usm-blue-primary/20 transition-all"
          >
            <Plus size={15} />
            <span>Nouvel Administrateur</span>
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-usm-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">Tous les Rôles</option>
            <option value="SUPER_ADMIN">Super Administrateur</option>
            <option value="ADMIN">Administrateur</option>
            <option value="GESTIONNAIRE_COMMANDES">Gestionnaire des commandes</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none cursor-pointer"
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
                  <th className="px-5 py-3.5">Périmètre d&apos;Accès</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Dernière Connexion</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-usm-border">
                {admins.map((adm) => {
                  const isSuper = adm.role === 'SUPER_ADMIN' || adm.role === 'Super Admin';
                  const badge = getRoleBadge(adm.role);
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-600 font-medium text-xs">
                          {badge.scope}
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
                          {!isSuper && (
                            <button
                              onClick={() => handleOpenEdit(adm)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Modifier le rôle"
                            >
                              <Edit size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleResetAccess(adm)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Réinitialiser l'accès / invitation"
                          >
                            <KeyRound size={15} />
                          </button>
                          {!isSuper && (
                            <>
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
                            </>
                          )}
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

      {/* Invite Modal — Checkboxes completely removed */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-usm-border pb-4">
              <h3 className="text-base font-black text-usm-blue-dark uppercase tracking-tight">
                Créer un compte administrateur
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {invitationResultUrl ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800">Invitation générée avec succès !</h4>
                <p className="text-xs text-slate-500">
                  Transmettez ce lien sécurisé à l&apos;administrateur afin qu&apos;il active son compte :
                </p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <input
                    readOnly
                    value={invitationResultUrl}
                    className="text-xs text-slate-600 bg-transparent flex-1 focus:outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(invitationResultUrl);
                      showToast('Lien copié !', 'success');
                    }}
                    className="px-3 py-1.5 bg-usm-blue-primary text-white text-xs font-bold rounded-lg hover:bg-usm-blue-primary/90 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Copy size={13} /> Copier
                  </button>
                </div>
                <button
                  onClick={() => setIsInviteOpen(false)}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl mt-4 hover:bg-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prénom *</label>
                    <input
                      required
                      placeholder="Prénom"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nom *</label>
                    <input
                      required
                      placeholder="Nom de famille"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email professionnel *</label>
                    <input
                      required
                      type="email"
                      placeholder="nom@usmonastir.com.tn"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                    <input
                      placeholder="Ex: 98 123 456"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle principal *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary cursor-pointer font-semibold text-slate-800"
                  >
                    <option value="ADMIN">Administrateur</option>
                    <option value="GESTIONNAIRE_COMMANDES">Gestionnaire des commandes</option>
                  </select>
                </div>

                {/* Read-only Role Summary */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Info size={13} className="text-usm-blue-primary" />
                    <span>Accès attribués automatiquement</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {formRole === 'GESTIONNAIRE_COMMANDES'
                      ? 'Accès uniquement aux commandes et à la consultation des codes promo.'
                      : 'Accès à toutes les fonctionnalités, sauf la gestion des administrateurs.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-usm-border">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90 transition-all shadow-md shadow-usm-blue-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Génération...' : "Générer l'invitation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Role Modal — Checkboxes completely removed */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-usm-border pb-3">
              <h3 className="font-bold text-usm-blue-dark">
                Modifier le rôle : {selectedAdmin.name}
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle principal</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-usm-blue-primary cursor-pointer font-semibold text-slate-800"
                >
                  <option value="ADMIN">Administrateur</option>
                  <option value="GESTIONNAIRE_COMMANDES">Gestionnaire des commandes</option>
                </select>
              </div>

              {/* Read-only Role Summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Info size={13} className="text-usm-blue-primary" />
                  <span>Accès attribués automatiquement</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {formRole === 'GESTIONNAIRE_COMMANDES'
                    ? 'Accès uniquement aux commandes et à la consultation des codes promo.'
                    : 'Accès à toutes les fonctionnalités, sauf la gestion des administrateurs.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-usm-border">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
