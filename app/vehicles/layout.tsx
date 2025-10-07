import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from './DashboardLayout';

export default async function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
