import type { Metadata } from 'next';
import { StaffGrid } from '../../../views/StaffGrid';

export const metadata: Metadata = {
  title: 'Staff Technique Basketball | Union Sportive Monastirienne',
  description: 'Découvrez le staff technique de la section basketball de l’US Monastir.',
};

export default function BasketballStaffPage() {
  return <StaffGrid sport="basketball" />;
}
