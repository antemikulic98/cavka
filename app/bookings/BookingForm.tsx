'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronDown,
  CheckCircle,
  X,
  Euro,
  CreditCard,
  Shield,
  Plus,
  Minus,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Types
interface Vehicle {
  _id: string;
  make: string;
  model: string;
  category: string;
  dailyRate: number;
  currency: string;
  passengerCapacity: number;
  transmission: string;
  features: string[];
  mainImage?: string;
  location: string;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  company: string;
  flightNumber: string;
  promoCode: string;
}

interface AddOns {
  additionalDriver: boolean;
  wifiHotspot: boolean;
  roadsideAssistance: boolean;
  tireProtection: boolean;
  personalAccident: boolean;
  theftProtection: boolean;
  extendedTheft: boolean;
  interiorProtection: boolean;
}

interface BookingFormProps {
  onBookingCreated?: () => void;
}

const locations = [
  'Zagreb Downtown',
  'Zagreb Airport',
  'Split Downtown',
  'Split Airport',
  'Dubrovnik Downtown',
  'Dubrovnik Airport',
  'Rijeka Downtown',
  'Pula Downtown',
  'Zadar Downtown',
];

const countries = [
  { code: '+385', name: 'Croatia', flag: '🇭🇷' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
];

const addOnsPricing = {
  additionalDriver: 4.95,
  wifiHotspot: 6.95,
  roadsideAssistance: 3.95,
  tireProtection: 4.95,
  personalAccident: 4.95,
  theftProtection: 8.95,
  extendedTheft: 10.95,
  interiorProtection: 2.1,
};

const addOnsLabels = {
  additionalDriver: 'Additional Driver',
  wifiHotspot: 'WiFi Hotspot',
  roadsideAssistance: 'Roadside Assistance',
  tireProtection: 'Tire Protection',
  personalAccident: 'Personal Accident Insurance',
  theftProtection: 'Theft Protection',
  extendedTheft: 'Extended Theft Protection',
  interiorProtection: 'Interior Protection',
};

export default function BookingForm({ onBookingCreated }: BookingFormProps) {
  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [rentalDays, setRentalDays] = useState(0);
  const [cdwCoverage, setCdwCoverage] = useState<'basic' | 'full'>('basic');
  const [addOns, setAddOns] = useState<AddOns>({
    additionalDriver: false,
    wifiHotspot: false,
    roadsideAssistance: false,
    tireProtection: false,
    personalAccident: false,
    theftProtection: false,
    extendedTheft: false,
    interiorProtection: false,
  });
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+385',
    phoneNumber: '',
    company: '',
    flightNumber: '',
    promoCode: '',
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showReturnLocationDropdown, setShowReturnLocationDropdown] =
    useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const returnLocationDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate rental days when dates change
  useEffect(() => {
    if (pickupDate && returnDate) {
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);
      const diffTime = returnD.getTime() - pickup.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(Math.max(1, diffDays));
    }
  }, [pickupDate, returnDate]);

  // Fetch vehicles when location or dates change
  useEffect(() => {
    if (pickupLocation && pickupDate && returnDate) {
      fetchAvailableVehicles();
    }
  }, [pickupLocation, pickupDate, returnDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowVehicleDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        returnLocationDropdownRef.current &&
        !returnLocationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowReturnLocationDropdown(false);
      }
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch available vehicles
  const fetchAvailableVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const params = new URLSearchParams({
        pickupDate,
        returnDate,
        location: pickupLocation,
      });

      const response = await fetch(`/api/vehicles/availability?${params}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.availableVehicles);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!selectedVehicle || !rentalDays) return { totalCost: 0, breakdown: {} };

    const baseCost = selectedVehicle.dailyRate * rentalDays;
    const cdwCost = cdwCoverage === 'full' ? 9.95 * rentalDays : 0;

    let addOnsCost = 0;
    Object.entries(addOns).forEach(([key, selected]) => {
      if (selected) {
        addOnsCost +=
          addOnsPricing[key as keyof typeof addOnsPricing] * rentalDays;
      }
    });

    const totalCost = baseCost + cdwCost + addOnsCost;

    return {
      totalCost,
      breakdown: {
        baseCost,
        cdwCost,
        addOnsCost,
      },
    };
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedVehicle) newErrors.vehicle = 'Please select a vehicle';
    if (!pickupDate) newErrors.pickupDate = 'Please select pickup date';
    if (!returnDate) newErrors.returnDate = 'Please select return date';
    if (!pickupLocation)
      newErrors.pickupLocation = 'Please select pickup location';
    if (!clientInfo.firstName) newErrors.firstName = 'First name is required';
    if (!clientInfo.lastName) newErrors.lastName = 'Last name is required';
    if (!clientInfo.email) newErrors.email = 'Email is required';
    if (!clientInfo.phoneNumber)
      newErrors.phoneNumber = 'Phone number is required';

    // Email validation
    if (clientInfo.email && !/\S+@\S+\.\S+/.test(clientInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date validation
    if (pickupDate && returnDate) {
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickup < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
      if (returnD <= pickup) {
        newErrors.returnDate = 'Return date must be after pickup date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedVehicle) return;

    setLoading(true);

    try {
      const bookingData = {
        clientInfo,
        vehicleId: selectedVehicle._id,
        pickupDate: new Date(pickupDate).toISOString(),
        returnDate: new Date(returnDate).toISOString(),
        pickupLocation,
        rentalDays,
        cdwCoverage,
        addOns,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();

      if (result.success) {
        alert(
          `🎉 Booking created successfully!\n\nBooking Reference: ${
            result.booking.bookingReference
          }\n\nTotal Cost: €${result.booking.pricing.totalCost.toFixed(2)}`
        );

        // Reset form
        resetForm();
        onBookingCreated?.();
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(
        `❌ ${
          error instanceof Error ? error.message : 'Failed to create booking'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedVehicle(null);
    setPickupDate('');
    setReturnDate('');
    setPickupLocation('');
    setReturnLocation('');
    setRentalDays(0);
    setCdwCoverage('basic');
    setAddOns({
      additionalDriver: false,
      wifiHotspot: false,
      roadsideAssistance: false,
      tireProtection: false,
      personalAccident: false,
      theftProtection: false,
      extendedTheft: false,
      interiorProtection: false,
    });
    setClientInfo({
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+385',
      phoneNumber: '',
      company: '',
      flightNumber: '',
      promoCode: '',
    });
    setErrors({});
  };

  const pricing = calculatePricing();

  return (
    <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Create New Booking
        </h2>
        <p className='text-gray-600'>
          Fill out the form below to create a new booking directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-8'>
        {/* Date and Location Selection */}
        <div className='bg-gray-50 rounded-xl p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Calendar className='h-5 w-5 mr-2 text-emerald-600' />
            Rental Details
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Pickup Date */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Pickup Date *
              </label>
              <input
                type='date'
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 ${
                  errors.pickupDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pickupDate && (
                <p className='text-red-500 text-sm mt-1'>{errors.pickupDate}</p>
              )}
            </div>

            {/* Return Date */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Return Date *
              </label>
              <input
                type='date'
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={pickupDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 ${
                  errors.returnDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.returnDate && (
                <p className='text-red-500 text-sm mt-1'>{errors.returnDate}</p>
              )}
            </div>

            {/* Rental Days Display */}
            {rentalDays > 0 && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rental Period
                </label>
                <div className='flex items-center px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg'>
                  <Clock className='h-4 w-4 text-emerald-600 mr-2' />
                  <span className='text-emerald-800 font-medium'>
                    {rentalDays} days
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
            {/* Pickup Location */}
            <div className='relative' ref={locationDropdownRef}>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Pickup Location *
              </label>
              <button
                type='button'
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.pickupLocation ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <span
                    className={
                      pickupLocation ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    {pickupLocation || 'Select pickup location'}
                  </span>
                  <ChevronDown className='h-4 w-4 text-gray-400' />
                </div>
              </button>

              {showLocationDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  {locations.map((location) => (
                    <button
                      key={location}
                      type='button'
                      onClick={() => {
                        setPickupLocation(location);
                        setShowLocationDropdown(false);
                      }}
                      className='w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors'
                    >
                      <div className='flex items-center'>
                        <MapPin className='h-4 w-4 text-gray-400 mr-3' />
                        {location}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.pickupLocation && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.pickupLocation}
                </p>
              )}
            </div>

            {/* Return Location */}
            <div className='relative' ref={returnLocationDropdownRef}>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Return Location
              </label>
              <button
                type='button'
                onClick={() =>
                  setShowReturnLocationDropdown(!showReturnLocationDropdown)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              >
                <div className='flex items-center justify-between'>
                  <span
                    className={
                      returnLocation ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    {returnLocation || 'Same as pickup'}
                  </span>
                  <ChevronDown className='h-4 w-4 text-gray-400' />
                </div>
              </button>

              {showReturnLocationDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  <button
                    type='button'
                    onClick={() => {
                      setReturnLocation('');
                      setShowReturnLocationDropdown(false);
                    }}
                    className='w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors border-b'
                  >
                    <div className='flex items-center'>
                      <MapPin className='h-4 w-4 text-gray-400 mr-3' />
                      Same as pickup
                    </div>
                  </button>
                  {locations.map((location) => (
                    <button
                      key={location}
                      type='button'
                      onClick={() => {
                        setReturnLocation(location);
                        setShowReturnLocationDropdown(false);
                      }}
                      className='w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors'
                    >
                      <div className='flex items-center'>
                        <MapPin className='h-4 w-4 text-gray-400 mr-3' />
                        {location}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        {pickupLocation && pickupDate && returnDate && (
          <div className='bg-gray-50 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <Car className='h-5 w-5 mr-2 text-emerald-600' />
              Vehicle Selection
            </h3>

            <div className='relative' ref={vehicleDropdownRef}>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Vehicle *
              </label>
              <button
                type='button'
                onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                disabled={vehiclesLoading}
                className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.vehicle ? 'border-red-500' : 'border-gray-300'
                } ${vehiclesLoading ? 'opacity-50' : ''}`}
              >
                <div className='flex items-center justify-between'>
                  {vehiclesLoading ? (
                    <span className='text-gray-400'>Loading vehicles...</span>
                  ) : selectedVehicle ? (
                    <div className='flex items-center'>
                      <Car className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-gray-900'>
                        {selectedVehicle.make} {selectedVehicle.model} - €
                        {selectedVehicle.dailyRate}/day
                      </span>
                    </div>
                  ) : (
                    <span className='text-gray-400'>Select a vehicle</span>
                  )}
                  <ChevronDown className='h-4 w-4 text-gray-400' />
                </div>
              </button>

              {showVehicleDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto'>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <button
                        key={vehicle._id}
                        type='button'
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowVehicleDropdown(false);
                        }}
                        className='w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b last:border-b-0'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <Car className='h-4 w-4 text-gray-400 mr-3' />
                            <div>
                              <div className='font-medium text-gray-900'>
                                {vehicle.make} {vehicle.model}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {vehicle.category} • {vehicle.transmission} •{' '}
                                {vehicle.passengerCapacity} seats
                              </div>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='font-semibold text-gray-900'>
                              €{vehicle.dailyRate}
                            </div>
                            <div className='text-sm text-gray-500'>per day</div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className='px-4 py-6 text-center text-gray-500'>
                      <Car className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                      <p>
                        No vehicles available for the selected dates and
                        location.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {errors.vehicle && (
                <p className='text-red-500 text-sm mt-1'>{errors.vehicle}</p>
              )}
            </div>
          </div>
        )}

        {/* Coverage and Add-ons */}
        {selectedVehicle && (
          <div className='bg-gray-50 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <Shield className='h-5 w-5 mr-2 text-emerald-600' />
              Coverage & Add-ons
            </h3>

            {/* CDW Coverage */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Collision Damage Waiver (CDW)
              </label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    cdwCoverage === 'basic'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='cdw'
                    value='basic'
                    checked={cdwCoverage === 'basic'}
                    onChange={() => setCdwCoverage('basic')}
                    className='sr-only'
                  />
                  <div className='flex items-center justify-between mb-2'>
                    <span className='font-medium text-gray-900'>
                      Basic Coverage
                    </span>
                    {cdwCoverage === 'basic' && (
                      <CheckCircle className='h-5 w-5 text-emerald-500' />
                    )}
                  </div>
                  <p className='text-sm text-gray-600'>
                    Included at no additional cost
                  </p>
                </label>

                <label
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    cdwCoverage === 'full'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='cdw'
                    value='full'
                    checked={cdwCoverage === 'full'}
                    onChange={() => setCdwCoverage('full')}
                    className='sr-only'
                  />
                  <div className='flex items-center justify-between mb-2'>
                    <span className='font-medium text-gray-900'>
                      Full Coverage
                    </span>
                    {cdwCoverage === 'full' && (
                      <CheckCircle className='h-5 w-5 text-emerald-500' />
                    )}
                  </div>
                  <p className='text-sm text-gray-600'>+€9.95 per day</p>
                </label>
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                Additional Services
              </label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {Object.entries(addOns).map(([key, selected]) => (
                  <label
                    key={key}
                    className='flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'
                  >
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={selected}
                        onChange={(e) =>
                          setAddOns({ ...addOns, [key]: e.target.checked })
                        }
                        className='h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded'
                      />
                      <span className='ml-3 text-sm text-gray-900'>
                        {addOnsLabels[key as keyof typeof addOnsLabels]}
                      </span>
                    </div>
                    <span className='text-sm text-gray-600'>
                      +€{addOnsPricing[key as keyof typeof addOnsPricing]}/day
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Client Information */}
        <div className='bg-gray-50 rounded-xl p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <User className='h-5 w-5 mr-2 text-emerald-600' />
            Client Information
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            {/* First Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                First Name *
              </label>
              <input
                type='text'
                value={clientInfo.firstName}
                onChange={(e) =>
                  setClientInfo({ ...clientInfo, firstName: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter first name'
              />
              {errors.firstName && (
                <p className='text-red-500 text-sm mt-1'>{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Last Name *
              </label>
              <input
                type='text'
                value={clientInfo.lastName}
                onChange={(e) =>
                  setClientInfo({ ...clientInfo, lastName: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter last name'
              />
              {errors.lastName && (
                <p className='text-red-500 text-sm mt-1'>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address *
              </label>
              <input
                type='email'
                value={clientInfo.email}
                onChange={(e) =>
                  setClientInfo({ ...clientInfo, email: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter email address'
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Phone Number *
              </label>
              <div className='flex'>
                {/* Country Code Dropdown */}
                <div className='relative' ref={countryDropdownRef}>
                  <button
                    type='button'
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className='px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  >
                    <span className='flex items-center'>
                      {countries.find((c) => c.code === clientInfo.countryCode)
                        ?.flag || '🏳️'}{' '}
                      {clientInfo.countryCode}
                      <ChevronDown className='h-4 w-4 ml-1 text-gray-400' />
                    </span>
                  </button>

                  {showCountryDropdown && (
                    <div className='absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 max-h-60 overflow-y-auto'>
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type='button'
                          onClick={() => {
                            setClientInfo({
                              ...clientInfo,
                              countryCode: country.code,
                            });
                            setShowCountryDropdown(false);
                          }}
                          className='w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors flex items-center'
                        >
                          <span className='mr-3'>{country.flag}</span>
                          <span className='flex-1'>{country.name}</span>
                          <span className='text-gray-500'>{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type='tel'
                  value={clientInfo.phoneNumber}
                  onChange={(e) =>
                    setClientInfo({
                      ...clientInfo,
                      phoneNumber: e.target.value,
                    })
                  }
                  className={`flex-1 px-4 py-3 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Enter phone number'
                />
              </div>
              {errors.phoneNumber && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Company */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Company (Optional)
              </label>
              <input
                type='text'
                value={clientInfo.company}
                onChange={(e) =>
                  setClientInfo({ ...clientInfo, company: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900'
                placeholder='Enter company name'
              />
            </div>

            {/* Flight Number */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Flight Number (Optional)
              </label>
              <input
                type='text'
                value={clientInfo.flightNumber}
                onChange={(e) =>
                  setClientInfo({ ...clientInfo, flightNumber: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900'
                placeholder='Enter flight number'
              />
            </div>
          </div>

          {/* Promo Code */}
          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Promo Code (Optional)
            </label>
            <input
              type='text'
              value={clientInfo.promoCode}
              onChange={(e) =>
                setClientInfo({ ...clientInfo, promoCode: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900'
              placeholder='Enter promo code'
            />
          </div>
        </div>

        {/* Pricing Summary */}
        {selectedVehicle && rentalDays > 0 && (
          <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <Euro className='h-5 w-5 mr-2 text-emerald-600' />
              Pricing Summary
            </h3>

            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>
                  {selectedVehicle.make} {selectedVehicle.model} ({rentalDays}{' '}
                  days)
                </span>
                <span className='text-gray-900'>
                  €{pricing.breakdown.baseCost?.toFixed(2) || '0.00'}
                </span>
              </div>

              {cdwCoverage === 'full' && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>
                    Full CDW Coverage ({rentalDays} days)
                  </span>
                  <span className='text-gray-900'>
                    €{pricing.breakdown.cdwCost?.toFixed(2) || '0.00'}
                  </span>
                </div>
              )}

              {pricing.breakdown.addOnsCost > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>
                    Add-ons ({rentalDays} days)
                  </span>
                  <span className='text-gray-900'>
                    €{pricing.breakdown.addOnsCost?.toFixed(2) || '0.00'}
                  </span>
                </div>
              )}

              <hr className='border-emerald-200' />

              <div className='flex justify-between text-lg font-bold'>
                <span className='text-gray-900'>Total</span>
                <span className='text-emerald-700'>
                  €{pricing.totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className='flex flex-col sm:flex-row gap-4 justify-end'>
          <button
            type='button'
            onClick={resetForm}
            className='px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium'
          >
            Reset Form
          </button>

          <button
            type='submit'
            disabled={loading || !selectedVehicle}
            className='px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {loading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Creating Booking...
              </>
            ) : (
              <>
                <CreditCard className='h-4 w-4 mr-2' />
                Create Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
