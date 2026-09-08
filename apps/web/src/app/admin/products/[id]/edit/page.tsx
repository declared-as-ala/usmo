'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminProductEditRoute() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/admin/boutique?edit=${id}`);
    } else {
      router.replace('/admin/boutique');
    }
  }, [id, router]);

  return null;
}
