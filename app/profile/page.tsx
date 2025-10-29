import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProfileContent from './ProfileContent';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <ProfileContent user={user} />
    </DashboardLayout>
  );
}
