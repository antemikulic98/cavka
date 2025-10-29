import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import AnalyticsContent from './AnalyticsContent';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <AnalyticsContent />
    </DashboardLayout>
  );
}
