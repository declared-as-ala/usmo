'use client';

import React, { useState } from 'react';
import { api } from '../../../lib/api-client';
import { useApp } from '../../../context/AppContext';
import { Shield, Loader2, CheckCircle2, KeyRound } from 'lucide-react';

export default function MySecurityPage() {
  const { fan } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Impossible de modifier le mot de passe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
          <Shield size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Sécurité du compte</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Gérez votre mot de passe et les informations de connexion de votre compte.</p>
        </div>
      </div>

      <div className="usm-card border border-usm-border p-5 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Adresse email</p>
        <p className="text-xs font-bold text-usm-blue-dark">{fan?.email || '-'}</p>
      </div>

      <form onSubmit={handleSubmit} className="usm-card border border-usm-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={15} className="text-usm-blue-primary" />
          <h4 className="text-xs font-black text-usm-blue-dark uppercase tracking-wider">Changer le mot de passe</h4>
        </div>

        {error && (
          <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
            <CheckCircle2 size={14} /> Mot de passe mis à jour avec succès.
          </div>
        )}

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
          />
          <input
            type="password"
            placeholder="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
          Mettre à jour le mot de passe
        </button>
      </form>
    </div>
  );
}
