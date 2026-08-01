import { Suspense } from 'react';
import AdminTimeline from '../../../views/admin/AdminTimeline';

export default function AdminTimelineRoute() {
  return (
    <Suspense fallback={null}>
      <AdminTimeline />
    </Suspense>
  );
}
