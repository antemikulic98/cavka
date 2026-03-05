import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import VehicleOrderManager from '@/app/dashboard/components/VehicleOrderManager';

export default async function VehicleOrderPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <VehicleOrderManager />
        </div>
      </div>
    </DashboardLayout>
  );
}
