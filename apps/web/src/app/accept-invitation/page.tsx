import { Suspense } from 'react';
import { AcceptInvitationView } from '../../views/AcceptInvitationView';

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Chargement...</div>}>
      <AcceptInvitationView />
    </Suspense>
  );
}
