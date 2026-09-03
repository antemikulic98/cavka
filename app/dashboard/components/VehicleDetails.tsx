'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Users, Car, Luggage, MapPin, Settings, Calendar, Route, Plus, X, Loader2, Zap } from 'lucide-react';
import CustomSelect from '@/app/components/CustomSelect';

interface Vehicle {
  _id: string;
  year: number;
  make: string;
  model: string;
  fullName?: string;
  licensePlate?: string;
  color: string;
  mainImage?: string;
  acrissCode?: string;
  type?: 'rental' | 'transfer';
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
  pricePerKm?: number;
  trips?: {
    from: string;
    to: string;
    price: number;
    duration?: string;
    distance?: string;
  }[];
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
  onVehicleUpdated?: () => void;
}

interface LocationOption {
  _id: string;
  name: string;
  lat?: number;
  lng?: number;
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
  onVehicleUpdated,
}: VehicleDetailsProps) {
  const [showRoutes, setShowRoutes] = useState(false);
  const [routes, setRoutes] = useState(vehicle.trips || []);

  // Keep local routes in sync when the vehicle is refetched (e.g. after the
  // edit modal saves) — otherwise the next PATCH here would overwrite those
  // changes with a stale copy
  useEffect(() => {
    setRoutes(vehicle.trips || []);
  }, [vehicle.trips]);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({
    from: '',
    to: '',
    price: 0,
    duration: '',
    distance: '',
  });
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  // Fetch transfer locations
  useEffect(() => {
    if (vehicle.type === 'transfer') {
      fetch('/api/settings/locations?activeOnly=true&serviceType=transfer', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setLocations(data.locations);
        })
        .catch(err => console.error('Error fetching locations:', err));
    }
  }, [vehicle.type]);

  const locationOptions = locations.map(loc => ({ value: loc.name, label: loc.name }));

  // Calculate distance between two locations via Google Maps API
  const calculateDistance = useCallback(async (fromName: string, toName: string) => {
    const fromLoc = locations.find(l => l.name === fromName);
    const toLoc = locations.find(l => l.name === toName);

    if (!fromLoc?.lat || !fromLoc?.lng || !toLoc?.lat || !toLoc?.lng) {
      return null;
    }

    try {
      const res = await fetch(
        `/api/settings/distance?from=${fromLoc.lat},${fromLoc.lng}&to=${toLoc.lat},${toLoc.lng}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.success) {
        return { distanceKm: data.distanceKm, durationText: data.durationText };
      }
    } catch (err) {
      console.error('Distance API error:', err);
    }
    return null;
  }, [locations]);

  // Auto-calculate when from/to change
  useEffect(() => {
    if (!newRoute.from || !newRoute.to || newRoute.from === newRoute.to) return;

    const calc = async () => {
      setCalculatingDistance(true);
      const result = await calculateDistance(newRoute.from, newRoute.to);
      if (result) {
        const autoPrice = vehicle.pricePerKm
          ? Math.round(result.distanceKm * vehicle.pricePerKm * 100) / 100
          : 0;
        setNewRoute(prev => ({
          ...prev,
          distance: `${result.distanceKm} km`,
          duration: result.durationText,
          price: prev.price || autoPrice,
        }));
      }
      setCalculatingDistance(false);
    };
    calc();
  }, [newRoute.from, newRoute.to, calculateDistance, vehicle.pricePerKm]);

  const handleAddRoute = async () => {
    if (!newRoute.from || !newRoute.to || !newRoute.price) {
      alert('Please fill in all required fields (From, To, Price)');
      return;
    }
    if (newRoute.from === newRoute.to) {
      alert('From and To must be different locations');
      return;
    }
    if (newRoute.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }
    const duplicate = routes.some(
      (r) =>
        r.from.toLowerCase() === newRoute.from.toLowerCase() &&
        r.to.toLowerCase() === newRoute.to.toLowerCase()
    );
    if (duplicate) {
      alert(
        `A route ${newRoute.from} → ${newRoute.to} already exists. Remove it first to change the price.`
      );
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicle._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trips: [...routes, newRoute] }),
        credentials: 'include',
      });

      if (response.ok) {
        setRoutes([...routes, newRoute]);
        setNewRoute({ from: '', to: '', price: 0, duration: '', distance: '' });
        setIsAddingRoute(false);
        onVehicleUpdated?.();
      } else {
        alert('Failed to add route');
      }
    } catch (error) {
      console.error('Error adding route:', error);
      alert('Failed to add route');
    }
  };

  const handleRemoveRoute = async (index: number) => {
    const updatedRoutes = routes.filter((_, i) => i !== index);

    try {
      const response = await fetch(`/api/vehicles/${vehicle._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trips: updatedRoutes }),
        credentials: 'include',
      });

      if (response.ok) {
        setRoutes(updatedRoutes);
        onVehicleUpdated?.();
      } else {
        alert('Failed to remove route');
      }
    } catch (error) {
      console.error('Error removing route:', error);
      alert('Failed to remove route');
    }
  };

  // Generate all routes for all location pairs
  const handleGenerateAllRoutes = async () => {
    if (!vehicle.pricePerKm) {
      alert('Please set a Price per KM on this vehicle first (edit vehicle).');
      return;
    }

    const transferLocs = locations.filter(l => l.lat && l.lng);
    if (transferLocs.length < 2) {
      alert('Need at least 2 locations with coordinates to generate routes.');
      return;
    }

    if (!confirm(`This will generate routes for all ${transferLocs.length} locations (${transferLocs.length * (transferLocs.length - 1)} routes). Existing routes will be replaced. Continue?`)) {
      return;
    }

    setGeneratingAll(true);
    const newTrips: typeof routes = [];
    const failedPairs: string[] = [];

    for (const from of transferLocs) {
      for (const to of transferLocs) {
        if (from.name === to.name) continue;

        const result = await calculateDistance(from.name, to.name);
        if (result) {
          const price = Math.round(result.distanceKm * vehicle.pricePerKm * 100) / 100;
          newTrips.push({
            from: from.name,
            to: to.name,
            price,
            distance: `${result.distanceKm} km`,
            duration: result.durationText,
          });
        } else {
          failedPairs.push(`${from.name} → ${to.name}`);
        }
      }
    }

    // If everything failed (Google down, missing key), don't touch the
    // existing routes — a PATCH here would wipe them all
    if (newTrips.length === 0) {
      alert(
        'Could not calculate any distances (check the Google Maps key/quota). Existing routes were left unchanged.'
      );
      setGeneratingAll(false);
      return;
    }

    // Keep existing routes for pairs that failed to regenerate
    const generatedKeys = new Set(
      newTrips.map((t) => `${t.from}|${t.to}`.toLowerCase())
    );
    const preserved = routes.filter(
      (r) => !generatedKeys.has(`${r.from}|${r.to}`.toLowerCase())
    );
    const merged = [...newTrips, ...preserved];

    try {
      const response = await fetch(`/api/vehicles/${vehicle._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trips: merged }),
        credentials: 'include',
      });

      if (response.ok) {
        setRoutes(merged);
        onVehicleUpdated?.();
        alert(
          `Generated ${newTrips.length} routes successfully!` +
            (preserved.length ? ` Kept ${preserved.length} existing route(s).` : '') +
            (failedPairs.length
              ? `\n\nFailed to calculate ${failedPairs.length} pair(s):\n${failedPairs.slice(0, 10).join('\n')}`
              : '')
        );
      } else {
        alert('Failed to save generated routes');
      }
    } catch (error) {
      console.error('Error generating routes:', error);
      alert('Failed to generate routes');
    } finally {
      setGeneratingAll(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        {/* Vehicle Image + Stats */}
        <div className='lg:col-span-1'>
          <div className='aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl relative overflow-hidden mb-6 shadow-sm border'>
            {vehicle.mainImage ? (
              <Image
                src={vehicle.mainImage}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                sizes='(max-width: 1024px) 100vw, 20vw'
                className='object-cover'
                loading='lazy'
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
              {vehicle.licensePlate && (
                <span className='font-bold bg-white text-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-300'>
                  {vehicle.licensePlate}
                </span>
              )}
              {vehicle.type && (
                <span className='font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-full shadow-sm border border-blue-200'>
                  {vehicle.type === 'rental' ? 'Rent a Car' : 'Transfer'}
                </span>
              )}
              <span className='font-medium text-gray-700 px-3 py-1'>
                {vehicle.color}
              </span>
              <span className='flex items-center text-gray-600 px-3 py-1'>
                <MapPin className='w-4 h-4 mr-1' />
                {vehicle.location}
              </span>
              {vehicle.acrissCode && (
                <span className='bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200'>
                  ACRISS: {vehicle.acrissCode}
                </span>
              )}
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

      {/* Routes Section - Only for Transfer vehicles */}
      {vehicle.type === 'transfer' && (
        <div className='mt-8'>
          <div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
            {/* Routes Toggle Header */}
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors border-b border-gray-200 ${
                showRoutes
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Route className='h-5 w-5' />
              {showRoutes ? 'Hide Routes' : 'Show Routes'}
            </button>

            {/* Routes Content */}
            {showRoutes && (
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Transfer Routes
                    </h3>
                    {vehicle.pricePerKm ? (
                      <p className='text-sm text-gray-500 mt-1'>
                        Rate: €{vehicle.pricePerKm}/km
                      </p>
                    ) : (
                      <p className='text-sm text-yellow-600 mt-1'>
                        Set Price per KM on vehicle to enable auto-pricing
                      </p>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={handleGenerateAllRoutes}
                      disabled={generatingAll}
                      className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                    >
                      {generatingAll ? <Loader2 className='h-4 w-4 animate-spin' /> : <Zap className='h-4 w-4' />}
                      {generatingAll ? 'Generating...' : 'Generate All Routes'}
                    </button>
                    <button
                      onClick={() => setIsAddingRoute(true)}
                      className='flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
                    >
                      <Plus className='h-4 w-4' />
                      Add Route
                    </button>
                  </div>
                </div>

                  {/* Add Route Form */}
                  {isAddingRoute && (
                    <div className='mb-6 p-6 bg-white border-2 border-emerald-200 rounded-xl shadow-sm'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='text-lg font-semibold text-emerald-900'>New Route</h4>
                        <button
                          onClick={() => {
                            setIsAddingRoute(false);
                            setNewRoute({ from: '', to: '', price: 0, duration: '', distance: '' });
                          }}
                          className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors'
                        >
                          <X className='h-5 w-5' />
                        </button>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-semibold text-gray-900 mb-2'>
                            From *
                          </label>
                          <CustomSelect
                            options={locationOptions}
                            value={newRoute.from}
                            onChange={(value) => setNewRoute({ ...newRoute, from: value as string })}
                            placeholder='Select location'
                            searchable={true}
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-900 mb-2'>
                            To *
                          </label>
                          <CustomSelect
                            options={locationOptions}
                            value={newRoute.to}
                            onChange={(value) => setNewRoute({ ...newRoute, to: value as string })}
                            placeholder='Select location'
                            searchable={true}
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-900 mb-2'>
                            Price (€) *
                          </label>
                          <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                              <span className='text-gray-600 text-base font-semibold'>€</span>
                            </div>
                            <input
                              type='number'
                              value={newRoute.price || ''}
                              onChange={(e) => setNewRoute({ ...newRoute, price: parseFloat(e.target.value) || 0 })}
                              className='w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 text-gray-900 placeholder-gray-500 bg-white font-medium transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                              placeholder='150'
                              min='0'
                              step='0.01'
                            />
                          </div>
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-900 mb-2'>
                            Duration {calculatingDistance && <Loader2 className='inline h-3 w-3 animate-spin ml-1' />}
                          </label>
                          <input
                            type='text'
                            value={newRoute.duration}
                            onChange={(e) => setNewRoute({ ...newRoute, duration: e.target.value })}
                            className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 text-gray-900 placeholder-gray-500 bg-white font-medium transition-all duration-200'
                            placeholder='Auto-calculated'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-900 mb-2'>
                            Distance {calculatingDistance && <Loader2 className='inline h-3 w-3 animate-spin ml-1' />}
                          </label>
                          <input
                            type='text'
                            value={newRoute.distance}
                            onChange={(e) => setNewRoute({ ...newRoute, distance: e.target.value })}
                            className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 text-gray-900 placeholder-gray-500 bg-white font-medium transition-all duration-200'
                            placeholder='Auto-calculated'
                          />
                        </div>
                      </div>
                      <div className='flex justify-end gap-3 mt-6'>
                        <button
                          onClick={() => {
                            setIsAddingRoute(false);
                            setNewRoute({ from: '', to: '', price: 0, duration: '', distance: '' });
                          }}
                          className='px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddRoute}
                          className='px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm font-medium transition-colors'
                        >
                          Save Route
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Routes List */}
                  {routes.length === 0 ? (
                    <div className='text-center py-12 text-gray-500'>
                      <Route className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                      <p>No routes defined yet</p>
                      <p className='text-sm mt-1'>Click "Add Route" to create a new transfer route</p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {routes.map((route, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors'
                        >
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='font-semibold text-gray-900'>{route.from}</span>
                              <span className='text-gray-400'>→</span>
                              <span className='font-semibold text-gray-900'>{route.to}</span>
                            </div>
                            <div className='flex items-center gap-4 text-xs text-gray-600'>
                              {route.duration && (
                                <span className='flex items-center gap-1'>
                                  <Calendar className='h-3 w-3' />
                                  {route.duration}
                                </span>
                              )}
                              {route.distance && (
                                <span className='flex items-center gap-1'>
                                  <MapPin className='h-3 w-3' />
                                  {route.distance}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span className='text-lg font-bold text-emerald-700'>
                              €{route.price}
                            </span>
                            <button
                              onClick={() => handleRemoveRoute(index)}
                              className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                              title='Remove route'
                            >
                              <X className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
