'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { quizQuestions } from '../../data/mockData';
import { Megaphone, HelpCircle, Users, MessageSquare, Check, X } from 'lucide-react';

interface MockComment {
  id: string;
  user: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminFanZone() {
  const { bluePoints } = useApp();

  const [comments, setComments] = useState<MockComment[]>([
    { id: 'c1', user: 'rihem_usm', message: 'Incredible victory in Rades! Orkuma is a monster!', status: 'pending' },
    { id: 'c2', user: 'tunis_diaspora', message: 'Espérance we are coming for you next Sunday!', status: 'pending' },
    { id: 'c3', user: 'anonymous_tester', message: 'This is a spam link test message.', status: 'pending' },
  ]);

  const moderate = (id: string, status: 'approved' | 'rejected') => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const pendingCount = comments.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Fan Zone"
        description="Moderate the fan wall and keep an eye on the daily trivia quiz."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Fan Wall Posts" value={pendingCount} icon={MessageSquare} accent="amber" />
        <StatCard label="Active Quiz Questions" value={quizQuestions.length} icon={HelpCircle} accent="blue" />
        <StatCard label="Session Blue Points" value={bluePoints} icon={Users} accent="emerald" />
        <StatCard label="Approved Posts" value={comments.filter((c) => c.status === 'approved').length} icon={Megaphone} accent="slate" />
      </div>

      {/* Comment moderation */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-black text-slate-900 mb-4">Fan Wall Moderation</h3>
        <div className="space-y-2.5">
          {comments.map((c) => (
            <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-xs">@{c.user}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      c.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : c.status === 'rejected'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{c.message}</p>
              </div>
              {c.status === 'pending' && (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => moderate(c.id, 'approved')}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded cursor-pointer transition-all"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => moderate(c.id, 'rejected')}
                    className="p-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded cursor-pointer transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quiz overview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-black text-slate-900 mb-4">Daily Trivia Quiz</h3>
        <div className="space-y-2">
          {quizQuestions.map((q, i) => (
            <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-usm-blue-primary uppercase mb-1">Question {i + 1}</p>
              <p className="text-xs font-semibold text-slate-800">{q.question}</p>
              <p className="text-[10px] text-slate-500 mt-1">Correct answer: {q.options[q.answerIndex]}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Quiz question editing, vote campaigns, and supporter badge management are on the roadmap — see NEXTSTEP.md.
        </p>
      </div>
    </div>
  );
}
