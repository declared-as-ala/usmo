'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { Plus, X, Trash2, Pencil, Loader2, AlertCircle, Percent, Check, Eye } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';
import { useApp } from '../../context/AppContext';

interface DiscountCode {
  _id: string;
  code: string;
  label: string;
  discountPercent: number;
  active: boolean;
  usedCount: number;
  maxUses?: number | null;
  expiresAt?: string | null;
}

const emptyForm = {
  code: '',
  label: '',
  discountPercent: 10,
  active: true,
  maxUses: '',
  expiresAt: '',
};

export default function AdminDiscountCodes() {
  const { isOrderManager } = useApp();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getDiscountCodes();
      setCodes(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (code: DiscountCode) => {
    setEditingId(code._id);
    setForm({
      code: code.code,
      label: code.label,
      discountPercent: code.discountPercent,
      active: code.active,
      maxUses: code.maxUses ? String(code.maxUses) : '',
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        label: form.label.trim(),
        discountPercent: Math.min(100, Math.max(0, Number(form.discountPercent))),
        active: form.active,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (editingId) {
        await api.updateDiscountCode(editingId, payload);
      } else {
        await api.createDiscountCode(payload);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (code: DiscountCode) => {
    requestConfirmation({
      title: 'Supprimer ce code promo ?',
      message: `Le code « ${code.code} » sera supprimé définitivement.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await api.deleteDiscountCode(code._id);
          load();
        } catch (err: any) {
          setError(err.message || 'Erreur lors de la suppression');
        }
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Codes Promo"
        description="Gérez les codes de réduction utilisables sur la boutique."
        actions={
          isOrderManager ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold rounded-xl shadow-xs">
              <Eye size={14} />
              <span>Consultation seule (Gestionnaire)</span>
            </div>
          ) : (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <Plus size={14} /> Ajouter un code
            </button>
          )
        }
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-usm-border overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-usm-blue-dark">
                {editingId ? 'Modifier le code' : 'Nouveau code promo'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Code *</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="ex: USM10"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Libellé *</label>
                <input
                  required
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="ex: Réduction 10%"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Réduction (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={form.discountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Percent size={14} /></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Utilisations max</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Illimité"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d'expiration</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-usm-blue-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-slate-700 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="size-4 accent-usm-blue-primary"
                />
                Actif
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90 cursor-pointer transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-usm-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-usm-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-4">Libellé</th>
                <th className="py-3.5 px-4">Réduction</th>
                <th className="py-3.5 px-4">Utilisations</th>
                <th className="py-3.5 px-4">Expiration</th>
                <th className="py-3.5 px-4">Statut</th>
                {!isOrderManager && <th className="py-3.5 px-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-usm-border">
              {loading ? (
                <tr>
                  <td colSpan={isOrderManager ? 6 : 7} className="py-12 text-center text-slate-400">
                    <Loader2 size={20} className="animate-spin inline-block mr-2" />
                    Chargement…
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={isOrderManager ? 6 : 7} className="py-12 text-center text-slate-400">
                    Aucun code promo configuré.
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-slate-900 uppercase bg-slate-100 px-2 py-1 rounded-lg">{c.code}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.label}</td>
                    <td className="py-3 px-4 font-bold text-usm-blue-primary">{c.discountPercent}%</td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {!isOrderManager && (
                      <td className="py-3 px-5 text-right rtl:text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-usm-blue-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
