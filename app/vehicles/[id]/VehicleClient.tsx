'use client';

import { useRouter } from 'next/navigation';
import VehicleView from '@/app/dashboard/components/VehicleView';

interface VehicleClientProps {
  vehicleId: string;
}

export default function VehicleClient({ vehicleId }: VehicleClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/vehicles');
  };

  return <VehicleView vehicleId={vehicleId} onBack={handleBack} />;
}
