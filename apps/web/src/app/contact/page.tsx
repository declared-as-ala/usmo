import type { Metadata } from 'next';
import { Contact } from '../../views/Contact';

export const metadata: Metadata = {
  title: 'Contact | Union Sportive Monastirienne',
  description: "Contactez l'Union Sportive Monastirienne : adresse, téléphone, e-mail et réseaux sociaux officiels.",
};

export default function ContactPage() {
  return <Contact />;
}
