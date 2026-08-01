import { Suspense } from 'react';
import AdminSponsors from '../../../views/admin/AdminSponsors';

export default function AdminSponsorsRoute() {
  return (
    <Suspense fallback={null}>
      <AdminSponsors />
    </Suspense>
  );
}
