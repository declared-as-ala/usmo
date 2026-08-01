import type { Metadata } from 'next';
import { Legends } from '../../views/Legends';

export const metadata: Metadata = {
  title: 'Légendes du club | Union Sportive Monastirienne',
  description: 'Les joueurs, capitaines et bâtisseurs qui ont marqué à jamais l’histoire de l’Union Sportive Monastirienne.',
};

export default function LegendsPage() {
  return <Legends />;
}
