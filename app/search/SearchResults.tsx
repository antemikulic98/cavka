'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Fuel,
  Settings,
  Star,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import BookingModal from './BookingModal';
import SearchBar from './SearchBar';

interface Vehicle {
  _id: string;
  fullName: string;
  make: string;
  model: string;
  year: number;
  category: string;
  acrissCode?: string;
  type?: 'rental' | 'transfer';
  passengerCapacity: number;
  transmission: string;
  fuelAirCon?: string;
  fuelType?: string;
  dailyRate: number;
  customPricing?: {
    date: string;
    price: number;
    label?: string;
    type?: string;
  }[];
  currency: string;
  status: string;
  location: string;
  features: string[];
  mainImage?: string;
  images: string[];
  description?: string;
  trips?: {
    from: string;
    to: string;
    price: number;
    duration?: string;
    distance?: string;
  }[];
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Get search criteria from URL
  const pickupLocation = searchParams.get('pickupLocation') || '';
  const returnLocation = searchParams.get('returnLocation') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const returnTime = searchParams.get('returnTime') || '';
  const vehicleType = searchParams.get('vehicleType') || 'car';
  const vehicleId = searchParams.get('vehicleId') || '';
  const expandSearch = searchParams.get('expandSearch') === 'true';

  // Fetch vehicles based on search criteria
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError('');

        const apiSearchParams = new URLSearchParams();

        // Add pickup and return dates for availability check
        if (pickupDate) {
          apiSearchParams.set('pickupDate', pickupDate);
        }
        if (returnDate) {
          apiSearchParams.set('returnDate', returnDate);
        }

        // Add vehicle type filter (rental or transfer)
        if (vehicleType) {
          const type = vehicleType === 'car' ? 'rental' : 'transfer';
          apiSearchParams.set('type', type);
        }

        // Use availability endpoint to check vehicle availability
        const response = await fetch(
          `/api/vehicles/availability?${apiSearchParams.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          let vehiclesList = data.vehicles || [];

          // If a specific vehicle ID is provided, sort to show it first
          if (vehicleId) {
            vehiclesList = vehiclesList.sort((a: Vehicle, b: Vehicle) => {
              if (a._id === vehicleId) return -1;
              if (b._id === vehicleId) return 1;
              return 0;
            });
          }

          setVehicles(vehiclesList);
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
  }, [pickupLocation, pickupDate, returnDate, vehicleType, vehicleId]);

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

  const formatPrice = (rate: number, currency: string) => {
    const symbol =
      currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    return `${symbol}${rate}`;
  };

  // Format price with large main number and small cents
  const formatPriceWithCents = (rate: number, currency: string) => {
    const symbol =
      currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    const wholePart = Math.floor(rate);
    const centsPart = Math.round((rate - wholePart) * 100);

    return {
      symbol,
      whole: wholePart,
      cents: centsPart,
      hasDecimals: centsPart > 0,
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate number of rental days based on actual time difference
  const calculateRentalDays = () => {
    if (!pickupDate || !returnDate) return 1;

    // Parse full datetime strings including time
    const pickup = new Date(pickupDate);
    const returnDay = new Date(returnDate);

    // Calculate difference in milliseconds
    const diffTime = returnDay.getTime() - pickup.getTime();

    // If return time is before or equal to pickup time, return 0 (invalid)
    if (diffTime <= 0) return 1;

    // Convert to days and round up (any partial day counts as a full day)
    // This allows same-day rentals (e.g., 8:00 AM to 10:00 PM = 1 day)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 1); // Minimum 1 day
  };

  // Handle opening booking modal
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsBookingModalOpen(true);
  };

  // Handle closing booking modal
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedVehicle(null);
  };

  // Get matching trip price for transfer vehicles
  const getMatchingTrip = (vehicle: Vehicle) => {
    if (vehicle.type !== 'transfer' || !vehicle.trips || vehicle.trips.length === 0) {
      return null;
    }

    // Find a trip that matches the pickup and return locations
    const matchingTrip = vehicle.trips.find(
      (trip) =>
        trip.from.toLowerCase() === pickupLocation.toLowerCase() &&
        trip.to.toLowerCase() === returnLocation.toLowerCase()
    );

    return matchingTrip || vehicle.trips[0]; // Return first trip if no match
  };

  // Get price for a specific date string (YYYY-MM-DD), checking custom pricing first
  const getPriceForDateString = (vehicle: Vehicle, dateStr: string): number => {
    // Debug logging
    const customDates = vehicle.customPricing?.map(p => p.date) || [];
    console.log('🔍 getPriceForDate DEBUG:', {
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      lookingForDate: dateStr,
      hasCustomPricing: !!vehicle.customPricing,
      customPricingCount: vehicle.customPricing?.length || 0,
      customPricingDates: customDates,
      customPricingFull: vehicle.customPricing, // Show full pricing objects
      dailyRate: vehicle.dailyRate,
    });

    console.log('🎯 Exact date comparison:', {
      lookingFor: dateStr,
      availableDates: customDates,
      matches: customDates.map(d => ({ date: d, matches: d === dateStr })),
    });

    // Check if there's custom pricing for this date
    if (vehicle.customPricing && vehicle.customPricing.length > 0) {
      const customPrice = vehicle.customPricing.find(p => p.date === dateStr);
      if (customPrice) {
        console.log('✅ Found custom price:', customPrice.price, 'for date:', dateStr);
        return customPrice.price;
      } else {
        console.log('❌ No custom price found for date:', dateStr);
      }
    }

    // Fall back to daily rate
    console.log('📊 Using daily rate:', vehicle.dailyRate);
    return vehicle.dailyRate;
  };

  // Calculate average daily rate with custom pricing
  const getAverageDailyRate = (vehicle: Vehicle): number => {
    if (vehicle.type === 'transfer') {
      const trip = getMatchingTrip(vehicle);
      return trip ? trip.price : vehicle.dailyRate;
    }

    const totalPrice = calculateTotalPriceValue(vehicle);
    const days = calculateRentalDays();
    return days > 0 ? totalPrice / days : vehicle.dailyRate;
  };

  // Calculate total price value (number only)
  const calculateTotalPriceValue = (vehicle: Vehicle): number => {
    // For transfers, show trip price
    if (vehicle.type === 'transfer') {
      const trip = getMatchingTrip(vehicle);
      return trip ? trip.price : vehicle.dailyRate;
    }

    // For rentals, calculate based on days with custom pricing
    const days = calculateRentalDays();
    let total = 0;

    // Calculate price for each day in the rental period
    // Work with date strings directly to avoid timezone issues
    const pickupDateStr = pickupDate.split('T')[0]; // Get YYYY-MM-DD only
    const [year, month, day] = pickupDateStr.split('-').map(Number);

    for (let i = 0; i < days; i++) {
      // Calculate the date for day i by adding i days
      const currentDay = day + i;
      const dateObj = new Date(year, month - 1, currentDay);

      // Format as YYYY-MM-DD string
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const currentDateStr = `${yyyy}-${mm}-${dd}`;

      total += getPriceForDateString(vehicle, currentDateStr);
    }

    return total;
  };

  // Calculate total price for the rental period or trip
  const calculateTotalPrice = (vehicle: Vehicle) => {
    const symbol =
      vehicle.currency === 'EUR' ? '€' : vehicle.currency === 'USD' ? '$' : vehicle.currency;

    const total = calculateTotalPriceValue(vehicle);
    const days = calculateRentalDays();

    return {
      days,
      total,
      formatted: `${symbol}${total.toLocaleString()}`,
      isTrip: vehicle.type === 'transfer',
    };
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Search Bar */}
      <SearchBar
        initialPickupLocation={pickupLocation}
        initialReturnLocation={returnLocation}
        initialPickupDate={pickupDate}
        initialReturnDate={returnDate}
        initialPickupTime={pickupTime}
        initialReturnTime={returnTime}
        initialVehicleType={vehicleType}
        initialExpanded={expandSearch}
      />

      {/* Results */}
      <div className='container mx-auto px-4 lg:px-6 py-8'>
        {/* Results Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-2'>
            <h1 className='text-3xl font-light text-gray-900'>
              Available{' '}
              <span className='font-semibold text-green-800'>Vehicles</span>
            </h1>
            <Link
              href='/'
              className='inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-md hover:shadow-lg font-medium'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Home
            </Link>
          </div>
          <p className='text-gray-600'>
            {loading ? 'Searching...' : `${vehicles.length} vehicles found`}
            {pickupLocation && ` in ${pickupLocation}`}
            {pickupDate && returnDate && (
              <span className='ml-2'>
                • {calculateRentalDays()}{' '}
                {calculateRentalDays() === 1 ? 'day' : 'days'} rental
              </span>
            )}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className='flex justify-center items-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
            <span className='ml-3 text-gray-600'>Loading vehicles...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className='text-center py-20'>
            <div className='text-red-600 mb-4'>⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className='bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg'
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && vehicles.length === 0 && (
          <div className='text-center py-20'>
            <div className='text-gray-600 mb-4'>
              No vehicles available in {pickupLocation} for your selected dates.
            </div>
            <p className='text-gray-500 mb-6'>
              Try adjusting your search criteria or choose a different location.
            </p>
            <Link
              href='/'
              className='bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg inline-block'
            >
              Modify Search
            </Link>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && !error && vehicles.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className='border-4 border-transparent hover:border-green-800 rounded-xl p-1 transition-all duration-300 group cursor-pointer'
                onClick={() => handleVehicleSelect(vehicle)}
              >
                <div className='bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300'>
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
                          {(
                            (vehicle as any).vehicleModel ||
                            (vehicle as any).model
                          )?.toUpperCase()}{' '}
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
                            <span className='text-sm font-semibold'>
                              {(vehicle as any).bigSuitcases || 2}
                            </span>
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
                          <span className='text-green-400 text-lg mr-2'>✓</span>
                          <span className='text-sm'>
                            Unlimited kilometers included
                          </span>
                        </div>

                        {/* Pricing Section */}
                        <div className='flex items-end justify-between'>
                          <div className='flex items-baseline space-x-2'>
                            <div className='flex items-baseline'>
                              <span className='text-sm mr-1'>
                                {
                                  formatPriceWithCents(
                                    vehicle.type === 'transfer'
                                      ? (getMatchingTrip(vehicle)?.price || vehicle.dailyRate)
                                      : vehicle.dailyRate,
                                    vehicle.currency
                                  ).symbol
                                }
                              </span>
                              <span className='text-4xl font-bold'>
                                {
                                  formatPriceWithCents(
                                    getAverageDailyRate(vehicle),
                                    vehicle.currency
                                  ).whole
                                }
                              </span>
                              {formatPriceWithCents(
                                getAverageDailyRate(vehicle),
                                vehicle.currency
                              ).hasDecimals && (
                                <span className='text-xl font-semibold'>
                                  .
                                  {formatPriceWithCents(
                                    getAverageDailyRate(vehicle),
                                    vehicle.currency
                                  )
                                    .cents.toString()
                                    .padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <span className='text-base opacity-90'>
                              {vehicle.type === 'transfer' ? '/trip' : '/day'}
                            </span>
                          </div>
                          <div className='text-right'>
                            <div className='text-lg font-medium opacity-75'>
                              {calculateTotalPrice(vehicle).formatted} total
                            </div>
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

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          vehicle={selectedVehicle}
          pickupDate={pickupDate}
          returnDate={returnDate}
          pickupLocation={pickupLocation}
          rentalDays={calculateRentalDays()}
          totalPrice={
            selectedVehicle
              ? calculateTotalPrice(selectedVehicle).formatted
              : ''
          }
        />
      </div>
    </div>
  );
}
