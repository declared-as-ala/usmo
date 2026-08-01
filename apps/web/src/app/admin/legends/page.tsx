import { Suspense } from 'react';
import AdminLegends from '../../../views/admin/AdminLegends';

export default function AdminLegendsRoute() {
  return (
    <Suspense fallback={null}>
      <AdminLegends />
    </Suspense>
  );
}
