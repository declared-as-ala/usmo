'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { MapPin, Plus, Loader2, Trash2, Star, X } from 'lucide-react';

interface Address {
  _id: string;
  label: string;
  recipientName: string;
  phone: string;
  city: string;
  addressLine: string;
  isDefault: boolean;
}

const EMPTY_FORM = { label: 'Domicile', recipientName: '', phone: '', city: '', addressLine: '', isDefault: false };

export default function MyAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAddresses = async () => {
    try {
      const data = await api.getMyAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api.getMyAddresses()
      .then((data) => { if (active) setAddresses(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setAddresses([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientName || !form.phone || !form.city || !form.addressLine) return;
    setSaving(true);
    try {
      await api.createAddress(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchAddresses();
    } catch {
      // no-op, keep form open for retry
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setAddresses((prev) => prev.filter((a) => a._id !== id));
    try {
      await api.deleteAddress(id);
    } catch {
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.updateAddress(id, { isDefault: true });
      fetchAddresses();
    } catch {
      // no-op
    }
  };

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mes Adresses</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Gérez vos adresses de livraison pour la boutique officielle.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors shrink-0"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="usm-card border border-usm-border p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Libellé (ex: Domicile, Bureau)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
            />
            <input
              placeholder="Nom du destinataire"
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              required
              className="text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
            />
            <input
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
            />
            <input
              placeholder="Ville"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
              className="text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
            />
            <textarea
              placeholder="Adresse complète"
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              required
              rows={2}
              className="sm:col-span-2 text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary resize-none"
            />
          </div>
          <label className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Définir comme adresse par défaut
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Enregistrer l&apos;adresse
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <div key={a._id} className="usm-card border border-usm-border p-4 space-y-2 relative">
              {a.isDefault && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] bg-usm-accent-gold/20 text-usm-accent-gold px-2 py-0.5 rounded-md font-bold uppercase">
                  <Star size={10} className="fill-current" /> Défaut
                </span>
              )}
              <p className="text-xs font-black text-usm-blue-dark uppercase tracking-wider">{a.label}</p>
              <p className="text-xs text-slate-600 font-semibold">{a.recipientName} · {a.phone}</p>
              <p className="text-[11px] text-slate-500">{a.addressLine}, {a.city}</p>
              <div className="flex items-center gap-3 pt-1">
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a._id)}
                    className="text-[10px] font-bold text-usm-blue-primary hover:underline"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a._id)}
                  className="text-[10px] font-bold text-red-500 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 size={11} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <MapPin size={16} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-usm-blue-dark">Aucune adresse enregistrée</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Ajoutez une adresse pour accélérer vos futures commandes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
