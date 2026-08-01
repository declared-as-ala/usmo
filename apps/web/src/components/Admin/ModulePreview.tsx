import React from 'react';
import { type LucideIcon, Check, Sparkles } from 'lucide-react';

interface ModulePreviewProps {
  title: string;
  description: string;
  icon: LucideIcon;
  plannedFeatures: string[];
}

/**
 * Honest placeholder for admin modules not yet wired to real data/functionality —
 * shows what's planned instead of faking working CRUD over nothing.
 */
export const ModulePreview: React.FC<ModulePreviewProps> = ({ title, description, icon: Icon, plannedFeatures }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10 max-w-2xl">
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
      <Sparkles size={11} /> Planned Module
    </span>
    <div className="mt-5 flex items-start gap-4">
      <span className="h-12 w-12 rounded-xl bg-usm-blue-primary/10 text-usm-blue-primary flex items-center justify-center shrink-0">
        <Icon size={22} />
      </span>
      <div>
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>

    <div className="mt-6 pt-6 border-t border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">What this module will manage</p>
      <ul className="space-y-2">
        {plannedFeatures.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
            <Check size={14} className="text-usm-blue-primary shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
