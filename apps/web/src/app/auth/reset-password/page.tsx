'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const target = token ? `/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}` : '/reinitialiser-mot-de-passe';
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordRedirect />
    </Suspense>
  );
}
