'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__pwaPrompt) {
      return (window as any).__pwaPrompt;
    }
    return null;
  });
  const [installed, setInstalled] = useState<boolean>(isStandalone);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__pwaPrompt) {
      setDeferredPrompt((window as any).__pwaPrompt);
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onPromptReady = () => {
      if (typeof window !== 'undefined' && (window as any).__pwaPrompt) {
        setDeferredPrompt((window as any).__pwaPrompt);
      }
    };

    const onAppInstalled = () => {
      setInstalled(true);
      (window as any).__pwaPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', onPromptReady);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', onPromptReady);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const prompt =
      deferredPrompt || (typeof window !== 'undefined' ? (window as any).__pwaPrompt : null);

    if (!prompt) return 'unavailable';

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      (window as any).__pwaPrompt = null;
      setDeferredPrompt(null);
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(
      deferredPrompt || (typeof window !== 'undefined' && (window as any).__pwaPrompt)
    ),
    installed,
    promptInstall,
  };
}
