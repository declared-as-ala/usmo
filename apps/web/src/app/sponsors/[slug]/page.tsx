import { SponsorProfile } from '../../../views/SponsorProfile';

export default async function SponsorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SponsorProfile slug={slug} />;
}
