import { Suspense } from 'react';
import AdminBoutique from '../../../views/admin/AdminBoutique';

export default function AdminBoutiqueRoute() {
  return (
    <Suspense fallback={null}>
      <AdminBoutique />
    </Suspense>
  );
}
