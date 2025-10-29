'use client';

import { useRouter } from 'next/navigation';
import VehicleView from '@/app/dashboard/components/VehicleView';

interface VehicleDetailsContentProps {
  vehicleId: string;
}

export default function VehicleDetailsContent({
  vehicleId,
}: VehicleDetailsContentProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/browse-cars');
  };

  return <VehicleView vehicleId={vehicleId} onBack={handleBack} />;
}
