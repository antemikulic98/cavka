'use client';

import React, { useState, useEffect } from 'react';
import { Users, Fuel, Settings, Star, MapPin } from 'lucide-react';

interface Vehicle {
  _id: string;
  fullName: string;
  make: string;
  model: string;
  year: number;
  category: string;
  passengerCapacity: number;
  transmission: string;
  fuelAirCon?: string;
  fuelType?: string;
  dailyRate: number;
  currency: string;
  status: string;
  location: string;
  features: string[];
  mainImage?: string;
  images: string[];
  description?: string;
}

export default function CarCards() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vehicles for home page preview
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError('');

        // Show available vehicles for preview
        const searchParams = new URLSearchParams();
        searchParams.set('status', 'Available');
        searchParams.set('limit', '6');

        const response = await fetch(
          `/api/vehicles?${searchParams.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setVehicles(data.vehicles);
        } else {
          setError('Failed to load vehicles');
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      M: 'Mini',
      E: 'Economy',
      C: 'Compact',
      I: 'Intermediate',
      S: 'Standard',
      F: 'Fullsize',
      P: 'Premium',
      L: 'Luxury',
    };
    return categoryMap[category] || category;
  };

  const getFuelType = (vehicle: Vehicle) => {
    if (vehicle.fuelType) return vehicle.fuelType;

    // Try to extract from fuelAirCon ACRISS code
    const fuelMap: { [key: string]: string } = {
      R: 'Petrol',
      D: 'Diesel',
      H: 'Hybrid',
      E: 'Electric',
      L: 'LPG',
    };

    if (vehicle.fuelAirCon) {
      return fuelMap[vehicle.fuelAirCon[0]] || 'Petrol';
    }

    return 'Petrol';
  };

  const renderStars = (rating: number = 4.5) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'text-green-800 fill-green-800'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (rate: number, currency: string) => {
    const symbol =
      currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    return `From ${symbol}${rate}/day`;
  };

  return (
    <section id='car-cards' className='py-20 bg-white'>
      <div className='container mx-auto px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight'>
            PREMIUM
            <span className='text-green-800 block'>VEHICLE FLEET</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
            Luxury vehicles. Professional service. Unforgettable journeys.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='flex justify-center items-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
            <span className='ml-3 text-gray-700'>Loading vehicles...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className='text-center py-20'>
            <div className='text-red-500 mb-4'>⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className='bg-green-800 hover:bg-green-900 text-white font-bold px-6 py-2 rounded-lg'
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && vehicles.length === 0 && (
          <div className='text-center py-20'>
            <div className='text-gray-700 mb-4'>
              No vehicles available at the moment.
            </div>
            <p className='text-gray-500'>
              Please check back later or contact us for assistance.
            </p>
          </div>
        )}

        {/* Car Grid */}
        {!loading && !error && vehicles.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className='border-4 border-transparent hover:border-green-800 rounded-3xl p-1 transition-all duration-300 group cursor-pointer'
                onClick={() => {
                  window.location.href = `/vehicles/${vehicle._id}`;
                }}
              >
                <div className='bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300'>
                  {/* Image Container with Overlay */}
                  <div className='relative h-[28rem] overflow-hidden'>
                    {vehicle.mainImage ? (
                      <img
                        src={vehicle.mainImage}
                        alt={vehicle.fullName}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                        <div className='text-center text-gray-500'>
                          <div className='text-6xl mb-2'>🚗</div>
                          <div className='text-sm font-medium'>
                            {vehicle.make}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Header - Car Name & Info */}
                    <div className='absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6'>
                      <div className='text-white'>
                        {/* Car Name */}
                        <h3 className='text-xl font-bold mb-1'>
                          {vehicle.make.toUpperCase()}{' '}
                          {(vehicle as any).vehicleModel.toUpperCase()}{' '}
                          <span className='font-normal text-base'>
                            or similar
                          </span>
                        </h3>

                        {/* Category & Transmission */}
                        <p className='text-base opacity-90 mb-4'>
                          {getCategoryDisplayName(vehicle.category)}{' '}
                          {vehicle.transmission}
                        </p>

                        {/* Feature Pills */}
                        <div className='flex items-center space-x-3'>
                          <div className='bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 group-hover:bg-black/50 transition-colors'>
                            <Users className='h-4 w-4' />
                            <span className='text-sm font-semibold'>
                              {vehicle.passengerCapacity}
                            </span>
                          </div>
                          <div className='bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 group-hover:bg-black/50 transition-colors'>
                            <svg
                              className='h-4 w-4'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M17 6V4H7v2H2v11h3.18A3 3 0 0 0 8 19h8a3 3 0 0 0 2.82-4H22V6h-5zm-8 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z' />
                            </svg>
                            <span className='text-sm font-semibold'>2</span>
                          </div>
                          <div className='bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 group-hover:bg-black/50 transition-colors'>
                            <Settings className='h-4 w-4' />
                            <span className='text-sm font-semibold'>
                              {vehicle.transmission}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Benefits & Pricing */}
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6'>
                      <div className='text-white'>
                        {/* Benefits */}
                        <div className='flex items-center mb-4'>
                          <span className='text-green-600 text-lg mr-2'>✓</span>
                          <span className='text-sm'>
                            Unlimited kilometers included
                          </span>
                        </div>

                        {/* Pricing Section */}
                        <div className='flex items-end justify-between'>
                          <div className='flex items-baseline space-x-2'>
                            <div className='flex items-baseline'>
                              <span className='text-sm mr-1'>
                                {vehicle.currency === 'EUR'
                                  ? '€'
                                  : vehicle.currency === 'USD'
                                  ? '$'
                                  : vehicle.currency}
                              </span>
                              <span className='text-4xl font-bold'>
                                {Math.floor(vehicle.dailyRate)}
                              </span>
                              {vehicle.dailyRate % 1 > 0 && (
                                <span className='text-xl font-semibold'>
                                  .
                                  {Math.round((vehicle.dailyRate % 1) * 100)
                                    .toString()
                                    .padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <span className='text-base opacity-90'>/day</span>
                          </div>
                          <div className='text-right'>
                            <button className='bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors duration-200'>
                              Reserve Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className='text-center mt-16'>
          <div className='bg-gray-100 rounded-2xl p-8 shadow-sm border border-gray-200'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>
              Need a Custom Vehicle Solution?
            </h3>
            <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
              Our fleet specialists can arrange specialized vehicles or create
              custom packages for your specific business requirements.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-6 rounded-2xl transition-colors duration-200'>
                Contact Fleet Manager
              </button>
              <button
                onClick={() =>
                  (window.location.href =
                    '/search?pickupLocation=Zagreb Downtown&vehicleType=car')
                }
                className='border border-gray-400 hover:border-gray-500 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-2xl transition-colors duration-200'
              >
                View All Vehicles
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
