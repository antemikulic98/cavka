import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import OverbookingManagement from '../dashboard/components/OverbookingManagement';

export default async function OverbookingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Overbooking Management
            </h1>
            <p className='text-lg text-gray-600'>
              Manage overbooked rentals and arrange external car sources
            </p>
          </div>
          <OverbookingManagement />
        </div>
      </div>
    </DashboardLayout>
  );
}
