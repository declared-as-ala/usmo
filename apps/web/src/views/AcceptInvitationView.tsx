'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Common/Logo';
import { api } from '../lib/api-client';

export const AcceptInvitationView: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.acceptAdminInvitation(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Invitation invalide ou expirée.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-usm-border p-8 max-w-md w-full shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <Logo size={48} className="mx-auto" />
          <h1 className="text-xl font-bold text-usm-blue-dark">Activation de Compte Administrateur</h1>
          <p className="text-xs text-slate-500">Union Sportive Monastirienne • Plateforme Officielle</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Mot de passe défini avec succès !</h2>
            <p className="text-xs text-slate-500">Votre compte administrateur est maintenant actif. Vous pouvez vous connecter à la plateforme.</p>
            <button
              onClick={() => router.push('/admin')}
              className="w-full py-2.5 bg-usm-blue-primary text-white text-xs font-bold rounded-xl hover:bg-usm-blue-primary/90 cursor-pointer"
            >
              Accéder à l'Administration
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nouveau Mot de Passe</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirmer le Mot de Passe</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-usm-blue-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !token}
              className="w-full py-3 bg-usm-blue-primary text-white font-bold rounded-xl hover:bg-usm-blue-primary/90 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Activation...' : 'Activer Mon Compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
