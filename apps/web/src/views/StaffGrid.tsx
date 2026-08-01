'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api-client';
import { tr } from '../utils/i18n';
import { Users, Loader2 } from 'lucide-react';

interface StaffMember {
  _id: string;
  slug: string;
  sport: 'football' | 'basketball' | null;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  image: string;
  bio: string;
  bioAr: string;
}

export function StaffGrid({ sport }: { sport: 'football' | 'basketball' }) {
  const { language } = useApp();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getStaff(sport)
      .then((data: StaffMember[]) => { if (!cancelled) setStaff(data || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sport]);

  return (
    <main className="min-h-screen usm-premium-bg text-usm-blue-dark">
      <header className="border-b border-[#DDE8F8] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-usm-blue-primary/25 bg-usm-blue-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-usm-blue-primary">
            <Users size={13} /> {tr(language, 'Technical Staff', 'Staff Technique', 'الطاقم الفني')}
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            {sport === 'football'
              ? tr(language, 'Football coaching staff', 'Staff technique football', 'الطاقم الفني لكرة القدم')
              : tr(language, 'Basketball coaching staff', 'Staff technique basketball', 'الطاقم الفني لكرة السلة')}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center"><Loader2 className="animate-spin text-usm-blue-primary" /></div>
        ) : staff.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#5B6B82]">
            {tr(language, 'Staff information coming soon.', 'Informations du staff bientôt disponibles.', 'معلومات الطاقم الفني قريباً.')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {staff.map((member) => (
              <div key={member._id} className="overflow-hidden rounded-2xl border border-[#DDE8F8] bg-white shadow-sm">
                <div className="aspect-[4/5] bg-usm-blue-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-usm-blue-dark line-clamp-1">
                    {language === 'ar' ? member.nameAr : member.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-usm-blue-primary line-clamp-1">
                    {language === 'ar' ? member.roleAr : member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
