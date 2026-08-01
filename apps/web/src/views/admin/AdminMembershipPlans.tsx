'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { api } from '../../lib/api-client';
import { Plus, Edit2, Trash2, Shield, DollarSign, Calendar, ListPlus, CheckCircle2, XCircle, RefreshCw, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MembershipPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  durationDays: number;
  benefits: string[];
  badge?: string;
  color?: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminMembershipPlans() {
  const { showToast } = useApp();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  
  // Form fields
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    durationDays: 365,
    benefitsText: '',
    color: '#0A2540',
    isActive: true,
    displayOrder: 0,
  });

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminMembershipPlans();
      setPlans(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      price: 0,
      durationDays: 365,
      benefitsText: '',
      color: '#0D63FF',
      isActive: true,
      displayOrder: plans.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: Math.round(plan.price / 1000), // convert millimes to TND
      durationDays: plan.durationDays,
      benefitsText: plan.benefits.join('\n'),
      color: plan.color || '#0D63FF',
      isActive: plan.isActive,
      displayOrder: plan.displayOrder,
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.description) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price) * 1000, // convert TND to millimes
        durationDays: Number(form.durationDays),
        benefits: form.benefitsText.split('\n').map(b => b.trim()).filter(Boolean),
        color: form.color,
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder),
      };

      if (editingPlan) {
        await api.updateAdminMembershipPlan(editingPlan._id, payload);
        showToast('Plan d\'abonnement mis à jour !', 'success');
      } else {
        await api.createAdminMembershipPlan(payload);
        showToast('Plan d\'abonnement créé avec succès !', 'success');
      }
      setShowModal(false);
      loadPlans();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: MembershipPlan) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le plan "${plan.name}" ?`)) return;
    try {
      await api.deleteAdminMembershipPlan(plan._id);
      showToast('Plan supprimé !', 'success');
      loadPlans();
    } catch (err: any) {
      alert(err.message || 'Seul un Super Admin peut supprimer des plans d\'abonnement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AdminPageHeader
          title="Plans d'Abonnement"
          description="Créez et configurez les différentes offres d'abonnement pour vos supporters."
        />
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-usm-blue-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 hover:bg-usm-blue-primary/95 cursor-pointer shadow-md transition-all"
        >
          <Plus size={14} /> Nouveau Plan
        </button>
      </div>

      {/* Plans List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs uppercase font-bold text-slate-400">Offres de membresies ({plans.length})</h4>
          <button
            onClick={loadPlans}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {error && (
            <div className="p-6 text-center text-red-500 text-sm">{error}</div>
          )}

          {loading && !error && (
            <div className="p-10 text-center text-slate-400 text-sm animate-pulse">Chargement des offres...</div>
          )}

          {!loading && !error && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Ordre</th>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Prix</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Avantages</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{plan.displayOrder}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: plan.color || '#0D63FF' }} />
                      {plan.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{plan.slug}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {plan.price ? `${Math.round(plan.price / 1000)} TND` : 'Gratuit'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{plan.durationDays} Jours</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {plan.benefits.join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      {plan.isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Actif</span>
                      ) : (
                        <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Inactif</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">Aucun plan d'abonnement configuré.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="text-usm-blue-primary" size={18} />
                {editingPlan ? 'Modifier le Plan' : 'Créer un Plan'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Prix (TND)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Durée (Jours)</label>
                  <input
                    type="number"
                    name="durationDays"
                    value={form.durationDays}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={form.displayOrder}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Avantages (Un par ligne) *</label>
                <textarea
                  name="benefitsText"
                  value={form.benefitsText}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Carte supporter numérique&#10;Accès exclusif Zone Fans"
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-usm-blue-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Couleur Accent (Hex)</label>
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg h-9 p-1 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-slate-200 text-usm-blue-primary cursor-pointer h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-slate-700 font-bold select-none cursor-pointer">Actif</label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded-lg cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
