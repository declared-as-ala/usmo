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
    if (canInstall) {
      await promptInstall();
      return;
    }
    // Browser doesn't support the native prompt (e.g. iOS Safari) — guide the user manually.
    alert(
      language === 'ar'
        ? 'لتثبيت التطبيق: افتح قائمة المشاركة في متصفحك ثم اختر "إضافة إلى الشاشة الرئيسية".'
        : 'Pour installer l’application : ouvrez le menu de partage de votre navigateur puis choisissez « Ajouter à l’écran d’accueil ».'
    );
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
