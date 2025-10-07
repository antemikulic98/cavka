'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Car,
  Euro,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  X,
  ChevronDown,
  CheckCircle,
  Filter,
} from 'lucide-react';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  category: string;
  transmission: string;
  passengerCapacity: number;
  doorCount: number;

  // New schema fields
  bigSuitcases?: number;
  smallSuitcases?: number;
  fuelAirCon?: string;
  bodyType?: string;

  // Old schema fields (backward compatibility)
  luggageCapacity?: number;
  fuelType?: string;
  airConditioning?: boolean;

  features: string[];
  images: string[];
  mainImage: string;
  dailyRate: number;
  currency: string;
  location: string;
  status: string;
  description?: string;
  createdAt: string;
  addedBy?: {
    first_name: string;
    last_name: string;
  };
  fullName?: string;

  // Booking statistics
  bookingStats?: {
    totalBookings: number;
    totalEarnings: number;
  };
}

interface VehiclesResponse {
  success: boolean;
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Booking {
  status: string;
  totalCost: number;
}

interface BrowseCarsProps {
  onRefresh?: () => void;
  onViewVehicle?: (vehicleId: string) => void;
}

export default function BrowseCars({
  onRefresh,
  onViewVehicle,
}: BrowseCarsProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  // Custom dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'M', label: 'Mini' },
    { value: 'E', label: 'Economy' },
    { value: 'C', label: 'Compact' },
    { value: 'I', label: 'Intermediate' },
    { value: 'S', label: 'Standard' },
    { value: 'F', label: 'Fullsize' },
    { value: 'P', label: 'Premium' },
    { value: 'L', label: 'Luxury' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Available', label: 'Available' },
    { value: 'Booked', label: 'Booked' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'Zagreb Downtown', label: 'Zagreb Downtown' },
    { value: 'Zagreb Airport', label: 'Zagreb Airport' },
    { value: 'Split Downtown', label: 'Split Downtown' },
    { value: 'Split Airport', label: 'Split Airport' },
    { value: 'Dubrovnik Downtown', label: 'Dubrovnik Downtown' },
    { value: 'Dubrovnik Airport', label: 'Dubrovnik Airport' },
    { value: 'Rijeka Downtown', label: 'Rijeka Downtown' },
    { value: 'Pula Downtown', label: 'Pula Downtown' },
    { value: 'Zadar Downtown', label: 'Zadar Downtown' },
  ];

  // Fetch booking statistics for a vehicle
  const fetchVehicleBookingStats = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bookings`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const bookings = data.bookings || [];

        // Calculate stats from confirmed and completed bookings
        const relevantBookings = bookings.filter((booking: Booking) =>
          ['confirmed', 'completed', 'in_progress'].includes(booking.status)
        );

        const totalBookings = relevantBookings.length;
        const totalEarnings = relevantBookings.reduce(
          (sum: number, booking: Booking) => sum + (booking.totalCost || 0),
          0
        );

        return { totalBookings, totalEarnings };
      }

      return { totalBookings: 0, totalEarnings: 0 };
    } catch (error) {
      console.error(
        'Error fetching booking stats for vehicle:',
        vehicleId,
        error
      );
      return { totalBookings: 0, totalEarnings: 0 };
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedCategory !== 'all')
        params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedLocation !== 'all')
        params.append('location', selectedLocation);

      const response = await fetch(`/api/vehicles?${params}`, {
        credentials: 'include', // Include cookies for authentication
      });
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data: VehiclesResponse = await response.json();

      // Fetch booking statistics for each vehicle
      const vehiclesWithStats = await Promise.all(
        data.vehicles.map(async (vehicle) => {
          const bookingStats = await fetchVehicleBookingStats(vehicle._id);
          return {
            ...vehicle,
            bookingStats,
          };
        })
      );

      setVehicles(vehiclesWithStats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, selectedCategory, selectedStatus, selectedLocation]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    if (showCategoryDropdown || showStatusDropdown || showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showStatusDropdown, showLocationDropdown]);

  // Filter vehicles by search term (client-side)
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (categoryCode: string) => {
    const category = categories.find((c) => c.value === categoryCode);
    return category ? category.label : categoryCode;
  };

  // Helper functions for dropdowns
  const getSelectedCategoryOption = () => {
    return (
      categories.find((c) => c.value === selectedCategory) || categories[0]
    );
  };

  const getSelectedStatusOption = () => {
    return statuses.find((s) => s.value === selectedStatus) || statuses[0];
  };

  const getSelectedLocationOption = () => {
    return locations.find((l) => l.value === selectedLocation) || locations[0];
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Fleet Management</h1>
          <p className='text-gray-600'>
            Manage your vehicle fleet ({pagination.total} vehicles)
          </p>
        </div>
        <button
          onClick={fetchVehicles}
          className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
        >
          <Car className='w-4 h-4 mr-2' />
          Refresh
        </button>
      </div>

      {/* Enhanced Filters */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Filter className='h-5 w-5 mr-2 text-gray-600' />
            Filter Vehicles
          </h3>

          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4'>
            {/* Enhanced Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search by make, model, license plate, color...'
                className='pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>

            {/* Custom Category Dropdown */}
            <div className='relative' ref={categoryDropdownRef}>
              <Car className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10' />
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className='pl-10 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-gray-900 text-left hover:border-emerald-400 transition-colors duration-200'
              >
                {getSelectedCategoryOption().label}
              </button>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform duration-200 ${
                  showCategoryDropdown ? 'rotate-180' : ''
                }`}
              />
              <label className='absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600'>
                Category
              </label>

              {/* Dropdown Menu */}
              {showCategoryDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setCurrentPage(1);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors duration-150 flex items-center text-sm ${
                        selectedCategory === category.value
                          ? 'bg-emerald-100 border-l-2 border-emerald-500'
                          : 'hover:border-l-2 hover:border-emerald-300'
                      }`}
                    >
                      <Car className='h-4 w-4 mr-3 text-gray-400' />
                      <span className='text-gray-800'>{category.label}</span>
                      {selectedCategory === category.value && (
                        <CheckCircle className='ml-auto h-4 w-4 text-emerald-500' />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Status Dropdown */}
            <div className='relative' ref={statusDropdownRef}>
              <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10'>
                🟢
              </div>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className='pl-10 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-gray-900 text-left hover:border-emerald-400 transition-colors duration-200'
              >
                {getSelectedStatusOption().label}
              </button>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform duration-200 ${
                  showStatusDropdown ? 'rotate-180' : ''
                }`}
              />
              <label className='absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600'>
                Status
              </label>

              {/* Dropdown Menu */}
              {showStatusDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => {
                        setSelectedStatus(status.value);
                        setCurrentPage(1);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors duration-150 flex items-center text-sm ${
                        selectedStatus === status.value
                          ? 'bg-emerald-100 border-l-2 border-emerald-500'
                          : 'hover:border-l-2 hover:border-emerald-300'
                      }`}
                    >
                      <div className='h-4 w-4 mr-3'>
                        {status.value === 'all' && '📋'}
                        {status.value === 'Available' && '🟢'}
                        {status.value === 'Booked' && '🔵'}
                        {status.value === 'Maintenance' && '🟡'}
                        {status.value === 'Inactive' && '⚪'}
                      </div>
                      <span className='text-gray-800'>{status.label}</span>
                      {selectedStatus === status.value && (
                        <CheckCircle className='ml-auto h-4 w-4 text-emerald-500' />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Location Dropdown */}
            <div className='relative' ref={locationDropdownRef}>
              <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10' />
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className='pl-10 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-gray-900 text-left hover:border-emerald-400 transition-colors duration-200'
              >
                {getSelectedLocationOption().label}
              </button>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform duration-200 ${
                  showLocationDropdown ? 'rotate-180' : ''
                }`}
              />
              <label className='absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600'>
                Location
              </label>

              {/* Dropdown Menu */}
              {showLocationDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  {locations.map((location) => (
                    <button
                      key={location.value}
                      onClick={() => {
                        setSelectedLocation(location.value);
                        setCurrentPage(1);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors duration-150 flex items-center text-sm ${
                        selectedLocation === location.value
                          ? 'bg-emerald-100 border-l-2 border-emerald-500'
                          : 'hover:border-l-2 hover:border-emerald-300'
                      }`}
                    >
                      <MapPin className='h-4 w-4 mr-3 text-gray-400' />
                      <span className='text-gray-800'>{location.label}</span>
                      {selectedLocation === location.value && (
                        <CheckCircle className='ml-auto h-4 w-4 text-emerald-500' />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-100'>
          <span className='flex items-center'>
            <div className='h-2 w-2 bg-emerald-500 rounded-full mr-2'></div>
            Showing{' '}
            <span className='font-medium mx-1'>
              {filteredVehicles.length}
            </span>{' '}
            of <span className='font-medium mx-1'>{pagination.total}</span>{' '}
            vehicles
          </span>
          {(searchTerm ||
            selectedCategory !== 'all' ||
            selectedStatus !== 'all' ||
            selectedLocation !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedLocation('all');
                setCurrentPage(1);
              }}
              className='text-emerald-600 hover:text-emerald-700 font-medium flex items-center'
            >
              <X className='h-4 w-4 mr-1' />
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600'></div>
          <p className='mt-2 text-gray-600'>Loading vehicles...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredVehicles.length === 0 && (
        <div className='text-center py-12'>
          <Car className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            No vehicles found
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Try adjusting your search criteria or add some vehicles.
          </p>
        </div>
      )}

      {/* Vehicle Grid */}
      {!loading && filteredVehicles.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className='bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow'
            >
              {/* Vehicle Image */}
              <div className='aspect-video bg-gray-200 relative'>
                {vehicle.mainImage ? (
                  <img
                    src={vehicle.mainImage}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <Car className='h-12 w-12 text-gray-400' />
                  </div>
                )}
                <div className='absolute top-2 right-2'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      vehicle.status
                    )}`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {/* Simplified Vehicle Info */}
              <div className='p-4'>
                {/* Car Name */}
                <div className='mb-3'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                    {vehicle.fullName ||
                      `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  </h3>
                  <p className='text-sm text-gray-600 font-medium'>
                    {vehicle.licensePlate}
                  </p>
                </div>

                {/* Booking Statistics */}
                <div className='grid grid-cols-2 gap-3 mb-4'>
                  <div className='text-center py-2 bg-blue-50 rounded-lg'>
                    <div className='text-lg font-semibold text-blue-600'>
                      {vehicle.bookingStats?.totalBookings || 0}
                    </div>
                    <div className='text-xs text-gray-600'>Bookings</div>
                  </div>
                  <div className='text-center py-2 bg-emerald-50 rounded-lg'>
                    <div className='text-lg font-semibold text-emerald-600 flex items-center justify-center'>
                      <Euro className='w-4 h-4 mr-1' />
                      {vehicle.bookingStats?.totalEarnings?.toFixed(0) || 0}
                    </div>
                    <div className='text-xs text-gray-600'>Earned</div>
                  </div>
                </div>

                {/* Details Button */}
                <button
                  onClick={() => {
                    onViewVehicle && onViewVehicle(vehicle._id);
                  }}
                  className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors'
                >
                  <ExternalLink className='w-4 h-4 mr-2' />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredVehicles.length > 0 && pagination.pages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
            {pagination.total} vehicles
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='w-4 h-4 mr-1' />
              Previous
            </button>

            <div className='flex items-center space-x-1'>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(pagination.pages, currentPage + 1))
              }
              disabled={currentPage === pagination.pages}
              className='inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
              <ChevronRight className='w-4 h-4 ml-1' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
