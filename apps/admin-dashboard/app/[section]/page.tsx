import { AdminDashboard } from '../dashboard';

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <AdminDashboard section={section} />;
}
