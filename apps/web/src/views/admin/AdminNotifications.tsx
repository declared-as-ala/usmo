'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { AdminNotification } from '../../data/mockData';
import { Bell, Send, CheckCircle2 } from 'lucide-react';
import { tr } from '../../utils/i18n';

const emptyForm = { title: '', message: '', audience: 'all' as AdminNotification['audience'], language: 'all' as AdminNotification['language'] };

export default function AdminNotifications() {
  const { notifications, sendNotification, showToast, language } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [weekCutoff] = useState(() => Date.now() - 7 * 86400000);
  const [justSent, setJustSent] = useState(false);

  // Request browser Notification permission on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission !== 'granted' && window.Notification.permission !== 'denied') {
        window.Notification.requestPermission();
      }
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;

    // 1. Add to the mock database/state
    sendNotification({ id: `nt-${Date.now()}`, ...form, status: 'sent', sentAt: new Date().toISOString() });

    // 2. Trigger real in-app Toast notification
    showToast(`${form.title}: ${form.message}`, 'info');

    // 3. Trigger real native OS / browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        new window.Notification(form.title, {
          body: form.message,
          icon: '/logo.webp',
        });
      } else if (window.Notification.permission !== 'denied') {
        window.Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new window.Notification(form.title, {
              body: form.message,
              icon: '/logo.webp',
            });
          }
        });
      }
    }

    setForm(emptyForm);
    setJustSent(true);
    setTimeout(() => setJustSent(false), 2500);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Notifications" description="Push announcements to fans across the platform." />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label={tr(language, 'Total Sent', 'Total Envoyé', 'إجمالي المرسل')}
          value={notifications.length}
          icon={Bell}
          accent="blue"
        />
        <StatCard
          label={tr(language, 'This Week', 'Cette Semaine', 'هذا الأسبوع')}
          value={notifications.filter((n) => new Date(n.sentAt).getTime() > weekCutoff).length}
          icon={Bell}
          accent="emerald"
        />
        <StatCard
          label={tr(language, 'Football Targeted', 'Ciblé Football', 'خاص بكرة القدم')}
          value={notifications.filter((n) => n.audience === 'football').length}
          icon={Bell}
          accent="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-black text-slate-900 mb-4 font-display">
            {tr(language, 'Compose Notification', 'Composer une Notification', 'إنشاء إشعار جديد')}
          </h3>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                {tr(language, 'Title *', 'Titre *', 'العنوان *')}
              </label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={tr(language, 'Match Reminder', 'Rappel de Match', 'تذكير بالمباراة')}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                {tr(language, 'Message *', 'Message *', 'الرسالة *')}
              </label>
              <textarea
                required
                rows={3}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {tr(language, 'Audience', 'Audience', 'الجمهور المستهدف')}
                </label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as AdminNotification['audience'] }))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                >
                  <option value="all">{tr(language, 'All Fans', 'Tous les supporters', 'جميع الأحباء')}</option>
                  <option value="football">{tr(language, 'Football Fans', 'Supporters Football', 'أحباء كرة القدم')}</option>
                  <option value="basketball">{tr(language, 'Basketball Fans', 'Supporters Basket', 'أحباء كرة السلة')}</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {tr(language, 'Language', 'Langue', 'اللغة')}
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as AdminNotification['language'] }))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary"
                >
                  <option value="all">{tr(language, 'All Languages', 'Toutes les langues', 'جميع اللغات')}</option>
                  <option value="en">{tr(language, 'English', 'Anglais', 'الإنجليزية')}</option>
                  <option value="fr">{tr(language, 'French', 'Français', 'الفرنسية')}</option>
                  <option value="ar">{tr(language, 'Arabic', 'Arabe', 'العربية')}</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/85 text-white text-xs font-black uppercase rounded-lg cursor-pointer transition-colors mt-2 flex items-center justify-center gap-1.5"
            >
              {justSent ? (
                <>
                  <CheckCircle2 size={14} /> {tr(language, 'Sent!', 'Envoyé !', 'تم الإرسال!')}
                </>
              ) : (
                <>
                  <Send size={14} /> {tr(language, 'Send Notification', 'Envoyer la notification', 'إرسال الإشعار')}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 font-display">
              {tr(language, 'Notification History', 'Historique des Notifications', 'سجل الإشعارات المرسلة')}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{n.title}</p>
                  <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    {tr(language, 'SENT', 'ENVOYÉ', 'تم الإرسال')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {n.audience === 'all'
                    ? tr(language, 'All Fans', 'Tous les supporters', 'جميع الأحباء')
                    : n.audience === 'football'
                    ? tr(language, 'Football Fans', 'Supporters Football', 'أحباء كرة القدم')
                    : tr(language, 'Basketball Fans', 'Supporters Basket', 'أحباء كرة السلة')}{' '}
                  •{' '}
                  {n.language === 'all'
                    ? tr(language, 'All Languages', 'Toutes les langues', 'جميع اللغات')
                    : n.language.toUpperCase()}{' '}
                  • {new Date(n.sentAt).toLocaleString(language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US')}
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="p-4 text-center text-slate-400 text-xs">
                {tr(language, 'No notifications sent yet.', 'Aucune notification envoyée pour le moment.', 'لم يتم إرسال أي إشعارات بعد.')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
