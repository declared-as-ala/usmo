'use client';

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-usm-blue-dark flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-usm-teal-accent">
          Accès Libre & Public
        </h1>
        <p className="text-sm text-slate-300">
          Tous les contenus, médias et actualités de l'US Monastir sont désormais 100% publics et accessibles librement sans connexion.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-usm-teal-accent text-usm-blue-dark font-bold text-xs uppercase rounded-full shadow-lg hover:bg-white transition-colors">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
