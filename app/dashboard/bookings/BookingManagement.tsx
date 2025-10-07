'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Search,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  CalendarRange,
  X,
  Play,
  ChevronDown,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    countryCode: string;
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

type BookingStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
type SortField =
  | 'createdAt'
  | 'pickupDate'
  | 'totalCost'
  | 'status'
  | 'bookingReference';
type SortOrder = 'asc' | 'desc';

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Custom dropdown states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showModalStatusDropdown, setShowModalStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const modalStatusDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all bookings (admin endpoint needed)
  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      // For now, we'll use the existing bookings endpoint with a special admin parameter
      // In production, you'd want a separate admin endpoint with proper authentication
      const response = await fetch('/api/admin/bookings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setFilteredBookings(data.bookings);
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }

      if (
        modalStatusDropdownRef.current &&
        !modalStatusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModalStatusDropdown(false);
      }
    };

    if (showStatusDropdown || showModalStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown, showModalStatusDropdown]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Enhanced search filter - search across multiple fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.bookingReference.toLowerCase().includes(term) ||
          booking.clientInfo.firstName.toLowerCase().includes(term) ||
          booking.clientInfo.lastName.toLowerCase().includes(term) ||
          booking.clientInfo.email.toLowerCase().includes(term) ||
          booking.clientInfo.phoneNumber.includes(searchTerm) ||
          booking.pickupLocation.toLowerCase().includes(term) ||
          `${booking.vehicleInfo.make} ${booking.vehicleInfo.model}`
            .toLowerCase()
            .includes(term) ||
          (booking.clientInfo.company &&
            booking.clientInfo.company.toLowerCase().includes(term))
      );
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((booking) => {
        const pickupDate = new Date(booking.pickupDate);
        const returnDate = new Date(booking.returnDate);

        let matchesDateRange = true;

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDateRange =
            matchesDateRange &&
            (pickupDate >= fromDate || returnDate >= fromDate);
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          matchesDateRange =
            matchesDateRange && (pickupDate <= toDate || returnDate <= toDate);
        }

        return matchesDateRange;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'totalCost') {
        aValue = a.pricing.totalCost;
        bValue = b.pricing.totalCost;
      }

      if (sortField === 'createdAt' || sortField === 'pickupDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

    setFilteredBookings(filtered);
  }, [
    bookings,
    statusFilter,
    searchTerm,
    dateFrom,
    dateTo,
    sortField,
    sortOrder,
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending',
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Confirmed',
      },
      in_progress: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Play,
        label: 'In Progress',
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: CheckCircle,
        label: 'Completed',
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Cancelled',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <IconComponent className='w-3 h-3 mr-1' />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;

    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh bookings
        await fetchAllBookings();
        // Close modal and reset state
        setShowDetailsModal(false);
        setSelectedBooking(null);
        setNewStatus('');
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (err) {
      alert(
        'Failed to update booking status: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Status options for custom dropdown
  const statusOptions = [
    { value: 'all', label: 'All Statuses', icon: '📋', color: 'text-gray-700' },
    {
      value: 'pending',
      label: 'Pending',
      icon: '🟡',
      color: 'text-yellow-700',
    },
    {
      value: 'confirmed',
      label: 'Confirmed',
      icon: '🟢',
      color: 'text-green-700',
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      icon: '🔵',
      color: 'text-blue-700',
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: '✅',
      color: 'text-gray-700',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: '🔴',
      color: 'text-red-700',
    },
  ];

  const getSelectedStatusOption = () => {
    return (
      statusOptions.find((option) => option.value === statusFilter) ||
      statusOptions[0]
    );
  };

  // Modal status options (without 'all' option)
  const modalStatusOptions = statusOptions.filter(
    (option) => option.value !== 'all'
  );

  const getSelectedModalStatusOption = () => {
    const currentStatus = newStatus || selectedBooking?.status || 'pending';
    return (
      modalStatusOptions.find((option) => option.value === currentStatus) ||
      modalStatusOptions[0]
    );
  };

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
            <p className='text-red-800'>{error}</p>
          </div>
          <button
            onClick={fetchAllBookings}
            className='mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Enhanced Filters and Controls */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Filter className='h-5 w-5 mr-2 text-gray-600' />
            Filter Bookings
          </h3>

          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4'>
            {/* Enhanced Search */}
            <div className='relative col-span-full lg:col-span-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search by reference, customer, vehicle, location...'
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

            {/* Custom Status Filter Dropdown */}
            <div className='relative' ref={statusDropdownRef}>
              <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10' />
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className='pl-10 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white text-gray-900 text-left hover:border-emerald-400 transition-colors duration-200'
              >
                <span className='flex items-center'>
                  <span className='mr-2'>{getSelectedStatusOption().icon}</span>
                  <span className={getSelectedStatusOption().color}>
                    {getSelectedStatusOption().label}
                  </span>
                </span>
              </button>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform duration-200 ${
                  showStatusDropdown ? 'rotate-180' : ''
                }`}
              />

              {/* Dropdown Menu */}
              {showStatusDropdown && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value as BookingStatus);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors duration-150 flex items-center text-sm ${
                        statusFilter === option.value
                          ? 'bg-emerald-100 border-l-2 border-emerald-500'
                          : 'hover:border-l-2 hover:border-emerald-300'
                      }`}
                    >
                      <span className='mr-3'>{option.icon}</span>
                      <span className={option.color}>{option.label}</span>
                      {statusFilter === option.value && (
                        <CheckCircle className='ml-auto h-4 w-4 text-emerald-500' />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range - From */}
            <div className='relative'>
              <CalendarRange className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className='pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900'
                placeholder='From date'
              />
              <label className='absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600'>
                From Date
              </label>
            </div>

            {/* Date Range - To */}
            <div className='relative'>
              <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className='pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900'
                placeholder='To date'
              />
              <label className='absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600'>
                To Date
              </label>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className='flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-100'>
          <span className='flex items-center'>
            <div className='h-2 w-2 bg-emerald-500 rounded-full mr-2'></div>
            Showing{' '}
            <span className='font-medium mx-1'>
              {filteredBookings.length}
            </span>{' '}
            of <span className='font-medium mx-1'>{bookings.length}</span>{' '}
            bookings
          </span>
          {(searchTerm || statusFilter !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              className='text-emerald-600 hover:text-emerald-700 font-medium flex items-center'
            >
              <X className='h-4 w-4 mr-1' />
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                  onClick={() => handleSort('bookingReference')}
                >
                  Reference {getSortIcon('bookingReference')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Customer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Vehicle
                </th>
                <th
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                  onClick={() => handleSort('pickupDate')}
                >
                  Dates {getSortIcon('pickupDate')}
                </th>
                <th
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-mono font-medium text-gray-900'>
                      {booking.bookingReference}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {booking.clientInfo.firstName}{' '}
                      {booking.clientInfo.lastName}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {formatDate(booking.pickupDate)} -{' '}
                      {formatDate(booking.returnDate)}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {booking.rentalDays} days
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setNewStatus(booking.status); // Initialize with current status
                        setShowDetailsModal(true);
                      }}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200'
                    >
                      Detalji
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className='text-center py-12'>
            <Car className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No bookings found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              No bookings match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className='fixed inset-0 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Booking Details
                  </h2>
                  <p className='text-sm text-gray-600 font-mono'>
                    {selectedBooking.bookingReference}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className='text-gray-400 hover:text-gray-600 p-2'
                >
                  <XCircle className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Customer Information */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Customer Information
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center'>
                      <User className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-sm text-gray-600'>
                        {selectedBooking.clientInfo.firstName}{' '}
                        {selectedBooking.clientInfo.lastName}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <Mail className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-sm text-gray-600'>
                        {selectedBooking.clientInfo.email}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <Phone className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-sm text-gray-600'>
                        {selectedBooking.clientInfo.countryCode}{' '}
                        {selectedBooking.clientInfo.phoneNumber}
                      </span>
                    </div>
                    {selectedBooking.clientInfo.company && (
                      <div className='flex items-center'>
                        <div className='h-4 w-4 text-gray-400 mr-3'>🏢</div>
                        <span className='text-sm text-gray-600'>
                          {selectedBooking.clientInfo.company}
                        </span>
                      </div>
                    )}
                    {selectedBooking.clientInfo.flightNumber && (
                      <div className='flex items-center'>
                        <div className='h-4 w-4 text-gray-400 mr-3'>✈️</div>
                        <span className='text-sm text-gray-600'>
                          Flight: {selectedBooking.clientInfo.flightNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rental Details */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Rental Details
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center'>
                      <Car className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-sm text-gray-600'>
                        {selectedBooking.vehicleInfo.make}{' '}
                        {selectedBooking.vehicleInfo.model}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <Calendar className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-sm text-gray-600'>
                        {formatDate(selectedBooking.pickupDate)} -{' '}
                        {formatDate(selectedBooking.returnDate)} (
                        {selectedBooking.rentalDays} days)
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <MapPin className='h-4 w-4 text-gray-400 mr-3' />
                      <span className='text-sm text-gray-600'>
                        {selectedBooking.pickupLocation}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <div className='h-4 w-4 text-gray-400 mr-3'>🛡️</div>
                      <span className='text-sm text-gray-600'>
                        CDW:{' '}
                        {selectedBooking.cdwCoverage === 'full'
                          ? 'Full Coverage'
                          : 'Basic Coverage'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className='border-t pt-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Pricing Breakdown
                </h3>
                <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>
                      Base rate ({selectedBooking.rentalDays} days)
                    </span>
                    <span className='text-gray-900'>
                      €
                      {(
                        selectedBooking.pricing.baseDailyRate *
                        selectedBooking.rentalDays
                      ).toFixed(2)}
                    </span>
                  </div>
                  {selectedBooking.pricing.cdwCost > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>
                        CDW Coverage ({selectedBooking.rentalDays} days)
                      </span>
                      <span className='text-gray-900'>
                        €
                        {(
                          selectedBooking.pricing.cdwCost *
                          selectedBooking.rentalDays
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedBooking.pricing.addOnsCost > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>
                        Add-ons ({selectedBooking.rentalDays} days)
                      </span>
                      <span className='text-gray-900'>
                        €
                        {(
                          selectedBooking.pricing.addOnsCost *
                          selectedBooking.rentalDays
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr className='border-gray-300' />
                  <div className='flex justify-between text-base font-semibold'>
                    <span className='text-gray-900'>Total</span>
                    <span className='text-green-800'>
                      €{selectedBooking.pricing.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className='border-t pt-6'>
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <span className='text-sm text-gray-600 mr-2'>
                      Current Status:
                    </span>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>

                {/* Quick Status Update */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-3'>
                    Quick Status Update
                  </h4>
                  <div className='flex items-center space-x-2'>
                    {/* Custom Modal Status Dropdown */}
                    <div
                      className='relative flex-1'
                      ref={modalStatusDropdownRef}
                    >
                      <button
                        onClick={() =>
                          setShowModalStatusDropdown(!showModalStatusDropdown)
                        }
                        className='px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 bg-white text-left hover:border-emerald-400 transition-colors duration-200'
                      >
                        <span className='flex items-center'>
                          <span className='mr-2'>
                            {getSelectedModalStatusOption().icon}
                          </span>
                          <span
                            className={getSelectedModalStatusOption().color}
                          >
                            {getSelectedModalStatusOption().label}
                          </span>
                        </span>
                      </button>
                      <ChevronDown
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform duration-200 ${
                          showModalStatusDropdown ? 'rotate-180' : ''
                        }`}
                      />

                      {/* Modal Dropdown Menu */}
                      {showModalStatusDropdown && (
                        <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto'>
                          {modalStatusOptions.map((option) => {
                            const currentStatus =
                              newStatus || selectedBooking.status;
                            const isSelected = currentStatus === option.value;

                            return (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setNewStatus(option.value);
                                  setShowModalStatusDropdown(false);
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors duration-150 flex items-center text-sm ${
                                  isSelected
                                    ? 'bg-emerald-100 border-l-2 border-emerald-500'
                                    : 'hover:border-l-2 hover:border-emerald-300'
                                }`}
                              >
                                <span className='mr-3'>{option.icon}</span>
                                <span className={option.color}>
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <CheckCircle className='ml-auto h-4 w-4 text-emerald-500' />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleStatusUpdate}
                      disabled={
                        updateLoading ||
                        newStatus === selectedBooking.status ||
                        !newStatus
                      }
                      className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm whitespace-nowrap'
                    >
                      {updateLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
