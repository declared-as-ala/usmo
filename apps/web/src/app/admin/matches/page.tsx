import { Suspense } from 'react';
import AdminMatches from '../../../views/admin/AdminMatches';

export default function AdminMatchesRoute() {
  return (
    <Suspense fallback={null}>
      <AdminMatches />
    </Suspense>
  );
}
