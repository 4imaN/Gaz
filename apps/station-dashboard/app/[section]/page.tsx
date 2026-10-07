import { StationDashboard } from '../dashboard';

export default async function StationSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <StationDashboard section={section} />;
}
