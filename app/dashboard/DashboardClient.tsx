'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Car,
  Calendar,
  MapPin,
  Clock,
  Settings,
  LogOut,
  CreditCard,
  FileText,
  Bell,
  Home,
  BarChart3,
  Menu,
  X,
  Plus,
  CalendarPlus,
  CheckCircle,
  XCircle,
  PlusCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { UserSession } from '@/lib/auth';
import AddCarModal from './components/AddCarModal';
import BrowseCars from './components/BrowseCars';
import VehicleView from './components/VehicleView';

interface DashboardClientProps {
  user: UserSession;
}

interface DashboardStats {
  activeRentals: number;
  totalBookings: number;
  upcomingBookings: number;
  totalEarned: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  vehicle?: {
    make: string;
    model: string;
    image?: string;
  };
  amount: number;
}

interface Notification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  badge?: number;
  timestamp: string;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeRentals: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    totalEarned: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardStats(data.stats);
        }
      } else {
        console.error('Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setActivitiesLoading(true);
      const response = await fetch('/api/dashboard/activity', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActivities(data.activities);
        }
      } else {
        console.error('Failed to fetch recent activity');
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await fetch('/api/dashboard/notifications', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update navigation to reflect current view from URL or state
  const navigation = [
    {
      name: 'Dashboard',
      icon: Home,
      id: 'dashboard',
      current: currentView === 'dashboard',
    },
    {
      name: 'All Bookings',
      icon: Calendar,
      id: 'bookings',
      current: currentView === 'bookings',
    },
    {
      name: 'Browse Cars',
      icon: Car,
      id: 'browse-cars',
      current: currentView === 'browse-cars',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      id: 'analytics',
      current: currentView === 'analytics',
    },
    {
      name: 'Profile',
      icon: User,
      id: 'profile',
      current: currentView === 'profile',
    },
    {
      name: 'Settings',
      icon: Settings,
      id: 'settings',
      current: currentView === 'settings',
    },
  ];

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    fetchNotifications();
  }, []);

  // Helper function to get icon component
  const getIcon = (iconName: string) => {
    const icons: any = {
      calendar: Calendar,
      'calendar-plus': CalendarPlus,
      car: Car,
      'check-circle': CheckCircle,
      'x-circle': XCircle,
      'plus-circle': PlusCircle,
      'alert-triangle': AlertTriangle,
      'trending-up': TrendingUp,
      'trending-down': TrendingDown,
      bell: Bell,
    };
    return icons[iconName] || Calendar;
  };

  // Helper function to get color classes
  const getColorClasses = (
    color: string,
    variant: 'bg' | 'text' | 'border' = 'text'
  ) => {
    const colors: any = {
      emerald: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
      },
    };
    return colors[color]?.[variant] || colors['emerald'][variant];
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    return `${diffInWeeks} weeks ago`;
  };

  const handleNavigation = (viewId: string) => {
    if (viewId === 'bookings') {
      // Navigate to dedicated bookings page
      router.push('/bookings');
      return;
    }

    setCurrentView(viewId);
    setSidebarOpen(false); // Close mobile sidebar when navigating
    setSelectedVehicleId(null); // Clear selected vehicle when navigating
  };

  const handleViewVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCurrentView('vehicle-view');
  };

  const handleBackToBrowseCars = () => {
    setSelectedVehicleId(null);
    setCurrentView('browse-cars');
  };

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />
        <div className='relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl'>
          <div className='absolute top-0 right-0 -mr-12 pt-2'>
            <button
              type='button'
              className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
              onClick={() => setSidebarOpen(false)}
            >
              <X className='h-6 w-6 text-white' />
            </button>
          </div>

          {/* Mobile sidebar content */}
          <div className='flex-1 h-0 pt-5 pb-4 overflow-y-auto'>
            <div className='flex-shrink-0 flex items-center px-4'>
              <img
                src='/img/logo-black.svg'
                alt='Logo'
                className='h-10 w-auto'
              />
            </div>
            <nav className='mt-5 px-2 space-y-1'>
              {navigation.map((item) => {
                // Special handling for Browse Cars - direct link to /vehicles
                if (item.id === 'browse-cars') {
                  return (
                    <a
                      key={item.name}
                      href='/vehicles'
                      className='text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left'
                    >
                      <item.icon className='text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6' />
                      {item.name}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.id)}
                    className={`${
                      item.current
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left`}
                  >
                    <item.icon
                      className={`${
                        item.current
                          ? 'text-emerald-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile user section */}
          <div className='flex-shrink-0 flex border-t border-gray-200 p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center'>
                  <User className='h-5 w-5 text-emerald-600' />
                </div>
              </div>
              <div className='ml-3 flex-1'>
                <p className='text-base font-medium text-gray-700'>
                  {user.fullName}
                </p>
                <p className='text-sm font-medium text-gray-500'>
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className='ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-gray-500'
              >
                <LogOut className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className='hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0'>
        <div className='flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200'>
          <div className='flex items-center flex-shrink-0 px-4'>
            <img src='/img/logo-black.svg' alt='Logo' className='h-12 w-auto' />
          </div>

          {/* Welcome message */}
          <div className='mt-5 px-4'>
            <p className='text-sm text-gray-600'>Welcome back,</p>
            <p className='text-lg font-semibold text-gray-900'>
              {user.first_name}!
            </p>
          </div>

          <div className='mt-5 flex-grow flex flex-col'>
            <nav className='flex-1 px-2 pb-4 space-y-1'>
              {navigation.map((item) => {
                // Special handling for Browse Cars - direct link to /vehicles
                if (item.id === 'browse-cars') {
                  return (
                    <a
                      key={item.name}
                      href='/vehicles'
                      className='text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 w-full text-left'
                    >
                      <item.icon className='text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6' />
                      {item.name}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.id)}
                    className={`${
                      item.current
                        ? 'bg-emerald-100 text-emerald-900 border-r-2 border-emerald-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 w-full text-left`}
                  >
                    <item.icon
                      className={`${
                        item.current
                          ? 'text-emerald-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User section */}
          <div className='flex-shrink-0 flex border-t border-gray-200 p-4'>
            <div className='flex items-center w-full'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center'>
                  <User className='h-5 w-5 text-emerald-600' />
                </div>
              </div>
              <div className='ml-3 flex-1'>
                <p className='text-sm font-medium text-gray-700'>
                  {user.fullName}
                </p>
                <p className='text-xs text-gray-500'>{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className='ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200'
                title='Sign out'
              >
                <LogOut className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:pl-64 flex flex-col w-0 flex-1'>
        {/* Mobile top bar */}
        <div className='sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden'>
          <button
            type='button'
            className='px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:hidden'
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className='h-6 w-6' />
          </button>
          <div className='flex-1 px-4 flex justify-between items-center'>
            <h1 className='text-lg font-semibold text-gray-900'>
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'browse-cars' && 'Browse Cars'}
              {currentView === 'vehicle-view' && 'Vehicle Details'}
              {currentView === 'analytics' && 'Analytics'}
              {currentView === 'profile' && 'Profile'}
              {currentView === 'settings' && 'Settings'}
            </h1>
          </div>
        </div>

        <main className='flex-1 relative overflow-y-auto focus:outline-none'>
          <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
              {/* Conditional Content Rendering */}
              {currentView === 'dashboard' && (
                <div className='mt-6'>
                  {/* Quick Stats */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                    <div className='bg-white overflow-hidden shadow-lg rounded-xl'>
                      <div className='p-6'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0'>
                            <Car className='h-8 w-8 text-emerald-600' />
                          </div>
                          <div className='ml-5 w-0 flex-1'>
                            <dl>
                              <dt className='text-sm font-medium text-gray-500 truncate'>
                                Active Rentals
                              </dt>
                              <dd className='text-lg font-medium text-gray-900'>
                                {statsLoading
                                  ? '...'
                                  : dashboardStats.activeRentals}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='bg-white overflow-hidden shadow-lg rounded-xl'>
                      <div className='p-6'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0'>
                            <Calendar className='h-8 w-8 text-blue-600' />
                          </div>
                          <div className='ml-5 w-0 flex-1'>
                            <dl>
                              <dt className='text-sm font-medium text-gray-500 truncate'>
                                Upcoming Bookings
                              </dt>
                              <dd className='text-lg font-medium text-gray-900'>
                                {statsLoading
                                  ? '...'
                                  : dashboardStats.upcomingBookings}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='bg-white overflow-hidden shadow-lg rounded-xl'>
                      <div className='p-6'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0'>
                            <FileText className='h-8 w-8 text-purple-600' />
                          </div>
                          <div className='ml-5 w-0 flex-1'>
                            <dl>
                              <dt className='text-sm font-medium text-gray-500 truncate'>
                                Total Bookings
                              </dt>
                              <dd className='text-lg font-medium text-gray-900'>
                                {statsLoading
                                  ? '...'
                                  : dashboardStats.totalBookings}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='bg-white overflow-hidden shadow-lg rounded-xl'>
                      <div className='p-6'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0'>
                            <CreditCard className='h-8 w-8 text-orange-600' />
                          </div>
                          <div className='ml-5 w-0 flex-1'>
                            <dl>
                              <dt className='text-sm font-medium text-gray-500 truncate'>
                                Total Earned
                              </dt>
                              <dd className='text-lg font-medium text-gray-900'>
                                {statsLoading
                                  ? '...'
                                  : `€${dashboardStats.totalEarned.toFixed(2)}`}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Dashboard Grid */}
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Recent Activity */}
                    <div className='lg:col-span-2'>
                      <div className='bg-white shadow-lg rounded-xl'>
                        <div className='px-6 py-4 border-b border-gray-200'>
                          <h3 className='text-lg font-medium text-gray-900'>
                            Recent Activity
                          </h3>
                        </div>
                        <div className='p-6'>
                          {activitiesLoading ? (
                            <div className='space-y-4'>
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className='flex items-start space-x-4 animate-pulse'
                                >
                                  <div className='rounded-full bg-gray-200 h-10 w-10'></div>
                                  <div className='flex-1 space-y-2'>
                                    <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : activities.length === 0 ? (
                            <div className='text-center py-12'>
                              <Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                              <p className='text-gray-500 font-medium'>
                                No recent activity
                              </p>
                              <p className='text-sm text-gray-400 mt-2'>
                                Your rental history will appear here
                              </p>
                            </div>
                          ) : (
                            <div className='space-y-4'>
                              {activities.map((activity) => {
                                const IconComponent = getIcon(activity.icon);
                                return (
                                  <div
                                    key={activity.id}
                                    className='flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200'
                                  >
                                    <div
                                      className={`rounded-full p-2 ${getColorClasses(
                                        activity.color,
                                        'bg'
                                      )}`}
                                    >
                                      <IconComponent
                                        className={`h-5 w-5 ${getColorClasses(
                                          activity.color,
                                          'text'
                                        )}`}
                                      />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                      <div className='flex items-center justify-between'>
                                        <p className='text-sm font-semibold text-gray-900 truncate'>
                                          {activity.title}
                                        </p>
                                        <div className='flex items-center space-x-2'>
                                          {activity.amount > 0 && (
                                            <span className='text-sm font-medium text-green-600'>
                                              €{activity.amount.toFixed(2)}
                                            </span>
                                          )}
                                          <span className='text-xs text-gray-500'>
                                            {formatTimeAgo(activity.timestamp)}
                                          </span>
                                        </div>
                                      </div>
                                      <p className='text-sm text-gray-600 mt-1'>
                                        {activity.description}
                                      </p>
                                      {activity.vehicle && (
                                        <div className='flex items-center mt-2'>
                                          {activity.vehicle.image && (
                                            <img
                                              src={activity.vehicle.image}
                                              alt={`${activity.vehicle.make} ${activity.vehicle.model}`}
                                              className='h-8 w-12 object-cover rounded mr-2'
                                            />
                                          )}
                                          <span className='text-xs text-gray-500'>
                                            {activity.vehicle.make}{' '}
                                            {activity.vehicle.model}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className='space-y-6'>
                      {/* Add New Car */}
                      <div className='bg-white shadow-lg rounded-xl'>
                        <div className='px-6 py-4 border-b border-gray-200'>
                          <h3 className='text-lg font-medium text-gray-900'>
                            Vehicle Management
                          </h3>
                        </div>
                        <div className='p-6 space-y-4'>
                          <button
                            onClick={() => setShowAddCarModal(true)}
                            className='w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]'
                          >
                            <Plus className='h-5 w-5 mr-2' />
                            Add New Car
                          </button>
                          <a
                            href='/vehicles'
                            className='w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
                          >
                            <Car className='h-5 w-5 mr-3 text-emerald-600' />
                            Manage Fleet
                          </a>
                          <button
                            onClick={() => handleNavigation('bookings')}
                            className='w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
                          >
                            <Calendar className='h-5 w-5 mr-3 text-blue-600' />
                            View Bookings
                          </button>
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className='bg-white shadow-lg rounded-xl'>
                        <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
                          <h3 className='text-lg font-medium text-gray-900'>
                            Notifications
                          </h3>
                          {notifications.length > 0 && (
                            <span className='bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full'>
                              {notifications.length}
                            </span>
                          )}
                        </div>
                        <div className='p-6'>
                          {notificationsLoading ? (
                            <div className='space-y-3'>
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className='flex items-center space-x-3 animate-pulse'
                                >
                                  <div className='rounded-full bg-gray-200 h-8 w-8'></div>
                                  <div className='flex-1 space-y-2'>
                                    <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className='text-center py-8'>
                              <Bell className='h-8 w-8 text-gray-400 mx-auto mb-3' />
                              <p className='text-sm text-gray-500 font-medium'>
                                No new notifications
                              </p>
                              <p className='text-xs text-gray-400 mt-1'>
                                You're all caught up!
                              </p>
                            </div>
                          ) : (
                            <div className='space-y-4'>
                              {notifications.map((notification) => {
                                const IconComponent = getIcon(
                                  notification.icon
                                );
                                return (
                                  <div
                                    key={notification.id}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors duration-200 hover:shadow-sm ${getColorClasses(
                                      notification.color,
                                      'border'
                                    )} hover:bg-gray-50`}
                                  >
                                    <div
                                      className={`rounded-full p-2 ${getColorClasses(
                                        notification.color,
                                        'bg'
                                      )} flex-shrink-0`}
                                    >
                                      <IconComponent
                                        className={`h-4 w-4 ${getColorClasses(
                                          notification.color,
                                          'text'
                                        )}`}
                                      />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                      <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                          <div className='flex items-center space-x-2'>
                                            <p
                                              className={`text-sm font-semibold truncate ${getColorClasses(
                                                notification.color,
                                                'text'
                                              )}`}
                                            >
                                              {notification.title}
                                            </p>
                                            {notification.badge && (
                                              <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getColorClasses(
                                                  notification.color,
                                                  'bg'
                                                )} ${getColorClasses(
                                                  notification.color,
                                                  'text'
                                                )}`}
                                              >
                                                {notification.badge}
                                              </span>
                                            )}
                                          </div>
                                          <p className='text-xs text-gray-600 mt-1 line-clamp-2'>
                                            {notification.message}
                                          </p>
                                        </div>
                                        {/* Priority indicator */}
                                        {notification.priority === 'urgent' && (
                                          <div className='w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ml-2'></div>
                                        )}
                                        {notification.priority ===
                                          'important' && (
                                          <div className='w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 ml-2'></div>
                                        )}
                                        {notification.priority ===
                                          'success' && (
                                          <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2'></div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Browse Cars View */}
              {currentView === 'browse-cars' && (
                <BrowseCars
                  onRefresh={() => {
                    // Refresh logic will be implemented here
                    console.log('Refreshing vehicles...');
                  }}
                  onViewVehicle={handleViewVehicle}
                />
              )}

              {/* Vehicle View */}
              {currentView === 'vehicle-view' && selectedVehicleId && (
                <VehicleView
                  vehicleId={selectedVehicleId}
                  onBack={handleBackToBrowseCars}
                />
              )}

              {currentView === 'analytics' && (
                <div className='text-center py-12'>
                  <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Analytics
                  </h3>
                  <p className='text-gray-500'>
                    Analytics dashboard coming soon...
                  </p>
                </div>
              )}

              {currentView === 'profile' && (
                <div className='text-center py-12'>
                  <User className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Profile Settings
                  </h3>
                  <p className='text-gray-500'>
                    Profile management coming soon...
                  </p>
                </div>
              )}

              {currentView === 'settings' && (
                <div className='text-center py-12'>
                  <Settings className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Settings
                  </h3>
                  <p className='text-gray-500'>Settings panel coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Car Modal */}
      <AddCarModal
        isOpen={showAddCarModal}
        onClose={() => setShowAddCarModal(false)}
        onCarAdded={() => {
          // Switch to Browse Cars view after adding a car
          setCurrentView('browse-cars');
          console.log('Car added successfully!');
        }}
      />
    </div>
  );
}
