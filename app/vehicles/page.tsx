import VehiclesClient from './VehiclesClient';

export default function VehiclesPage() {
  return (
    <div className='bg-gray-50 min-h-full'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <VehiclesClient />
      </div>
    </div>
  );
}
