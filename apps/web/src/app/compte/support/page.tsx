'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { LifeBuoy, Loader2, Plus, X, Send, ArrowLeft } from 'lucide-react';

interface TicketMessage {
  from: 'fan' | 'admin';
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  subject: string;
  category: string;
  status: 'open' | 'answered' | 'closed';
  messages: TicketMessage[];
  updatedAt: string;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  open: { label: 'Ouvert', className: 'bg-amber-500/20 text-amber-500' },
  answered: { label: 'Répondu', className: 'bg-usm-blue-primary/20 text-usm-blue-primary' },
  closed: { label: 'Clôturé', className: 'bg-slate-400/20 text-slate-500' },
};

const CATEGORIES = [
  { value: 'membership', label: 'Abonnement' },
  { value: 'order', label: 'Commande' },
  { value: 'donation', label: 'Don' },
  { value: 'account', label: 'Compte' },
  { value: 'other', label: 'Autre' },
];

export default function MySupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'other', message: '' });
  const [saving, setSaving] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await api.getMySupportTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSaving(true);
    try {
      await api.createSupportTicket(form);
      setForm({ subject: '', category: 'other', message: '' });
      setShowForm(false);
      await fetchTickets();
    } catch {
      // keep form open for retry
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await api.replySupportTicket(selected._id, replyText);
      setSelected(updated as Ticket);
      setReplyText('');
      fetchTickets();
    } catch {
      // no-op
    } finally {
      setReplying(false);
    }
  };

  if (selected) {
    const status = STATUS_LABEL[selected.status];
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-usm-blue-primary hover:underline"
        >
          <ArrowLeft size={13} /> Retour aux tickets
        </button>

        <div className="usm-card border border-usm-border p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-usm-blue-dark">{selected.subject}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{CATEGORIES.find((c) => c.value === selected.category)?.label}</p>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0 ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-3">
          {selected.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'fan' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                m.from === 'fan' ? 'bg-usm-blue-primary text-white' : 'bg-usm-blue-soft border border-usm-border text-usm-blue-dark'
              }`}>
                <p className="text-xs leading-relaxed">{m.message}</p>
                <p className={`text-[9px] mt-1 ${m.from === 'fan' ? 'text-white/70' : 'text-slate-500'}`}>
                  {new Date(m.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selected.status !== 'closed' && (
          <form onSubmit={handleReply} className="flex items-center gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Votre message..."
              className="flex-grow text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
            />
            <button
              type="submit"
              disabled={replying || !replyText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors disabled:opacity-50 shrink-0"
            >
              {replying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <LifeBuoy size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Centre d&apos;assistance</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Contactez le club pour toute question sur votre compte, commande ou abonnement.</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors shrink-0"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Annuler' : 'Nouveau ticket'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="usm-card border border-usm-border p-5 space-y-3">
          <input
            placeholder="Sujet"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
            className="w-full text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <textarea
            placeholder="Décrivez votre demande..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows={4}
            className="w-full text-xs px-3 py-2.5 rounded-lg border border-usm-border bg-white focus:outline-none focus:border-usm-blue-primary resize-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Envoyer la demande
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-2">
          {tickets.map((t) => {
            const status = STATUS_LABEL[t.status];
            return (
              <button
                key={t._id}
                onClick={() => setSelected(t)}
                className="w-full text-left usm-card border border-usm-border p-4 flex items-center justify-between gap-3 hover:border-usm-blue-primary/40 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-usm-blue-dark">{t.subject}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {CATEGORIES.find((c) => c.value === t.category)?.label} · {new Date(t.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0 ${status.className}`}>
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-1">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <LifeBuoy size={16} />
          </div>
          <h4 className="text-xs font-bold text-usm-blue-dark">Aucun ticket</h4>
          <p className="text-[10px] text-slate-500">Ouvrez un ticket si vous avez besoin d&apos;aide.</p>
        </div>
      )}
    </div>
  );
}
