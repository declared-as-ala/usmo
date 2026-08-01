import { Suspense } from 'react';
import AdminStadium from '../../../views/admin/AdminStadium';

export default function AdminStadiumRoute() {
  return (
    <Suspense fallback={null}>
      <AdminStadium />
    </Suspense>
  );
}
