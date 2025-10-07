'use client';

import { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Car,
  Euro,
  Clock,
  Phone,
  User,
  CreditCard,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company?: string;
    flightNumber?: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    category: string;
    dailyRate: number;
    currency: string;
  };
  vehicleDetails?: {
    make: string;
    model: string;
    category: string;
    images?: string[];
    mainImage?: string;
  };
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  rentalDays: number;
  cdwCoverage: string;
  addOns: Record<string, boolean>;
  pricing: {
    baseDailyRate: number;
    cdwCost: number;
    addOnsCost: number;
    totalDailyRate: number;
    totalCost: number;
  };
  status: string;
  createdAt: string;
}

export default function BookingLookup() {
  const [email, setEmail] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email.trim() || !bookingReference.trim()) {
      setError('Please enter both your booking reference and email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ email: email.trim() });
      if (bookingReference.trim()) {
        params.append('reference', bookingReference.trim());
      }

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.bookings);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBookings([]);
      setSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending',
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Confirmed',
      },
      in_progress: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'In Progress',
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Completed',
      },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSelectedAddOns = (addOns: Record<string, boolean>) => {
    const addOnNames = {
      additionalDriver: 'Additional Driver',
      wifiHotspot: 'WiFi Hotspot',
      roadsideAssistance: 'Roadside Assistance',
      tireProtection: 'Tire & Windshield Protection',
      personalAccident: 'Personal Accident Protection',
      theftProtection: 'Theft Protection',
      extendedTheft: 'Extended Theft Protection',
      interiorProtection: 'Interior Protection',
    };

    return Object.entries(addOns)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => addOnNames[key as keyof typeof addOnNames])
      .filter(Boolean);
  };

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Search Form */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6 flex items-center'>
          <Search className='mr-3 h-5 w-5 text-gray-600' />
          Find Your Booking
        </h2>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Booking Reference */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Booking Reference *
            </label>
            <input
              type='text'
              value={bookingReference}
              onChange={(e) =>
                setBookingReference(e.target.value.toUpperCase())
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white text-gray-900 font-mono text-sm placeholder-gray-400'
              placeholder='CAR123456789'
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email Address *
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white text-gray-900 placeholder-gray-400'
              placeholder='your@email.com'
              required
            />
          </div>
        </div>

        <div className='text-sm text-gray-600 mb-6'>
          <p className='flex items-center'>
            <span className='inline-block w-2 h-2 bg-gray-400 rounded-full mr-2'></span>
            Both booking reference and email address are required for security
          </p>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className='w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center'
        >
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Searching...
            </>
          ) : (
            <>
              <Search className='h-4 w-4 mr-2' />
              Find My Bookings
            </>
          )}
        </button>

        {error && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-700 text-sm'>{error}</p>
          </div>
        )}
      </div>

      {/* Bookings Results */}
      {searched && (
        <div className='space-y-6'>
          {bookings.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center'>
              <Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No bookings found
              </h3>
              <p className='text-gray-600'>
                No bookings were found for the provided email
                {bookingReference && ' and booking reference'}. Please check
                your details and try again.
              </p>
            </div>
          ) : (
            <>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-white'>
                  Your Bookings ({bookings.length})
                </h2>
              </div>

              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'
                >
                  {/* Booking Header */}
                  <div className='p-6 border-b border-gray-200'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                          {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                        </h3>
                        <div className='flex items-center text-sm text-gray-600'>
                          <span className='font-medium'>Reference:</span>
                          <span className='ml-2 font-mono font-semibold text-gray-900'>
                            {booking.bookingReference}
                          </span>
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        {getStatusBadge(booking.status)}
                        <div className='text-right'>
                          <div className='text-sm text-gray-500'>
                            Total Cost
                          </div>
                          <div className='text-xl font-bold text-gray-900'>
                            €{booking.pricing.totalCost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* Dates */}
                      <div className='flex items-center'>
                        <Calendar className='h-5 w-5 text-gray-400 mr-3' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Rental Period
                          </p>
                          <p className='text-sm text-gray-600'>
                            {formatDate(booking.pickupDate)} -{' '}
                            {formatDate(booking.returnDate)}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {booking.rentalDays} days
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className='flex items-center'>
                        <MapPin className='h-5 w-5 text-gray-400 mr-3' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Pickup Location
                          </p>
                          <p className='text-sm text-gray-600'>
                            {booking.pickupLocation}
                          </p>
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className='flex items-center'>
                        <Euro className='h-5 w-5 text-gray-400 mr-3' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Total Cost
                          </p>
                          <p className='text-lg font-bold text-green-800'>
                            €{booking.pricing.totalCost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      {/* Customer Info */}
                      <div>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                          Customer Information
                        </h4>
                        <div className='space-y-3'>
                          <div className='flex items-center'>
                            <User className='h-4 w-4 text-gray-400 mr-3' />
                            <span className='text-sm text-gray-600'>
                              {booking.clientInfo.firstName}{' '}
                              {booking.clientInfo.lastName}
                            </span>
                          </div>
                          <div className='flex items-center'>
                            <Phone className='h-4 w-4 text-gray-400 mr-3' />
                            <span className='text-sm text-gray-600'>
                              {booking.clientInfo.phoneNumber}
                            </span>
                          </div>
                          {booking.clientInfo.flightNumber && (
                            <div className='flex items-center'>
                              <Clock className='h-4 w-4 text-gray-400 mr-3' />
                              <span className='text-sm text-gray-600'>
                                Flight: {booking.clientInfo.flightNumber}
                              </span>
                            </div>
                          )}
                          {booking.clientInfo.company && (
                            <div className='flex items-center'>
                              <CreditCard className='h-4 w-4 text-gray-400 mr-3' />
                              <span className='text-sm text-gray-600'>
                                Company: {booking.clientInfo.company}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Services & Add-ons */}
                      <div>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                          Services & Coverage
                        </h4>
                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>CDW Coverage:</span>
                            <span className='font-medium'>
                              {booking.cdwCoverage === 'full'
                                ? 'Full Coverage'
                                : 'Basic Coverage'}
                            </span>
                          </div>

                          {getSelectedAddOns(booking.addOns).length > 0 && (
                            <div className='mt-3'>
                              <span className='text-sm text-gray-600 block mb-2'>
                                Selected Add-ons:
                              </span>
                              <div className='flex flex-wrap gap-2'>
                                {getSelectedAddOns(booking.addOns).map(
                                  (addon, index) => (
                                    <span
                                      key={index}
                                      className='px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full'
                                    >
                                      {addon}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booking Timeline */}
                    <div className='mt-6 pt-6 border-t border-gray-200'>
                      <p className='text-sm text-gray-500'>
                        Booking created on {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
