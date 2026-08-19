'use client';

import React, { useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api-client';
import { Mail, Send, Eye, Code, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const TEMPLATES = [
  {
    name: '📢 Annonce Officielle',
    subject: 'Communiqué Officiel — Union Sportive Monastirienne',
    html: `<h2 style="color: #0d3b66; margin-top: 0;">Chers Supporter,</h2>
<p style="font-size: 14px; line-height: 1.6; color: #334155;">Nous avons l'honneur de vous informer de la dernière actualité officielle concernant l'Union Sportive Monastirienne.</p>
<div style="background: #eff6ff; border-left: 4px solid #0d63ff; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 14px; color: #1e40af;">
  <strong>Message clé :</strong> Inserer ici les détails du communiqué...
</div>
<p style="font-size: 14px; line-height: 1.6; color: #334155;">Merci pour votre soutien indéfectible !</p>
<p style="font-size: 14px; font-weight: bold; color: #0d3b66;">Allez l'USM ! 🔵⚪</p>`,
  },
  {
    name: '⚽ Jour de Match & Billetterie',
    subject: 'Jour de Match — Tous au Stade Mustapha Ben Jannet !',
    html: `<h2 style="color: #0d3b66; text-align: center; margin-top: 0;">🔥 JOUR DE MATCH 🔥</h2>
<div style="text-align: center; margin: 20px 0;">
  <span style="font-size: 22px; font-weight: 900; color: #0d63ff;">US MONASTIR vs RIVAL FC</span>
  <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Stade Mustapha Ben Jannet • 16:00 CET</p>
</div>
<p style="font-size: 14px; line-height: 1.6; color: #334155;">Rejoignez les virages bleu et blanc et faites vibrer les tribunes ! Réservez dès maintenant vos billets sur le portail officiel.</p>
<div style="text-align: center; margin: 24px 0;">
  <a href="https://usmonastir.tn/matches" style="background: #0d63ff; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block;">Réserver Ma Place</a>
</div>`,
  },
  {
    name: '🛍️ Boutique & Promotion',
    subject: 'Nouveaux Maillots Officiels US Monastir Disponibles !',
    html: `<h2 style="color: #0d3b66; margin-top: 0;">Boutique Officielle USM 👕</h2>
<p style="font-size: 14px; line-height: 1.6; color: #334155;">Découvrez la nouvelle collection de maillots officiels 2026/2027 et équipez-vous aux couleurs de votre club de cœur.</p>
<div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0;">
  <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold;">Offre exclusive membre :</span>
  <div style="font-size: 20px; font-weight: 900; color: #059669; margin-top: 4px;">15% DE RÉDUCTION</div>
  <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Code : <strong>USM2026</strong></p>
</div>
<div style="text-align: center; margin: 24px 0;">
  <a href="https://usmonastir.tn/boutique" style="background: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block;">Visiter la Boutique</a>
</div>`,
  },
];

export default function AdminEmailCampaignsView() {
  const { showToast } = useApp();
  const [subject, setSubject] = useState('Communiqué Officiel — Union Sportive Monastirienne');
  const [target, setTarget] = useState<'ALL' | 'ADMINS' | 'USERS'>('ALL');
  const [htmlContent, setHtmlContent] = useState(TEMPLATES[0].html);
  const [testEmail, setTestEmail] = useState('');

  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);

  const handleInsertTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setSubject(tpl.subject);
    setHtmlContent(tpl.html);
    showToast(`Modèle "${tpl.name}" appliqué`, 'info');
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      showToast("Veuillez saisir une adresse email de test", 'error');
      return;
    }
    setTesting(true);
    try {
      await api.sendEmailCampaign({
        subject,
        target,
        htmlContent,
        testEmail,
      });
      showToast(`Email de test envoyé à ${testEmail} via SMTP !`, 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'envoi de l'email de test", 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !htmlContent) {
      showToast("Le sujet et le contenu HTML sont requis", 'error');
      return;
    }

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir diffuser cette campagne email à tous les destinataires ciblés (${target}) via SMTP OVH ?`
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const res = await api.sendEmailCampaign({
        subject,
        target,
        htmlContent,
      });
      showToast(`Campagne diffusée avec succès ! ${res.count} emails distribués.`, 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'envoi de la campagne", 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Campagnes Email & Diffusion"
        description="Créez et diffusez des communiqués email HTML personnalisés via les serveurs SMTP OVH à l'ensemble des supporters et administrateurs."
      />

      {/* Templates Selector */}
      <div className="bg-white p-4 rounded-2xl border border-usm-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold text-usm-blue-dark">
          <Sparkles size={16} className="text-usm-blue-primary" /> Modèles Rapides :
        </div>
        <div className="flex gap-2 flex-wrap">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => handleInsertTemplate(tpl)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-usm-blue-soft hover:text-usm-blue-primary text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <form onSubmit={handleSendCampaign} className="bg-white border border-usm-border p-6 rounded-2xl shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-usm-blue-dark flex items-center gap-2 border-b border-usm-border pb-3">
            <Mail className="w-4 h-4 text-usm-blue-primary" /> Configuration de l'Email
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sujet de l'Email *</label>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="ex: Communiqué Officiel..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-usm-blue-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Audience Cible</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as any)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:outline-none focus:border-usm-blue-primary"
            >
              <option value="ALL">Tous les Utilisateurs (Admins + Supporters)</option>
              <option value="USERS">Uniquement les Supporters / Fans</option>
              <option value="ADMINS">Uniquement les Administrateurs</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contenu HTML de l'Email *</label>
            <textarea
              required
              rows={12}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] focus:outline-none focus:border-usm-blue-primary"
            />
          </div>

          {/* Test Email Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="block font-bold text-slate-700 text-[11px]">Tester l'Envoi (Email de Test)</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="votre-email@usmonastir.tn"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-grow px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
              >
                {testing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {testing ? 'Test...' : 'Envoyer Test'}
              </button>
            </div>
          </div>

          {/* Submit Broadcast Button */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 bg-usm-blue-primary hover:bg-usm-blue-primary/90 text-white font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-usm-blue-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Diffusion en cours via SMTP...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Diffuser la Campagne Email</span>
              </>
            )}
          </button>
        </form>

        {/* Live Preview Panel */}
        <div className="bg-white border border-usm-border p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-usm-blue-dark flex items-center gap-2 border-b border-usm-border pb-3">
            <Eye className="w-4 h-4 text-emerald-600" /> Aperçu En Direct de l'Email
          </h3>

          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
            {/* Email Container Frame */}
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-usm-blue-dark to-usm-blue-primary p-6 text-center text-white">
                <h4 className="font-black text-sm uppercase tracking-widest text-white m-0">UNION SPORTIVE MONASTIRIENNE</h4>
                <p className="text-[10px] text-usm-teal-accent font-bold mt-1 m-0">COMMUNIQUÉ OFFICIEL</p>
              </div>
              <div
                className="p-6 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[400px]"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
              <div className="bg-slate-50 p-4 text-center text-[10px] text-slate-400 border-t border-slate-100">
                © {new Date().getFullYear()} Union Sportive Monastirienne • Tous droits réservés<br />
                Envoyé par noreply@usmonastir.tn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
