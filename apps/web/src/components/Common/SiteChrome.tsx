'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';
import { LaunchPage, LaunchStatusData } from '../Launch/LaunchPage';
import { api } from '../../lib/api-client';
import { ShieldCheck } from 'lucide-react';

/**
 * The admin dashboard has its own shell (sidebar/topbar) and must not be wrapped
 * in the public site's Header/Footer/MobileNav/cart drawer.
 *
 * Public routes remain gated behind the official 19:23 launch countdown until unlocked.
 */
export const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const [launchStatus, setLaunchStatus] = useState<LaunchStatusData | null>(null);
  // Default to false before launch time so visitors never see the normal site before 19:23
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [previewActive, setPreviewActive] = useState<boolean>(false);

  useEffect(() => {
    // Check if Super Admin preview cookie is set
    if (typeof document !== 'undefined') {
      const hasPreviewCookie = document.cookie
        .split(';')
        .some((c) => c.trim().startsWith('usm_superadmin_preview=1'));
      setPreviewActive(hasPreviewCookie);
    }

    // Query site-launch status
    api
      .getSiteLaunchStatus()
      .then((data: LaunchStatusData) => {
        setLaunchStatus(data);
        if (data && typeof data.isUnlocked === 'boolean') {
          setIsUnlocked(data.isUnlocked);
        }
      })
      .catch(() => {
        // Fallback: calculate against hardcoded target if API is unreachable
        const targetMs = new Date('2026-09-09T18:23:00.000Z').getTime();
        setIsUnlocked(Date.now() >= targetMs);
      });
  }, []);

  // Admin routes bypass the launch gate completely
  if (isAdmin) {
    return <>{children}</>;
  }

  // Before 19:23, normal public visitors only see the Launch Page
  const showLaunchGate = !isUnlocked && !previewActive;

  if (showLaunchGate) {
    return (
      <LaunchPage
        initialStatus={launchStatus}
        onUnlocked={() => setIsUnlocked(true)}
        previewMode={false}
      />
    );
  }

  return (
    <>
      {/* Super Admin Live Preview Indicator */}
      {!isUnlocked && previewActive && (
        <div className="sticky top-0 z-[120] bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-300" />
            <span>Mode Prévisualisation Super Admin — Le site public est verrouillé jusqu’à 19:23</span>
          </div>
          <button
            onClick={() => {
              document.cookie = 'usm_superadmin_preview=; path=/; max-age=0';
              setPreviewActive(false);
            }}
            className="bg-black/30 hover:bg-black/50 text-white px-3 py-1 rounded text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Voir la page de lancement
          </button>
        </div>
      )}
      <AppLayout>{children}</AppLayout>
    </>
  );
};

