import { Suspense } from 'react';
import AdminTrophies from '../../../views/admin/AdminTrophies';

export default function AdminTrophiesRoute() {
  return (
    <Suspense fallback={null}>
      <AdminTrophies />
    </Suspense>
  );
}
