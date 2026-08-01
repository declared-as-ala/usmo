'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { AccreditationRequest, PressRelease } from '../../data/mockData';
import { FileText, Users, Plus, X, Trash2, Pencil } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

const STATUS_STYLES: Record<AccreditationRequest['status'], string> = {
  New: 'bg-usm-blue-primary/10 text-usm-blue-primary',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-red-50 text-red-700',
};

const emptyReleaseForm = { title: '', category: '', content: '' };

export default function AdminPress() {
  const { releases, addPressRelease, updatePressRelease, deletePressRelease, accreditations, updateAccreditationStatus } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyReleaseForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyReleaseForm);
    setShowForm(true);
  };

  const openEdit = (r: PressRelease) => {
    setEditingId(r.id);
    setForm({ title: r.title, category: r.category, content: r.content });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    if (editingId) {
      updatePressRelease(editingId, form);
    } else {
      addPressRelease({ id: `pr-${Date.now()}`, ...form, date: new Date().toISOString().slice(0, 10), published: true });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Press Center"
        description="Press releases and journalist accreditation requests."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> New Press Release
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Press Releases" value={releases.length} icon={FileText} accent="blue" />
        <StatCard label="Accreditation Requests" value={accreditations.length} icon={Users} accent="slate" />
        <StatCard label="Pending Requests" value={accreditations.filter((a) => a.status === 'New').length} icon={Users} accent="amber" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Press Releases</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {releases.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{r.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{r.category} • {r.date}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all">
                  <Pencil size={13} />
                </button>
                <button onClick={() => requestConfirmation({ title: 'Supprimer ce communiqué ?', message: `« ${r.title} » sera supprimé définitivement.`, confirmLabel: 'Supprimer', onConfirm: () => deletePressRelease(r.id) })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {releases.length === 0 && <p className="p-4 text-center text-slate-400 text-xs">No press releases yet.</p>}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Accreditation Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Journalist</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Match Requested</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accreditations.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{a.journalistName}</td>
                  <td className="py-2.5 px-4 text-slate-600">{a.organization}</td>
                  <td className="py-2.5 px-4 text-slate-600">{a.matchRequested}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono">{a.phone}</td>
                  <td className="py-2.5 px-4">
                    <select
                      value={a.status}
                      onChange={(e) => updateAccreditationStatus(a.id, e.target.value as AccreditationRequest['status'])}
                      className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 border-0 outline-none cursor-pointer ${STATUS_STYLES[a.status]}`}
                    >
                      {(['New', 'Approved', 'Rejected'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {accreditations.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">No accreditation requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Edit Press Release' : 'New Press Release'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title *</label>
                <input required type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                <input type="text" placeholder="Partnership, Transfer, Announcement..." value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Content *</label>
                <textarea required rows={4} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2">
                {editingId ? 'Save Changes' : 'Publish Release'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
