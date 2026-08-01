'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { AdminTeamUser } from '../../data/mockData';
import { Shield, Check, Info, Plus, X, Trash2, Pencil } from 'lucide-react';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';

const ROLES = [
  { name: 'Super Admin', scope: 'Full access to everything' },
  { name: 'Communication Manager', scope: 'News, media, USM Media, social links, pages, notifications' },
  { name: 'Football Manager', scope: 'Football players, staff, matches, results, standings, statistics' },
  { name: 'Basketball Manager', scope: 'Basketball players, staff, matches, results, standings, statistics' },
  { name: 'Sponsor Manager', scope: 'Sponsors, campaigns, placements, sponsor reports' },
  { name: 'Boutique Manager', scope: 'Products, categories, stock, orders, coupons, delivery settings' },
  { name: 'Media Editor', scope: 'Upload photos/videos — publish only if granted' },
  { name: 'Content Editor', scope: 'Draft and edit content — publish only if granted' },
  { name: 'Moderator', scope: 'Fan wall, comments, votes, submissions' },
  { name: 'Analyst', scope: 'View analytics and reports only' },
];

const ROLE_NAMES = ROLES.map((r) => r.name);

const PERMISSIONS = ['View', 'Create', 'Edit', 'Delete', 'Publish', 'Approve', 'Export', 'Settings'];

// Reference matrix only — this prototype has no backend auth, so nothing here is actually enforced yet.
const MATRIX: Record<string, boolean[]> = {
  'Super Admin':            [true, true, true, true, true, true, true, true],
  'Communication Manager':  [true, true, true, false, true, true, false, false],
  'Football Manager':       [true, true, true, true, true, false, false, false],
  'Basketball Manager':     [true, true, true, true, true, false, false, false],
  'Sponsor Manager':        [true, true, true, false, true, false, true, false],
  'Boutique Manager':       [true, true, true, true, true, true, true, false],
  'Media Editor':           [true, true, true, false, false, false, false, false],
  'Content Editor':         [true, true, true, false, false, false, false, false],
  'Moderator':              [true, false, false, true, false, true, false, false],
  'Analyst':                [true, false, false, false, false, false, true, false],
};

const emptyForm = { name: '', email: '', role: 'Content Editor' };

export default function AdminUsers() {
  const { username, isLoggedIn, teamUsers, addTeamUser, updateTeamUser, deleteTeamUser } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (u: AdminTeamUser) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    if (editingId) {
      updateTeamUser(editingId, form);
    } else {
      addTeamUser({ id: `u-${Date.now()}`, ...form, status: 'Active' });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users & Roles"
        description="Team members and the permission reference model for the USM digital team."
        actions={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Plus size={14} /> Add Team Member
          </button>
        }
      />

      <div className="flex items-start gap-3 bg-usm-blue-primary/5 border border-usm-blue-primary/20 rounded-xl p-4">
        <Info size={16} className="text-usm-blue-primary shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          This prototype has a single simulated <strong>admin</strong> session (currently{' '}
          <strong>{isLoggedIn ? username || 'USM Administrator' : 'not signed in'}</strong>). Team members and roles
          below are a real, editable reference list — but with no backend auth yet, role changes here don&apos;t
          actually restrict what any given browser session can do. See NEXTSTEP.md.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-usm-blue-primary/10 text-usm-blue-primary flex items-center justify-center shrink-0">
                      <Shield size={12} />
                    </span>
                    {u.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono">{u.email}</td>
                  <td className="py-2.5 px-4 text-slate-600">{u.role}</td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => updateTeamUser(u.id, { status: u.status === 'Active' ? 'Inactive' : 'Active' })}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-usm-blue-primary/10 rounded cursor-pointer transition-all">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => requestConfirmation({ title: 'Retirer cet utilisateur ?', message: `${u.name} perdra son accès à l’administration.`, confirmLabel: 'Retirer', onConfirm: () => deleteTeamUser(u.id) })}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teamUsers.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">No team members yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role permission matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Role Permission Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold">
                <th className="py-3 px-4 sticky left-0 bg-white">Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p} className="py-3 px-3 text-center">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLES.map((role) => (
                <tr key={role.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 sticky left-0 bg-white">
                    <p className="font-bold text-slate-900">{role.name}</p>
                    <p className="text-[10px] text-slate-400">{role.scope}</p>
                  </td>
                  {MATRIX[role.name].map((allowed, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      {allowed ? (
                        <Check size={13} className="text-emerald-500 inline" />
                      ) : (
                        <span className="text-slate-200">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Name *</label>
                <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                  {ROLE_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2">
                {editingId ? 'Save Changes' : 'Add Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
