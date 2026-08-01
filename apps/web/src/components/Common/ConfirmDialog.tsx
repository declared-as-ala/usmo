'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

type Confirmation = { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void | Promise<void> };
const EVENT_NAME = 'usm:confirm-action';

export function requestConfirmation(options: Confirmation) {
  window.dispatchEvent(new CustomEvent<Confirmation>(EVENT_NAME, { detail: options }));
}

export function ConfirmDialog() {
  const [request, setRequest] = useState<Confirmation | null>(null);
  const [working, setWorking] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const open = (event: Event) => setRequest((event as CustomEvent<Confirmation>).detail);
    window.addEventListener(EVENT_NAME, open);
    return () => window.removeEventListener(EVENT_NAME, open);
  }, []);

  useEffect(() => {
    if (!request) return;
    cancelRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !working) setRequest(null); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [request, working]);

  if (!request) return null;
  const confirm = async () => { setWorking(true); try { await request.onConfirm(); setRequest(null); } finally { setWorking(false); } };

  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-white/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !working) setRequest(null); }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" className="w-full max-w-md overflow-hidden rounded-2xl border border-usm-border bg-white text-usm-blue-dark shadow-[0_32px_100px_rgba(0,0,0,.65)]">
      <div className="flex items-start gap-4 p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-400"><AlertTriangle size={22}/></span><div className="min-w-0 flex-1"><h2 id="confirm-title" className="text-lg font-extrabold">{request.title || 'Confirmer cette action'}</h2><p id="confirm-message" className="mt-2 text-sm leading-6 text-slate-500">{request.message}</p></div><button aria-label="Fermer" disabled={working} onClick={() => setRequest(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-usm-blue-soft hover:text-usm-blue-primary disabled:opacity-40"><X size={18}/></button></div>
      <div className="flex flex-col-reverse gap-3 border-t border-usm-border bg-usm-blue-soft p-4 sm:flex-row sm:justify-end"><button ref={cancelRef} disabled={working} onClick={() => setRequest(null)} className="min-h-12 rounded-xl border border-usm-border px-5 text-sm font-bold text-slate-600 transition hover:bg-usm-blue-soft disabled:opacity-40">{request.cancelLabel || 'Annuler'}</button><button disabled={working} onClick={confirm} className="min-h-12 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60">{working ? 'Traitement…' : request.confirmLabel || 'Confirmer'}</button></div>
    </section>
  </div>;
}

export function AppAlertDialog() {
  const [message, setMessage] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (value?: unknown) => setMessage(String(value ?? ''));
    return () => { window.alert = nativeAlert; };
  }, []);

  useEffect(() => {
    if (!message) return;
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' || event.key === 'Enter') setMessage(''); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [message]);

  if (!message) return null;
  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-white/75 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) setMessage(''); }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="notice-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-usm-border bg-white text-white shadow-[0_32px_100px_rgba(0,0,0,.65)]"><div className="flex items-start gap-4 p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><CheckCircle2 size={22}/></span><div className="flex-1"><h2 id="notice-title" className="text-lg font-extrabold">Information</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{message}</p></div><button aria-label="Fermer" onClick={() => setMessage('')} className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:bg-usm-blue-soft hover:text-usm-blue-primary"><X size={18}/></button></div><div className="border-t border-usm-border bg-usm-blue-soft p-4 text-right"><button ref={closeRef} onClick={() => setMessage('')} className="min-h-12 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-500">Compris</button></div></section>
  </div>;
}
