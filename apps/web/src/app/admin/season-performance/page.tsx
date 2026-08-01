import { Suspense } from 'react';
import AdminSeasonPerformance from '../../../views/admin/AdminSeasonPerformance';

export default function AdminSeasonPerformanceRoute() {
  return (
    <Suspense fallback={null}>
      <AdminSeasonPerformance />
    </Suspense>
  );
}
