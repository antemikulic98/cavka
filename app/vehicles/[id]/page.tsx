import VehicleClient from './VehicleClient';

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const resolvedParams = await params;

  return (
    <div className='bg-gray-50 min-h-full'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <VehicleClient vehicleId={resolvedParams.id} />
      </div>
    </div>
  );
}
