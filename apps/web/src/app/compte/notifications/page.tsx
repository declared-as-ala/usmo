'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function MyNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getMyNotifications()
      .then((data) => { if (active) setNotifications(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setNotifications([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch {
      api.getMyNotifications().then((d) => setNotifications(Array.isArray(d) ? d : [])).catch(() => {});
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
    } catch {
      api.getMyNotifications().then((d) => setNotifications(Array.isArray(d) ? d : [])).catch(() => {});
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Notifications</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Suivez les mises à jour concernant votre compte, vos commandes et votre abonnement.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-usm-border text-usm-blue-dark text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-soft transition-colors shrink-0"
          >
            <CheckCheck size={13} /> Tout marquer lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement...</span>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => {
            const content = (
              <div
                className={`usm-card border p-4 flex items-start justify-between gap-3 ${
                  n.isRead ? 'border-usm-border' : 'border-usm-blue-primary/40 bg-usm-blue-soft'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-usm-blue-primary mt-1.5 shrink-0" />}
                  <div>
                    <p className="text-xs font-bold text-usm-blue-dark">{n.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n._id} href={n.link} onClick={() => !n.isRead && handleMarkRead(n._id)}>
                {content}
              </Link>
            ) : (
              <div key={n._id} onClick={() => !n.isRead && handleMarkRead(n._id)} className="cursor-pointer">
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-1">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <Bell size={16} />
          </div>
          <h4 className="text-xs font-bold text-usm-blue-dark">Aucune notification</h4>
          <p className="text-[10px] text-slate-500">Vous serez notifié ici des mises à jour importantes.</p>
        </div>
      )}
    </div>
  );
}
