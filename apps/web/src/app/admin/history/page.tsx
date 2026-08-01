import { Suspense } from 'react';
import AdminHistoryPage from '../../../views/admin/AdminHistoryPage';

export default function AdminHistoryRoute() {
  return (
    <Suspense fallback={null}>
      <AdminHistoryPage />
    </Suspense>
  );
}
