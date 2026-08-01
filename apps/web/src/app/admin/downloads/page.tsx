import { Suspense } from 'react';
import AdminDownloads from '../../../views/admin/AdminDownloads';

export default function AdminDownloadsRoute() {
  return (
    <Suspense fallback={null}>
      <AdminDownloads />
    </Suspense>
  );
}
