import React from 'react';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' };
  accent?: 'blue' | 'emerald' | 'amber' | 'red' | 'slate' | 'violet';
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'bg-usm-blue-primary/10 text-usm-blue-primary',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
  violet: 'bg-violet-50 text-violet-600',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, accent = 'blue' }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}>
        <Icon size={18} />
      </span>
      {trend && (
        <span
          className={`flex items-center gap-0.5 text-[11px] font-bold ${
            trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {trend.direction === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-2xl font-black text-slate-900 mt-3 tracking-tight">{value}</p>
    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{label}</p>
  </div>
);
