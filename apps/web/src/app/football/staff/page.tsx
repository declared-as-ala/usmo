import type { Metadata } from 'next';
import { StaffGrid } from '../../../views/StaffGrid';

export const metadata: Metadata = {
  title: 'Staff Technique Football | Union Sportive Monastirienne',
  description: 'Découvrez le staff technique de la section football de l’US Monastir.',
};

export default function FootballStaffPage() {
  return <StaffGrid sport="football" />;
}
