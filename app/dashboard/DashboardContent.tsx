'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Car,
  Calendar,
  CreditCard,
  FileText,
  Bell,
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

interface DashboardContentProps {
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

export default function DashboardContent({ user }: DashboardContentProps) {
  const [showAddCarModal, setShowAddCarModal] = useState(false);
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
  const [overbookingStats, setOverbookingStats] = useState({
    pending: 0,
    arranged: 0,
    confirmed: 0,
  });

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
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchOverbookingStats = async () => {
    try {
      const response = await fetch('/api/admin/overbookings?status=all', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setOverbookingStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching overbooking stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    fetchNotifications();
    fetchOverbookingStats();
  }, []);

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

  return (
    <div className='py-6'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
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
                      {statsLoading ? '...' : dashboardStats.activeRentals}
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
                      {statsLoading ? '...' : dashboardStats.upcomingBookings}
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
                      {statsLoading ? '...' : dashboardStats.totalBookings}
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

        {/* Overbooking Alert */}
        {overbookingStats.pending > 0 && (
          <div className='bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-md mb-8'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <AlertTriangle className='h-8 w-8 text-yellow-600' />
              </div>
              <div className='ml-4 flex-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-bold text-yellow-900'>
                      Pending Overbookings Require Attention
                    </h3>
                    <p className='mt-2 text-sm text-yellow-800'>
                      You have{' '}
                      <span className='font-bold text-yellow-900'>
                        {overbookingStats.pending}
                      </span>{' '}
                      pending overbooking(s) that need external car
                      arrangements.
                      {overbookingStats.arranged > 0 && (
                        <span className='ml-2'>
                          ({overbookingStats.arranged} already arranged,{' '}
                          {overbookingStats.confirmed} confirmed)
                        </span>
                      )}
                    </p>
                  </div>
                  <Link
                    href='/overbookings'
                    className='ml-4 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap'
                  >
                    View Overbookings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
                                  <Image
                                    src={activity.vehicle.image}
                                    alt={`${activity.vehicle.make} ${activity.vehicle.model}`}
                                    width={48}
                                    height={32}
                                    className='h-8 w-12 object-cover rounded mr-2'
                                    loading='lazy'
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
                <Link
                  href='/browse-cars'
                  className='w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
                >
                  <Car className='h-5 w-5 mr-3 text-emerald-600' />
                  Manage Fleet
                </Link>
                <Link
                  href='/bookings'
                  className='w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
                >
                  <Calendar className='h-5 w-5 mr-3 text-blue-600' />
                  View Bookings
                </Link>
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
                      const IconComponent = getIcon(notification.icon);
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
                              {notification.priority === 'urgent' && (
                                <div className='w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ml-2'></div>
                              )}
                              {notification.priority === 'important' && (
                                <div className='w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 ml-2'></div>
                              )}
                              {notification.priority === 'success' && (
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

      {/* Add Car Modal */}
      <AddCarModal
        isOpen={showAddCarModal}
        onClose={() => setShowAddCarModal(false)}
        onCarAdded={() => {
          setShowAddCarModal(false);
          console.log('Car added successfully!');
        }}
      />
    </div>
  );
}
