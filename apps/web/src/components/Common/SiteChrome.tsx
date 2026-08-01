'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';

/**
 * The admin dashboard has its own shell (sidebar/topbar) and must not be wrapped
 * in the public site's Header/Footer/MobileNav/cart drawer.
 */
export const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
};
