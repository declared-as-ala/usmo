'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield,
  CheckCircle,
  XCircle,
  KeyRound,
  UserCheck,
  UserX,
  Trash2,
  Activity,
  History,
  Monitor,
  FileText,
  Lock,
  ArrowLeft,
  Smartphone,
  Globe,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';

export const AdminAdministrateurDetailView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isSuperAdmin, showToast } = useApp();

  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'sessions' | 'activity'>('overview');

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDetail(id);
      setAdmin(data);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du chargement des détails', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.revokeAdminSession(id, sessionId);
      showToast('Session révoquée avec succès', 'success');
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la révocation', 'error');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Accès Réservé au Super Administrateur</h2>
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Chargement de la fiche administrateur...</div>;
  }

  if (!admin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-700">Administrateur introuvable</p>
        <button onClick={() => router.push('/admin/administrateurs')} className="mt-4 px-4 py-2 bg-usm-blue-primary text-white text-xs font-bold rounded-xl">
          Retour à la liste
        </button>
      </div>
    );
  }

  const isSuper = admin.role === 'SUPER_ADMIN' || admin.role === 'Super Admin';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/administrateurs')} className="p-2 text-slate-500 hover:bg-white rounded-xl border border-slate-200">
          <ArrowLeft size={16} />
        </button>
        <AdminPageHeader
          title={`Administrateur : ${admin.name}`}
          description={`Profil détaillé, statut, sessions actives et matrice des permissions pour ${admin.email}`}
        />
      </div>

      {/* Admin Summary Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-usm-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-usm-blue-primary/10 text-usm-blue-primary font-bold text-xl flex items-center justify-center border border-usm-blue-primary/20 shrink-0">
            {admin.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-usm-blue-dark">{admin.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isSuper ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {admin.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{admin.email} {admin.phone ? `• ${admin.phone}` : ''}</p>
            <p className="text-[11px] text-slate-400 mt-1">Créé le {new Date(admin.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {admin.isSuspended || admin.status === 'Inactive' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-700">
              <XCircle size={14} /> Compte Suspendu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700">
              <CheckCircle size={14} /> Compte Actif
            </span>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-usm-border gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'overview' ? 'border-usm-blue-primary text-usm-blue-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'permissions' ? 'border-usm-blue-primary text-usm-blue-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Permissions ({isSuper ? 'Toutes' : admin.customPermissions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'sessions' ? 'border-usm-blue-primary text-usm-blue-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sessions Actives ({admin.sessions?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
            <h3 className="font-bold text-sm text-usm-blue-dark border-b border-slate-100 pb-2">Informations Générales</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nom Complet:</span>
                <span className="font-bold text-slate-800">{admin.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800">{admin.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Téléphone:</span>
                <span className="font-bold text-slate-800">{admin.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Rôle RBAC:</span>
                <span className="font-bold text-slate-800">{admin.role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Dernière Connexion IP:</span>
                <span className="font-bold text-slate-800">{admin.lastLoginIp || '127.0.0.1'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
            <h3 className="font-bold text-sm text-usm-blue-dark border-b border-slate-100 pb-2">Sécurité & Activité</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Dernière Connexion:</span>
                <span className="font-bold text-slate-800">
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Statut du Compte:</span>
                <span className="font-bold text-slate-800">{admin.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Compte Suspendu:</span>
                <span className="font-bold text-slate-800">{admin.isSuspended ? 'Oui' : 'Non'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-usm-border space-y-4">
          <h3 className="font-bold text-sm text-usm-blue-dark">Matrice des Permissions Déclarées</h3>
          {isSuper ? (
            <p className="text-xs text-purple-700 bg-purple-50 p-4 rounded-xl border border-purple-200 font-bold">
              Cet administrateur possède le rôle SUPER_ADMIN et dispose de toutes les permissions système sans restriction (*).
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(admin.customPermissions || []).map((perm: string) => (
                <div key={perm} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-mono font-bold text-slate-700">{perm}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-usm-border overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-usm-border">
              <tr>
                <th className="px-5 py-3">Appareil / Navigateur</th>
                <th className="px-5 py-3">Adresse IP</th>
                <th className="px-5 py-3">Dernière Activité</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-usm-border">
              {(!admin.sessions || admin.sessions.length === 0) ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Aucune session active enregistrée.</td>
                </tr>
              ) : (
                admin.sessions.map((sess: any) => (
                  <tr key={sess._id}>
                    <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                      {sess.device === 'Mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                      {sess.browser || 'Navigateur Web'}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{sess.ip}</td>
                    <td className="px-5 py-4 text-slate-400">{new Date(sess.lastActivity).toLocaleString('fr-FR')}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleRevokeSession(sess._id)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 cursor-pointer"
                      >
                        Révoker
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
