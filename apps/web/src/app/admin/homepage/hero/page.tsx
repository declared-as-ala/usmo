import { Suspense } from 'react';
import AdminHeroSlides from '../../../../views/admin/AdminHeroSlides';

export default function AdminHeroSlidesRoute() {
  return (
    <Suspense fallback={null}>
      <AdminHeroSlides />
    </Suspense>
  );
}
