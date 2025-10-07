'use client';

import { useRouter } from 'next/navigation';
import BrowseCars from '@/app/dashboard/components/BrowseCars';

export default function VehiclesClient() {
  const router = useRouter();

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  return <BrowseCars onRefresh={() => {}} onViewVehicle={handleViewVehicle} />;
}
