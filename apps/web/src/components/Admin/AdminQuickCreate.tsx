'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Newspaper, Radio, ImageIcon, ShoppingBag, Handshake, Bell, Users } from 'lucide-react';

interface AdminQuickCreateProps {
  open: boolean;
  onClose: () => void;
}

const ACTIONS = [
  { label: 'Create News Article', href: '/admin/news?new=1', icon: Newspaper, desc: 'Publish a new story to the newsroom' },
  { label: 'Upload Media', href: '/admin/media', icon: ImageIcon, desc: 'Add photos or videos to the gallery' },
  { label: 'Add Product', href: '/admin/boutique?new=1', icon: ShoppingBag, desc: 'List a new boutique item' },
  { label: 'Create Sponsor', href: '/admin/sponsors?new=1', icon: Handshake, desc: 'Onboard a new partner' },
  { label: 'Send Notification', href: '/admin/notifications', icon: Bell, desc: 'Push an announcement to fans' },
  { label: 'Add Player', href: '/admin/football', icon: Users, desc: 'Register a new player profile' },
];

export const AdminQuickCreate: React.FC<AdminQuickCreateProps> = ({ open, onClose }) => {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-usm-blue-soft0 backdrop-blur-sm flex items-start sm:items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 mt-20 sm:mt-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Quick Create</h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-700 rounded cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-2 max-h-[70vh] overflow-y-auto">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => {
                  onClose();
                  router.push(action.href);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left rtl:text-right cursor-pointer transition-colors"
              >
                <span className="h-9 w-9 rounded-lg bg-usm-blue-primary/10 text-usm-blue-primary flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900">{action.label}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{action.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
