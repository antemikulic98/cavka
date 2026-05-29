'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Search, X, Plus, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressAutocomplete from '../components/AddressAutocomplete';

interface SearchBarProps {
  initialPickupLocation: string;
  initialReturnLocation: string;
  initialPickupDate: string;
  initialReturnDate: string;
  initialPickupTime: string;
  initialReturnTime: string;
  initialVehicleType: string;
  initialExpanded?: boolean;
}

export default function SearchBar({
  initialPickupLocation,
  initialReturnLocation,
  initialPickupDate,
  initialReturnDate,
  initialPickupTime,
  initialReturnTime,
  initialVehicleType,
  initialExpanded = false,
}: SearchBarProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const isTransfer = initialVehicleType === 'transfer' || initialVehicleType === 'transfers';
  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation);
  const [returnLocation, setReturnLocation] = useState(initialReturnLocation);

  // Transfer address coordinates
  const [pickupLat, setPickupLat] = useState<number | null>(
    currentSearchParams ? parseFloat(currentSearchParams.get('fromLat') || '') || null : null
  );
  const [pickupLng, setPickupLng] = useState<number | null>(
    currentSearchParams ? parseFloat(currentSearchParams.get('fromLng') || '') || null : null
  );
  const [returnLat, setReturnLat] = useState<number | null>(
    currentSearchParams ? parseFloat(currentSearchParams.get('toLat') || '') || null : null
  );
  const [returnLng, setReturnLng] = useState<number | null>(
    currentSearchParams ? parseFloat(currentSearchParams.get('toLng') || '') || null : null
  );
  const [showReturnLocation, setShowReturnLocation] = useState(isTransfer || !!initialReturnLocation);
  const [pickupDate, setPickupDate] = useState(initialPickupDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [pickupTime, setPickupTime] = useState(initialPickupTime);
  const [returnTime, setReturnTime] = useState(initialReturnTime);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showReturnDropdown, setShowReturnDropdown] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  const pickupDropdownRef = useRef<HTMLDivElement>(null);
  const returnDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const serviceType = isTransfer ? 'transfer' : 'rental';
        const response = await fetch(`/api/settings/locations?activeOnly=true&serviceType=${serviceType}`);
        const data = await response.json();
        if (data.success) {
          setLocations(data.locations.map((loc: any) => loc.name));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, [isTransfer]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickupDropdownRef.current &&
        !pickupDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPickupDropdown(false);
      }
      if (
        returnDropdownRef.current &&
        !returnDropdownRef.current.contains(event.target as Node)
      ) {
        setShowReturnDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!pickupLocation || !pickupDate || !returnDate) {
      return;
    }
    const searchParams = new URLSearchParams();
    searchParams.set('pickupLocation', pickupLocation);
    if (showReturnLocation && returnLocation) {
      searchParams.set('returnLocation', returnLocation);
    }
    searchParams.set('pickupDate', pickupDate);
    searchParams.set('returnDate', returnDate);
    searchParams.set('pickupTime', pickupTime);
    searchParams.set('returnTime', returnTime);
    searchParams.set('vehicleType', initialVehicleType);

    // For transfers, pass coordinates
    if (isTransfer) {
      if (pickupLat && pickupLng) {
        searchParams.set('fromLat', pickupLat.toString());
        searchParams.set('fromLng', pickupLng.toString());
      }
      if (returnLat && returnLng) {
        searchParams.set('toLat', returnLat.toString());
        searchParams.set('toLng', returnLng.toString());
      }
    }

    router.push(`/search?${searchParams.toString()}`);
    setExpanded(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className='sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md'>
      <div className='container mx-auto px-4 py-3'>
        {/* Compact View */}
        {!expanded && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4 text-sm flex-1'>
              <div className='flex items-center'>
                <MapPin className='h-4 w-4 text-emerald-600 mr-2' />
                <span className='font-semibold text-gray-900'>
                  {pickupLocation}
                </span>
                {returnLocation && (
                  <>
                    <span className='mx-2 text-gray-400'>→</span>
                    <span className='font-semibold text-gray-900'>
                      {returnLocation}
                    </span>
                  </>
                )}
              </div>
              <div className='hidden md:flex items-center'>
                <Calendar className='h-4 w-4 text-emerald-600 mr-2' />
                <span className='text-gray-700'>
                  {isTransfer ? formatDate(pickupDate) : `${formatDate(pickupDate)} - ${formatDate(returnDate)}`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className='bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-950 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              Modify Search
            </button>
          </div>
        )}

        {/* Expanded View */}
        {expanded && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-900'>
                Modify Your Search
              </h3>
              <button
                onClick={() => setExpanded(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isTransfer ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
              {/* Pickup Location / From */}
              <div className='relative' ref={pickupDropdownRef}>
                <label className='block text-sm font-bold text-gray-800 mb-2'>
                  {isTransfer ? 'From' : 'Pickup Location'}
                </label>
                {isTransfer ? (
                  <AddressAutocomplete
                    value={pickupLocation}
                    onChange={(val, lat, lng) => {
                      setPickupLocation(val);
                      setPickupLat(lat);
                      setPickupLng(lng);
                    }}
                    placeholder='Enter pickup address'
                  />
                ) : (
                <>
                <button
                  onClick={() => {
                    setShowPickupDropdown(!showPickupDropdown);
                    setShowReturnDropdown(false);
                  }}
                  className='w-full flex items-center justify-between px-4 py-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
                >
                  <div className='flex items-center'>
                    <MapPin className='h-5 w-5 text-green-600 mr-3' />
                    <span className='text-sm font-medium text-gray-900'>
                      {pickupLocation}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-green-600 transition-transform duration-200 ${
                      showPickupDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showPickupDropdown && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50'>
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setPickupLocation(location);
                          setShowPickupDropdown(false);
                        }}
                        className='w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium first:rounded-t-xl last:rounded-b-xl'
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
                </>
                )}
              </div>

              {/* Return Location / To */}
              <div className='relative' ref={returnDropdownRef}>
                <label className='block text-sm font-bold text-gray-800 mb-2'>
                  {isTransfer ? 'To' : (showReturnLocation ? 'Return Location' : '\u00A0')}
                </label>
                {!showReturnLocation && !isTransfer ? (
                  <button
                    onClick={() => setShowReturnLocation(true)}
                    className='w-full flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-green-800 hover:text-green-900 hover:border-gray-400 font-semibold transition-all duration-200 text-sm bg-white'
                  >
                    <Plus className='h-5 w-5 mr-2' />
                    Add different return
                  </button>
                ) : isTransfer ? (
                  <AddressAutocomplete
                    value={returnLocation}
                    onChange={(val, lat, lng) => {
                      setReturnLocation(val);
                      setReturnLat(lat);
                      setReturnLng(lng);
                    }}
                    placeholder='Enter destination address'
                  />
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowReturnDropdown(!showReturnDropdown);
                        setShowPickupDropdown(false);
                      }}
                      className='w-full flex items-center justify-between px-4 py-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'
                    >
                      <div className='flex items-center'>
                        <MapPin className='h-5 w-5 text-green-600 mr-3' />
                        <span className='text-sm font-medium text-gray-900'>
                          {returnLocation || 'Same as pickup'}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReturnLocation(false);
                            setReturnLocation('');
                          }}
                          className='text-gray-400 hover:text-gray-600 cursor-pointer'
                        >
                          <X className='h-4 w-4' />
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-green-600 transition-transform duration-200 ${
                            showReturnDropdown ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {showReturnDropdown && (
                      <div className='absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50'>
                        <button
                          onClick={() => {
                            setReturnLocation('');
                            setShowReturnDropdown(false);
                          }}
                          className='w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium first:rounded-t-xl'
                        >
                          Same as pickup
                        </button>
                        {locations.map((location) => (
                          <button
                            key={location}
                            onClick={() => {
                              setReturnLocation(location);
                              setShowReturnDropdown(false);
                            }}
                            className='w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium last:rounded-b-xl'
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pickup Date / Date */}
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>
                  {isTransfer ? 'Date' : 'Pickup Date'}
                </label>
                <div className='flex items-center px-4 py-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'>
                  <Calendar className='h-5 w-5 text-green-600 mr-3' />
                  <input
                    type='date'
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className='flex-1 text-sm font-medium text-gray-900 outline-none'
                  />
                </div>
              </div>

              {/* Return Date - Only for Rent a Car */}
              {!isTransfer && (
                <div>
                  <label className='block text-sm font-bold text-gray-800 mb-2'>
                    Return Date
                  </label>
                  <div className='flex items-center px-4 py-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm'>
                    <Calendar className='h-5 w-5 text-green-600 mr-3' />
                    <input
                      type='date'
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className='flex-1 text-sm font-medium text-gray-900 outline-none'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className='flex justify-end'>
              <button
                onClick={handleSearch}
                className='bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-950 text-white font-bold py-4 px-10 rounded-xl text-sm transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center'
              >
                <Search className='h-5 w-5 mr-2' />
                Update Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
