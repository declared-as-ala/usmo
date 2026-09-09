'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PremiumFooterBody } from './PremiumFooterBody';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export const Footer: React.FC = () => {
  const { language, setActiveScreen, clubSettings } = useApp();
  const currentYear = new Date().getFullYear();
  const { canInstall, installed, promptInstall } = usePwaInstall();

  const handleInstallApp = async () => {
    if (installed) {
      alert(language === 'ar' ? 'التطبيق مثبت بالفعل على جهازك.' : 'L’application est déjà installée sur votre appareil.');
      return;
    }
    const result = await promptInstall();
    if (result === 'accepted' || result === 'dismissed') {
      return;
    }
    // Browser doesn't support the native prompt (e.g. iOS Safari) — guide the user manually.
    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert(
        language === 'ar'
          ? 'لتثبيت تطبيق الاتحاد على iPhone / iPad: اضغط على زر المشاركة (مربع مع سهم لأعلى) أسفل المتصفح، ثم اختر "إضافة إلى الشاشة الرئيسية" (Sur l’écran d’accueil).'
          : 'Pour installer l’application USM sur iPhone / iPad : appuyez sur le bouton de partage (icône carré avec flèche) au bas de Safari, puis choisissez « Sur l’écran d’accueil ».'
      );
    } else {
      alert(
        language === 'ar'
          ? 'لتثبيت التطبيق: افتح قائمة المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
          : 'Pour installer l’application : ouvrez le menu de votre navigateur (⋮) puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».'
      );
    }
  };

  return (
    <footer className="mt-auto">
      <PremiumFooterBody
        language={language}
        year={currentYear}
        settings={clubSettings}
        navigate={(screen) => setActiveScreen(screen as any)}
        install={handleInstallApp}
      />
    </footer>
  );
};
