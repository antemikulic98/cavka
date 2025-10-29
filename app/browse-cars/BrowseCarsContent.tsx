'use client';

import { useRouter } from 'next/navigation';
import BrowseCars from '../dashboard/components/BrowseCars';

export default function BrowseCarsContent() {
  const router = useRouter();

  const handleViewVehicle = (vehicleId: string) => {
    // Navigate to vehicle details page
    router.push(`/browse-cars/${vehicleId}`);
  };

  return <BrowseCars onViewVehicle={handleViewVehicle} />;
}
