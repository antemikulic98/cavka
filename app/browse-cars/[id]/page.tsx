import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/admin/DashboardLayout';
import VehicleDetailsContent from './VehicleDetailsContent';

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await params;

  return (
    <DashboardLayout user={user}>
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <VehicleDetailsContent vehicleId={resolvedParams.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
