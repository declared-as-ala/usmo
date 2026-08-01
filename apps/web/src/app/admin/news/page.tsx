import { Suspense } from 'react';
import AdminNews from '../../../views/admin/AdminNews';

export default function AdminNewsRoute() {
  return (
    <Suspense fallback={null}>
      <AdminNews />
    </Suspense>
  );
}
