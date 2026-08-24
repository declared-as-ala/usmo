import { Suspense } from 'react';
import AdminSportsSync from '../../../views/admin/AdminSportsSync';

export default function AdminSportsSyncPage() {
  return (
    <Suspense fallback={null}>
      <AdminSportsSync />
    </Suspense>
  );
}
