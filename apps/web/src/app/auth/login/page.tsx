'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get('returnTo');
    const target = returnTo ? `/connexion?returnTo=${encodeURIComponent(returnTo)}` : '/connexion';
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirect />
    </Suspense>
  );
}
