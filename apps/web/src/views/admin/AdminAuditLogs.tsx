'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { ClipboardList, Clock, User } from 'lucide-react';

export default function AdminAuditLogs() {
  const { auditLog, username } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Journal d'Activité"
        description="Historique des actions administratives réalisées sur la plateforme."
        actions={
          <span className="text-xs text-slate-500">
            {auditLog.length} entrée{auditLog.length > 1 ? 's' : ''}
          </span>
        }
      />

      <div className="bg-white border border-usm-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-usm-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-4">Entité</th>
                <th className="py-3.5 px-4">Administrateur</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-usm-border">
              {auditLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <ClipboardList size={28} className="mx-auto mb-2 text-slate-300" />
                    Aucune activité enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                auditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <span className="font-bold text-slate-900">{log.action}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-full bg-usm-blue-soft/50 px-2.5 py-1 text-[10px] font-bold text-usm-blue-dark">
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User size={12} className="text-slate-400" />
                        {log.actor || username || 'Système'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={12} />
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString('fr-FR')
                          : '-'}
                      </div>
                    </td>
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
