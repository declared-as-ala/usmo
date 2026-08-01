import { Suspense } from 'react';
import AdminPalmaresPage from '../../../views/admin/AdminPalmaresPage';

export default function AdminPalmaresRoute() {
  return (
    <Suspense fallback={null}>
      <AdminPalmaresPage />
    </Suspense>
  );
}
