'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComptePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-usm-blue-dark flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-usm-teal-accent">
          Union Sportive Monastirienne
        </h1>
        <p className="text-sm text-slate-300">
          Redirection vers l'accueil...
        </p>
      </div>
    </div>
  );
}
