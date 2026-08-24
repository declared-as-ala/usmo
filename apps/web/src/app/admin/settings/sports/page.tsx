import { Suspense } from 'react';
import AdminSportsSettings from '../../../../views/admin/AdminSportsSettings';

export default function AdminSportsSettingsPage() {
  return (
    <Suspense fallback={null}>
      <AdminSportsSettings />
    </Suspense>
  );
}
