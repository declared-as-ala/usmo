'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Lock,
  Unlock,
  Eye,
  ShieldCheck,
  Save,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { LaunchPage, LaunchStatusData } from '../../components/Launch/LaunchPage';

export const AdminSiteLaunch: React.FC = () => {
  const { isSuperAdmin, showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<LaunchStatusData | null>(null);

  // Form states
  const [enabled, setEnabled] = useState(true);
  const [launchDate, setLaunchDate] = useState('2026-09-09');
  const [launchTime, setLaunchTime] = useState('19:23');
  const [timezone, setTimezone] = useState('Africa/Tunis');
  const [unlockedState, setUnlockedState] = useState(false);

  // Preview modals
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hasPreviewCookie, setHasPreviewCookie] = useState(false);

  // Check preview cookie on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookieExists = document.cookie
        .split(';')
        .some((c) => c.trim().startsWith('usm_superadmin_preview=1'));
      setHasPreviewCookie(cookieExists);
    }
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data: LaunchStatusData = await api.getSiteLaunchStatus();
      setStatus(data);
      setEnabled(data.enabled);
      setUnlockedState(Boolean(data.unlocked));
      setTimezone(data.timezone || 'Africa/Tunis');

      if (data.launchAt) {
        // Parse date in Tunis timezone or local representation
        const d = new Date(data.launchAt);
        // Format YYYY-MM-DD and HH:mm in Africa/Tunis
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: data.timezone || 'Africa/Tunis',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const parts = formatter.formatToParts(d);
        const y = parts.find((p) => p.type === 'year')?.value || '2026';
        const m = parts.find((p) => p.type === 'month')?.value || '09';
        const day = parts.find((p) => p.type === 'day')?.value || '09';
        const h = parts.find((p) => p.type === 'hour')?.value || '19';
        const min = parts.find((p) => p.type === 'minute')?.value || '23';

        setLaunchDate(`${y}-${m}-${day}`);
        setLaunchTime(`${h}:${min}`);
      }
    } catch {
      showToast('Impossible de charger les paramètres de lancement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Compute ISO UTC from local Tunis date and time
  const computeTargetIso = (dateStr: string, timeStr: string): string => {
    // Tunis is UTC+1 (standard time)
    // Example: 2026-09-09T19:23:00+01:00 => 2026-09-09T18:23:00.000Z
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create Date representing that UTC moment by subtracting 1 hour
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 1, minutes, 0, 0));
    return utcDate.toISOString();
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      showToast('Action réservée au Super Administrateur', 'error');
      return;
    }
    setSaving(true);
    try {
      const targetIso = computeTargetIso(launchDate, launchTime);
      const updated = await api.updateSiteLaunchSettings({
        enabled,
        launchAt: targetIso,
        timezone,
        unlocked: unlockedState,
      });
      setStatus(updated);
      showToast('Configuration du lancement enregistrée avec succès !', 'success');
    } catch (err: any) {
      showToast(err?.message || "Erreur lors de l'enregistrement", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlockNow = async () => {
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      const updated = await api.updateSiteLaunchSettings({
        unlocked: true,
      });
      setUnlockedState(true);
      setStatus(updated);
      showToast('Le site a été déverrouillé avec succès pour tout le public !', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors du déverrouillage', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLockAgain = async () => {
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      const targetIso = computeTargetIso(launchDate, launchTime);
      const updated = await api.updateSiteLaunchSettings({
        enabled: true,
        unlocked: false,
        launchAt: targetIso,
      });
      setUnlockedState(false);
      setEnabled(true);
      setStatus(updated);
      showToast('Le portail a été reverrouillé sous le compte à rebours.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors du verrouillage', 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePreviewCookie = () => {
    if (typeof document === 'undefined') return;
    if (hasPreviewCookie) {
      document.cookie = 'usm_superadmin_preview=; path=/; max-age=0';
      setHasPreviewCookie(false);
      showToast('Mode prévisualisation Super Admin désactivé', 'info');
    } else {
      // Set secure preview cookie for 24 hours
      document.cookie = 'usm_superadmin_preview=1; path=/; max-age=86400; SameSite=Lax';
      setHasPreviewCookie(true);
      showToast('Aperçu Super Admin activé ! Vous pouvez maintenant visiter le site.', 'success');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-xl font-display font-black uppercase text-usm-blue-dark">
          Accès Réservé au Super Administrateur
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          La gestion du lancement officiel et du compte à rebours 19:23 nécessite les privilèges de Super Administrateur.
        </p>
      </div>
    );
  }

  const isCurrentUnlocked = Boolean(status?.isUnlocked);
  const targetIsoDisplay = computeTargetIso(launchDate, launchTime);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-usm-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0D63FF] text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>Événement Spécial USM • 1923</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-usm-blue-dark uppercase tracking-tight">
            Lancement Officiel du Site (19:23)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez le verrouillage public et le compte à rebours symbolique célébrant l&apos;année de fondation 1923.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadStatus}
            disabled={loading}
            className="p-2.5 rounded-xl border border-usm-border hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Rafraîchir les statuts"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-usm-blue-primary hover:bg-usm-blue-hover text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Enregistrement…' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Live Status Banner */}
      <div className={`p-6 rounded-2xl border ${isCurrentUnlocked ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-blue-50/70 border-blue-200 text-blue-950'} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isCurrentUnlocked ? 'bg-emerald-500 text-white' : 'bg-[#0D63FF] text-white'}`}>
            {isCurrentUnlocked ? <Unlock size={24} /> : <Lock size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white shadow-xs">
                {isCurrentUnlocked ? 'SITE PUBLIC OUVERT' : 'SITE PUBLIC VERROUILLÉ'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Fuseau : {timezone}
              </span>
            </div>
            <h3 className="text-lg font-display font-black uppercase mt-1">
              {isCurrentUnlocked
                ? 'Le site est actuellement accessible à tous les visiteurs'
                : 'La page de lancement 19:23 est affichée au public'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Cible configurée : <strong className="font-mono text-usm-blue-dark">{launchDate} à {launchTime} ({timezone})</strong> • ISO UTC : <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">{targetIsoDisplay}</code>
            </p>
          </div>
        </div>

        {/* Action buttons inside status banner */}
        <div className="flex flex-wrap items-center gap-2">
          {isCurrentUnlocked ? (
            <button
              onClick={handleLockAgain}
              disabled={saving}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Lock size={14} />
              <span>Verrouiller à nouveau</span>
            </button>
          ) : (
            <button
              onClick={handleUnlockNow}
              disabled={saving}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Unlock size={14} />
              <span>Déverrouiller le site maintenant</span>
            </button>
          )}

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-usm-blue-primary border border-usm-border rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Eye size={14} />
            <span>Aperçu de la page</span>
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Launch Settings Card */}
        <div className="p-6 rounded-2xl bg-white border border-usm-border shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-usm-border pb-4">
            <Clock className="text-usm-blue-primary" size={18} />
            <h2 className="text-sm font-black uppercase tracking-wider text-usm-blue-dark">
              Paramètres de Publication
            </h2>
          </div>

          {/* Toggle: Launch Gate Enabled */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-usm-blue-dark uppercase">
                Activer le Compte à Rebours (Gate)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Si désactivé, le site public est immédiatement ouvert sans restriction.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-usm-blue-primary" />
            </label>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Date de Lancement
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full bg-slate-50 border border-usm-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-usm-blue-dark outline-none focus:border-usm-blue-primary focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Target Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Heure de Lancement (Tunisie)
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="time"
                value={launchTime}
                onChange={(e) => setLaunchTime(e.target.value)}
                className="w-full bg-slate-50 border border-usm-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-usm-blue-dark outline-none focus:border-usm-blue-primary focus:bg-white transition-all font-mono font-bold"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Définir sur <strong>19:23</strong> pour la concordance historique avec l&apos;année 1923.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Fuseau Horaire de Référence
            </label>
            <input
              type="text"
              value={timezone}
              disabled
              className="w-full bg-slate-100 border border-usm-border rounded-xl px-4 py-2.5 text-xs text-slate-600 font-mono cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Verrouillé sur Africa/Tunis (UTC+1, heure locale tunisienne).
            </p>
          </div>
        </div>

        {/* Super Admin Preview Card */}
        <div className="p-6 rounded-2xl bg-white border border-usm-border shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-usm-border pb-4">
              <ShieldCheck className="text-emerald-600" size={18} />
              <h2 className="text-sm font-black uppercase tracking-wider text-usm-blue-dark">
                Aperçu Réservé Super Admin
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              En tant que Super Administrateur, vous pouvez naviguer sur le site complet en production avant 19:23 grâce à un cookie de session sécurisé. Les visiteurs ordinaires continuent de voir uniquement la page de compte à rebours.
            </p>

            <div className={`p-4 rounded-xl border ${hasPreviewCookie ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Statut de l&apos;Aperçu :
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${hasPreviewCookie ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'}`}>
                  {hasPreviewCookie ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                </span>
              </div>
              <p className="text-[11px] mt-2 text-slate-500">
                {hasPreviewCookie
                  ? 'Le cookie sécurisé est présent dans votre navigateur. Vous avez accès à toutes les pages publiques.'
                  : 'Activez l’aperçu pour inspecter le portail public sans lever le verrouillage.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={togglePreviewCookie}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  hasPreviewCookie
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                }`}
              >
                <ShieldCheck size={15} />
                <span>{hasPreviewCookie ? "Désactiver l'Aperçu" : "Activer l'Aperçu Super Admin"}</span>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl border border-usm-border hover:bg-slate-50 text-usm-blue-dark text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Aller sur le site</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900">
            <p className="font-bold flex items-center gap-1.5 text-blue-800">
              <Sparkles size={13} />
              Déverrouillage Automatique à 19:23
            </p>
            <p className="text-[11px] text-blue-700 mt-1 leading-snug">
              À 19:23 précises (heure de Tunis), le serveur déverrouille le site et le compte à rebours s&apos;efface automatiquement sur les écrans de tous les visiteurs connectés.
            </p>
          </div>
        </div>
      </div>

      {/* Launch Page Modal Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6">
          <div className="w-full max-w-5xl bg-[#061A3A] rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono uppercase tracking-widest text-white/70">
                Aperçu Simulation Visiteur • Page de Lancement 19:23
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white/60 hover:text-white text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-0">
              <LaunchPage
                initialStatus={status}
                onUnlocked={() => {
                  showToast('Simulation : Compte à rebours terminé !', 'success');
                }}
                previewMode={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
