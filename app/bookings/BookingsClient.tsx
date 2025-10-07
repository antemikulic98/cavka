'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Car,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  List,
} from 'lucide-react';
import { UserSession } from '@/lib/auth';
import BookingManagement from '../dashboard/bookings/BookingManagement';
import BookingForm from './BookingForm';

interface BookingsClientProps {
  user: UserSession;
}

export default function BookingsClient({ user }: BookingsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');

  const handleBookingCreated = () => {
    // Switch back to list view after successful booking creation
    setActiveView('list');
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

  const navigation = [
    {
      name: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      current: false,
    },
    {
      name: 'All Bookings',
      icon: Calendar,
      href: '/bookings',
      current: true, // This page is active
    },
    {
      name: 'Browse Cars',
      icon: Car,
      href: '/vehicles',
      current: false,
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      href: '/dashboard',
      current: false,
    },
    {
      name: 'Profile',
      icon: User,
      href: '/dashboard',
      current: false,
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/dashboard',
      current: false,
    },
  ];

  return (
    <div className='h-screen flex overflow-hidden bg-gray-100'>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='fixed inset-0 bg-gray-600 bg-opacity-75'
            onClick={() => setSidebarOpen(false)}
          />

          <div className='relative flex-1 flex flex-col max-w-xs w-full bg-white'>
            <div className='absolute top-0 right-0 -mr-12 pt-2'>
              <button
                type='button'
                className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                onClick={() => setSidebarOpen(false)}
              >
                <span className='sr-only'>Close sidebar</span>
                <X className='h-6 w-6 text-white' aria-hidden='true' />
              </button>
            </div>

            <div className='flex-1 h-0 pt-5 pb-4 overflow-y-auto'>
              <div className='flex-shrink-0 flex items-center px-4'>
                <img
                  src='/img/logo-black.svg'
                  alt='Logo'
                  className='h-12 w-auto'
                />
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
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
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
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className='hidden lg:flex lg:flex-shrink-0'>
        <div className='flex flex-col w-64'>
          <div className='flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white'>
            <div className='flex-1 flex flex-col pt-5 pb-4 overflow-y-auto'>
              <div className='flex items-center flex-shrink-0 px-4 mb-8'>
                <img
                  src='/img/logo-black.svg'
                  alt='Logo'
                  className='h-12 w-auto'
                />
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
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
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
                    </a>
                  ))}
                </nav>
              </div>

              {/* User section */}
              <div className='flex-shrink-0 flex border-t border-gray-200 p-4'>
                <div className='flex items-center w-full'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center'>
                      <User className='w-5 h-5 text-emerald-600' />
                    </div>
                  </div>
                  <div className='ml-3 flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {user.fullName}
                    </p>
                    <p className='text-xs text-gray-500 truncate'>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className='ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-red-500 focus:outline-none disabled:opacity-50'
                    title='Sign out'
                  >
                    <LogOut className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex flex-col w-0 flex-1 overflow-hidden'>
        {/* Mobile top bar */}
        <div className='lg:hidden'>
          <div className='flex items-center justify-between bg-white border-b border-gray-200 px-4 py-1.5'>
            <button
              type='button'
              className='-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500'
              onClick={() => setSidebarOpen(true)}
            >
              <span className='sr-only'>Open sidebar</span>
              <Menu className='h-6 w-6' />
            </button>
            <div className='flex-1 px-4 flex justify-between items-center'>
              <h1 className='text-lg font-semibold text-gray-900'>
                {activeView === 'list' ? 'All Bookings' : 'Create New Booking'}
              </h1>
              <div className='flex space-x-2'>
                <button
                  onClick={() => setActiveView('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    activeView === 'list'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title='View All Bookings'
                >
                  <List className='h-5 w-5' />
                </button>
                <button
                  onClick={() => setActiveView('create')}
                  className={`p-2 rounded-lg transition-colors ${
                    activeView === 'create'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title='Create New Booking'
                >
                  <Plus className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className='hidden lg:block bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900'>
              {activeView === 'list' ? 'All Bookings' : 'Create New Booking'}
            </h1>
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setActiveView('list')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'list'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className='h-4 w-4 mr-2' />
                View All Bookings
              </button>
              <button
                onClick={() => setActiveView('create')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'create'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className='h-4 w-4 mr-2' />
                Create New Booking
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='flex-1 relative overflow-y-auto focus:outline-none'>
          {activeView === 'list' ? (
            <BookingManagement />
          ) : (
            <div className='p-6'>
              <BookingForm onBookingCreated={handleBookingCreated} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
