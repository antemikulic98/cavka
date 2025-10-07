'use client';

import { ArrowLeft } from 'lucide-react';

interface VehicleHeaderProps {
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function VehicleHeader({
  onBack,
  onEdit,
  onDelete,
}: VehicleHeaderProps) {
  return (
    <div className='flex items-center justify-between bg-white rounded-lg shadow-sm border p-4'>
      <button
        onClick={onBack}
        className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'
      >
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to Browse Cars
      </button>
      <div className='flex space-x-2'>
        {onEdit && (
          <button
            onClick={onEdit}
            className='px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium'
          >
            Edit Vehicle
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className='px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium'
          >
            Delete Vehicle
          </button>
        )}
      </div>
    </div>
  );
}
