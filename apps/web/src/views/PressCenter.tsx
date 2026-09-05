'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Download, Check, ShieldCheck, Mail, ShieldAlert, Award } from 'lucide-react';

export const PressCenter: React.FC = () => {
  const { language, addBluePoints } = useApp();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleAccreditationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addBluePoints(50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 space-y-12 animate-[fadeIn_0.2s_ease-out]">
      
      {/* Visual Header */}
      <div className="relative h-48 rounded-3xl overflow-hidden bg-white flex items-end p-6 border border-usm-blue-primary/20 shadow-lg">
        <div className="absolute inset-0 bg-cover bg-center brightness-[0.25]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-usm-blue-dark to-transparent" />
        <div className="relative z-10">
          <span className="text-[10px] bg-usm-blue-primary text-white font-black tracking-widest px-3 py-1 rounded-full uppercase">
            USM MEDIA RESOURCES
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-usm-blue-dark uppercase tracking-wider mt-2">
            Press & Media Room
          </h1>
          <p className="text-xs text-slate-600 mt-2 max-w-lg">
            Verified materials. Download official press kits, vector logo branding guides, or submit press pass accreditations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Media Kit & Logo downloads */}
        <div className="lg:col-span-2 space-y-8">
          {/* Brand Assets */}
          <div className="bg-usm-blue-soft border border-usm-border rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="font-display font-black text-xl text-usm-blue-dark uppercase border-b border-usm-border pb-2">USM Official Brand Assets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Journalists and publishers are requested to preserve the USM crest color codes. Do not distort, crop, or recolor our shield without written permit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/telechargements?category=press-kit')}
                className="flex-grow py-3 bg-usm-blue-primary/40 border border-usm-blue-primary/30 hover:bg-usm-blue-primary/25 text-usm-blue-dark text-xs font-bold uppercase rounded-xl tracking-wider text-center cursor-pointer transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={14} className="text-usm-blue-primary" />
                <span>Download SVG Logo Pack</span>
              </button>
              <button
                onClick={() => router.push('/telechargements?category=press-kit')}
                className="flex-grow py-3 bg-usm-blue-primary/40 border border-usm-border hover:border-usm-border text-usm-blue-dark text-xs font-bold uppercase rounded-xl tracking-wider text-center cursor-pointer transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={14} />
                <span>Download Media Kit Guide</span>
              </button>
            </div>
          </div>

          {/* Press calendar */}
          <div className="bg-usm-blue-soft border border-usm-border rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="font-display font-black text-lg text-usm-blue-dark uppercase border-b border-usm-border pb-2">Upcoming Media Conferences</h3>
            <div className="space-y-4 text-xs text-slate-600 font-semibold">
              <div className="flex justify-between items-center border-b border-usm-border pb-3">
                <div>
                  <span className="text-usm-blue-primary uppercase font-bold block mb-1">Pre-Derby Press Briefing</span>
                  <span>Head coach Chabbi and goalkeeper Yeddes answer tactical queries.</span>
                </div>
                <div className="text-right">
                  <span className="text-usm-blue-dark block font-mono">July 11th @ 15:00</span>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Press Room, Stadium</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3">
                <div>
                  <span className="text-usm-blue-primary uppercase font-bold block mb-1">Pro A Basketball Playoffs Media Meet</span>
                  <span>Coach Miodrag Perisic outlines player availability updates.</span>
                </div>
                <div className="text-right">
                  <span className="text-usm-blue-dark block font-mono">July 07th @ 11:30</span>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Olympic Hall Annex</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accreditation requests form */}
        <div className="bg-usm-blue-soft border border-usm-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-display font-black text-lg text-usm-blue-dark mb-2 uppercase border-b border-usm-border pb-2">Accreditation Card</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Journalists can apply for a press accreditation card for the upcoming match.
            </p>

            {submitted ? (
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center space-y-2">
                <Check className="text-green-400 mx-auto" size={24} />
                <h4 className="text-sm font-bold text-usm-blue-dark uppercase">Inquiry Filed</h4>
                <p className="text-xs text-slate-600">Your credential request is pending communications review. We will contact you.</p>
              </div>
            ) : (
              <form onSubmit={handleAccreditationSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Reporter Name</label>
                  <input required type="text" className="w-full bg-white border border-usm-border text-xs text-usm-blue-dark rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Media Agency</label>
                  <input required type="text" className="w-full bg-white border border-usm-border text-xs text-usm-blue-dark rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Journalist ID #</label>
                  <input required type="text" className="w-full bg-white border border-usm-border text-xs text-usm-blue-dark rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Match Date</label>
                  <input required type="date" className="w-full bg-white border border-usm-border text-xs text-slate-500 rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <button type="submit" className="w-full py-3 bg-usm-blue-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-usm-blue-hover transition-colors cursor-pointer">
                  Request Accreditation Pass
                </button>
              </form>
            )}
          </div>

          <div className="p-3 bg-white border border-usm-border rounded-2xl text-[10px] text-slate-500 leading-normal flex items-start space-x-2 mt-6">
            <ShieldAlert size={14} className="text-usm-blue-primary shrink-0 mt-0.5" />
            <span>Journalists are requested to carry their official national card along with USM match accreditations. Gate 4 is designated for press entry.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
