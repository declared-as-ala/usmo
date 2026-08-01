'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { api } from '../../lib/api-client';
import { LifeBuoy, Loader2, ArrowLeft, Send, Inbox, CheckCircle2, Clock } from 'lucide-react';

interface TicketMessage { from: 'fan' | 'admin'; message: string; createdAt: string; }
interface Ticket {
  _id: string; subject: string; category: string; status: 'open' | 'answered' | 'closed';
  messages: TicketMessage[]; updatedAt: string; userId?: { name?: string; email?: string };
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  open: { label: 'Ouvert', className: 'bg-amber-50 text-amber-600' },
  answered: { label: 'Répondu', className: 'bg-usm-blue-primary/10 text-usm-blue-primary' },
  closed: { label: 'Clôturé', className: 'bg-slate-100 text-slate-500' },
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await api.getAdminSupportTickets());
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openTicket = async (t: Ticket) => {
    setSelected(t);
    try {
      const detail = await api.getAdminSupportTicket(t._id);
      setSelected(detail);
    } catch {
      // keep list version
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await api.replyAdminSupportTicket(selected._id, replyText);
      setSelected(updated as Ticket);
      setReplyText('');
      load();
    } finally {
      setReplying(false);
    }
  };

  const handleClose = async () => {
    if (!selected) return;
    await api.updateSupportTicketStatus(selected._id, 'closed');
    setSelected({ ...selected, status: 'closed' });
    load();
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;

  if (selected) {
    const status = STATUS_LABEL[selected.status];
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-xs font-bold text-usm-blue-primary hover:underline cursor-pointer">
          <ArrowLeft size={14} /> Retour aux tickets
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-slate-900">{selected.subject}</p>
            <p className="text-xs text-slate-500 mt-0.5">{selected.userId?.name || selected.userId?.email} · {selected.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${status.className}`}>{status.label}</span>
            {selected.status !== 'closed' && (
              <button onClick={handleClose} className="text-[10px] font-bold uppercase text-slate-500 hover:text-red-500 cursor-pointer">Clôturer</button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {selected.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs ${m.from === 'admin' ? 'bg-usm-blue-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                <p>{m.message}</p>
                <p className={`text-[9px] mt-1 ${m.from === 'admin' ? 'text-white/70' : 'text-slate-400'}`}>{new Date(m.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))}
        </div>

        {selected.status !== 'closed' && (
          <form onSubmit={handleReply} className="flex items-center gap-2">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Répondre au fan..." className="flex-grow bg-white border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
            <button type="submit" disabled={replying || !replyText.trim()} className="px-4 py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer">
              {replying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Centre d'assistance" description="Répondez aux demandes des supporters." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tickets" value={tickets.length} icon={Inbox} accent="blue" />
        <StatCard label="Ouverts" value={openCount} icon={Clock} accent="amber" />
        <StatCard label="Répondus" value={tickets.filter((t) => t.status === 'answered').length} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
              <th className="py-3 px-4">Fan</th><th className="py-3 px-4">Sujet</th><th className="py-3 px-4">Catégorie</th>
              <th className="py-3 px-4">Statut</th><th className="py-3 px-4">Mis à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-slate-400"><Loader2 size={20} className="animate-spin inline-block" /></td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-slate-400"><LifeBuoy size={18} className="inline-block mb-1" /><br />Aucun ticket pour le moment.</td></tr>
            ) : tickets.map((t) => {
              const status = STATUS_LABEL[t.status];
              return (
                <tr key={t._id} onClick={() => openTicket(t)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="py-2.5 px-4 text-slate-600">{t.userId?.name || t.userId?.email || '-'}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{t.subject}</td>
                  <td className="py-2.5 px-4 text-slate-600 capitalize">{t.category}</td>
                  <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.className}`}>{status.label}</span></td>
                  <td className="py-2.5 px-4 text-slate-500">{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
