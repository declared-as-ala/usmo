import { Suspense } from 'react';
import AdminBoutique from '../../../views/admin/AdminBoutique';

export default function AdminProductsRoute() {
  return (
    <Suspense fallback={null}>
      <AdminBoutique />
    </Suspense>
  );
}
