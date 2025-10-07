'use client';

import { Users, Car, Luggage, MapPin, Settings } from 'lucide-react';

interface Vehicle {
  _id: string;
  year: number;
  make: string;
  model: string;
  fullName?: string;
  licensePlate: string;
  color: string;
  mainImage?: string;
  passengerCapacity: number;
  doorCount: number;
  bigSuitcases?: number;
  smallSuitcases?: number;
  luggageCapacity?: number;
  transmission: string;
  category: string;
  location: string;
  description?: string;
  features: string[];
}

interface Booking {
  _id: string;
  customerName: string;
  totalAmount: number;
}

interface DayPricing {
  date: string;
  price: number;
  label?: string;
  type?: string;
}

interface VehicleDetailsProps {
  vehicle: Vehicle;
  bookings: Booking[];
  dayPricing: DayPricing[];
}

const getCategoryLabel = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    E: 'Economy',
    C: 'Compact',
    I: 'Intermediate',
    S: 'Standard',
    F: 'Full Size',
    P: 'Premium',
    L: 'Luxury',
    X: 'Special',
  };
  return categoryMap[category] || category;
};

export default function VehicleDetails({
  vehicle,
  bookings,
  dayPricing,
}: VehicleDetailsProps) {
  return (
    <div className='bg-white rounded-lg shadow-sm border p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        {/* Vehicle Image + Stats */}
        <div className='lg:col-span-1'>
          <div className='aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl relative overflow-hidden mb-6 shadow-sm border'>
            {vehicle.mainImage ? (
              <img
                src={vehicle.mainImage}
                alt={`${vehicle.make} ${vehicle.model}`}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <Car className='w-16 h-16 text-gray-400' />
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className='bg-white p-5 rounded-xl shadow-sm border'>
            <h4 className='text-lg font-semibold text-gray-900 mb-4'>
              Performance
            </h4>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-xl'>
                <span className='text-sm text-blue-700 font-medium'>
                  Bookings
                </span>
                <span className='text-xl font-bold text-blue-900'>
                  {bookings.length}
                </span>
              </div>
              <div className='flex items-center justify-between p-3 bg-green-50 rounded-xl'>
                <span className='text-sm text-green-700 font-medium'>
                  Revenue
                </span>
                <span className='text-xl font-bold text-green-900'>
                  €
                  {bookings.reduce(
                    (sum, booking) => sum + booking.totalAmount,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Info - Main Details */}
        <div className='lg:col-span-3'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900 mb-3'>
              {vehicle.fullName ||
                `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </h1>
            <div className='flex items-center flex-wrap gap-4 text-base'>
              <span className='font-bold bg-white text-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-300'>
                {vehicle.licensePlate}
              </span>
              <span className='font-medium text-gray-700 px-3 py-1'>
                {vehicle.color}
              </span>
              <span className='flex items-center text-gray-600 px-3 py-1'>
                <MapPin className='w-4 h-4 mr-1' />
                {vehicle.location}
              </span>
              <span className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200'>
                {getCategoryLabel(vehicle.category)} Category
              </span>
            </div>
          </div>

          {/* Modern Specs Cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-2'>
                <Users className='w-6 h-6 text-blue-600' />
                <span className='text-2xl font-bold text-gray-900'>
                  {vehicle.passengerCapacity}
                </span>
              </div>
              <p className='text-sm text-gray-600 font-medium'>Passengers</p>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-2'>
                <Car className='w-6 h-6 text-green-600' />
                <span className='text-2xl font-bold text-gray-900'>
                  {vehicle.doorCount}
                </span>
              </div>
              <p className='text-sm text-gray-600 font-medium'>Doors</p>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-2'>
                <Luggage className='w-6 h-6 text-orange-600' />
                <span className='text-2xl font-bold text-gray-900'>
                  {vehicle.bigSuitcases && vehicle.smallSuitcases
                    ? `${vehicle.bigSuitcases}+${vehicle.smallSuitcases}`
                    : vehicle.luggageCapacity || 'N/A'}
                </span>
              </div>
              <p className='text-sm text-gray-600 font-medium'>
                {vehicle.bigSuitcases && vehicle.smallSuitcases
                  ? 'Suitcases'
                  : 'Luggage'}
              </p>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-2'>
                <Settings className='w-6 h-6 text-purple-600' />
                <span className='text-2xl font-bold text-gray-900'>
                  {vehicle.transmission}
                </span>
              </div>
              <p className='text-sm text-gray-600 font-medium'>Transmission</p>
            </div>
          </div>
        </div>

        {/* Modern Features */}
        <div className='lg:col-span-1'>
          {vehicle.features && vehicle.features.length > 0 && (
            <div className='bg-white p-5 rounded-xl shadow-sm border'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Features
              </h3>
              <div className='space-y-3'>
                {vehicle.features.slice(0, 6).map((feature, index) => (
                  <div
                    key={index}
                    className='flex items-center bg-gray-50 px-3 py-2 rounded-lg'
                  >
                    <div className='w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0'></div>
                    <span className='text-sm font-medium text-gray-800'>
                      {feature}
                    </span>
                  </div>
                ))}
                {vehicle.features.length > 6 && (
                  <div className='text-center pt-2'>
                    <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                      +{vehicle.features.length - 6} more features
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description - Only if exists and not too long */}
      {vehicle.description && vehicle.description.length < 200 && (
        <div className='mt-8'>
          <div className='bg-white p-6 rounded-xl shadow-sm border'>
            <h4 className='text-lg font-semibold text-gray-900 mb-3'>
              Description
            </h4>
            <p className='text-gray-700 leading-relaxed'>
              {vehicle.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
