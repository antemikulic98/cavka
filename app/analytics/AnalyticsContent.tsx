'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Calendar,
  Users,
  MapPin,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalVehicles: number;
    activeRentals: number;
    revenueChange: number;
    bookingsChange: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  bookingsByStatus: {
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  topVehicles: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  locationStats: Array<{
    location: string;
    bookings: number;
    revenue: number;
  }>;
  overbookingStats: {
    pending: number;
    arranged: number;
    confirmed: number;
    total: number;
  };
}

export default function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className='h-4 w-4' />;
    if (change < 0) return <TrendingDown className='h-4 w-4' />;
    return null;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto'></div>
          <p className='text-gray-600 mt-4'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600'>No analytics data available</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.revenueByMonth.map((m) => m.revenue));

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Analytics Dashboard</h1>
            <p className='text-gray-600 mt-2'>Overview of your business performance</p>
          </div>

          {/* Time Range Selector */}
          <div className='flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1'>
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Total Revenue */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {formatCurrency(data.overview.totalRevenue)}
                </p>
              </div>
              <div className='h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
                <DollarSign className='h-6 w-6 text-green-600' />
              </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${getChangeColor(data.overview.revenueChange)}`}>
              {getChangeIcon(data.overview.revenueChange)}
              <span className='ml-1 font-medium'>
                {data.overview.revenueChange > 0 ? '+' : ''}
                {data.overview.revenueChange}%
              </span>
              <span className='ml-2 text-gray-500'>vs last period</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Bookings</p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {data.overview.totalBookings}
                </p>
              </div>
              <div className='h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <Calendar className='h-6 w-6 text-blue-600' />
              </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${getChangeColor(data.overview.bookingsChange)}`}>
              {getChangeIcon(data.overview.bookingsChange)}
              <span className='ml-1 font-medium'>
                {data.overview.bookingsChange > 0 ? '+' : ''}
                {data.overview.bookingsChange}%
              </span>
              <span className='ml-2 text-gray-500'>vs last period</span>
            </div>
          </div>

          {/* Total Vehicles */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Vehicles</p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {data.overview.totalVehicles}
                </p>
              </div>
              <div className='h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center'>
                <Car className='h-6 w-6 text-purple-600' />
              </div>
            </div>
            <div className='flex items-center mt-4 text-sm text-gray-500'>
              <span>Available in fleet</span>
            </div>
          </div>

          {/* Active Rentals */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Active Rentals</p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {data.overview.activeRentals}
                </p>
              </div>
              <div className='h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center'>
                <Users className='h-6 w-6 text-orange-600' />
              </div>
            </div>
            <div className='flex items-center mt-4 text-sm text-gray-500'>
              <span>Currently rented</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* Revenue Chart */}
          <div className='lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-gray-900'>Revenue Trend</h2>
              <BarChart3 className='h-5 w-5 text-gray-400' />
            </div>
            <div className='space-y-4'>
              {data.revenueByMonth.map((month) => (
                <div key={month.month}>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-600'>{month.month}</span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className='bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500'
                      style={{
                        width: `${(month.revenue / maxRevenue) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Status */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-semibold text-gray-900'>Booking Status</h2>
              <PieChart className='h-5 w-5 text-gray-400' />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <CheckCircle className='h-5 w-5 text-blue-600' />
                  <span className='text-sm font-medium text-gray-900'>Confirmed</span>
                </div>
                <span className='text-lg font-bold text-blue-600'>
                  {data.bookingsByStatus.confirmed}
                </span>
              </div>

              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <Car className='h-5 w-5 text-green-600' />
                  <span className='text-sm font-medium text-gray-900'>In Progress</span>
                </div>
                <span className='text-lg font-bold text-green-600'>
                  {data.bookingsByStatus.in_progress}
                </span>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <Clock className='h-5 w-5 text-gray-600' />
                  <span className='text-sm font-medium text-gray-900'>Completed</span>
                </div>
                <span className='text-lg font-bold text-gray-600'>
                  {data.bookingsByStatus.completed}
                </span>
              </div>

              <div className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <XCircle className='h-5 w-5 text-red-600' />
                  <span className='text-sm font-medium text-gray-900'>Cancelled</span>
                </div>
                <span className='text-lg font-bold text-red-600'>
                  {data.bookingsByStatus.cancelled}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Top Performing Vehicles */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>Top Performing Vehicles</h2>
            <div className='space-y-4'>
              {data.topVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 font-bold'>
                      #{index + 1}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>{vehicle.name}</p>
                      <p className='text-sm text-gray-500'>{vehicle.bookings} bookings</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-emerald-600'>
                      {formatCurrency(vehicle.revenue)}
                    </p>
                  </div>
                </div>
              ))}
              {data.topVehicles.length === 0 && (
                <p className='text-center text-gray-500 py-8'>No vehicle data yet</p>
              )}
            </div>
          </div>

          {/* Location Performance */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>Location Performance</h2>
            <div className='space-y-4'>
              {data.locationStats.map((location) => (
                <div key={location.location} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <MapPin className='h-4 w-4 text-gray-400' />
                      <span className='text-sm font-medium text-gray-900'>
                        {location.location}
                      </span>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-semibold text-gray-900'>
                        {formatCurrency(location.revenue)}
                      </p>
                      <p className='text-xs text-gray-500'>{location.bookings} bookings</p>
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full'
                      style={{
                        width: `${(location.bookings / data.overview.totalBookings) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {data.locationStats.length === 0 && (
                <p className='text-center text-gray-500 py-8'>No location data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Overbooking Alert */}
        {data.overbookingStats.total > 0 && (
          <div className='mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6'>
            <div className='flex items-start'>
              <AlertTriangle className='h-6 w-6 text-yellow-600 mr-3 mt-1' />
              <div className='flex-1'>
                <h3 className='text-lg font-bold text-yellow-900 mb-2'>
                  Overbooking Overview
                </h3>
                <div className='grid grid-cols-4 gap-4'>
                  <div>
                    <p className='text-sm text-yellow-700'>Total</p>
                    <p className='text-2xl font-bold text-yellow-900'>
                      {data.overbookingStats.total}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-yellow-700'>Pending</p>
                    <p className='text-2xl font-bold text-yellow-900'>
                      {data.overbookingStats.pending}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-yellow-700'>Arranged</p>
                    <p className='text-2xl font-bold text-blue-900'>
                      {data.overbookingStats.arranged}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-yellow-700'>Confirmed</p>
                    <p className='text-2xl font-bold text-green-900'>
                      {data.overbookingStats.confirmed}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
