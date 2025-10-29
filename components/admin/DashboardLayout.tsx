'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Car,
  Calendar,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface DashboardLayoutProps {
  user: UserSession;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overbookingStats, setOverbookingStats] = useState({
    pending: 0,
    arranged: 0,
    confirmed: 0,
  });

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
    fetchOverbookingStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchOverbookingStats, 30000);
    return () => clearInterval(interval);
  }, []);

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
      current: pathname === '/dashboard',
    },
    {
      name: 'All Bookings',
      icon: Calendar,
      href: '/bookings',
      current: pathname === '/bookings',
    },
    {
      name: 'Overbookings',
      icon: AlertTriangle,
      href: '/overbookings',
      current: pathname === '/overbookings',
      badge: overbookingStats.pending,
    },
    {
      name: 'Browse Cars',
      icon: Car,
      href: '/browse-cars',
      current: pathname === '/browse-cars',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      current: pathname === '/analytics',
    },
    {
      name: 'Profile',
      icon: User,
      href: '/profile',
      current: pathname === '/profile',
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/settings',
      current: pathname === '/settings',
    },
  ];

  const NavItem = ({ item }: { item: typeof navigation[0] }) => (
    <Link
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`${
        item.current
          ? 'bg-emerald-100 text-emerald-900 border-r-2 border-emerald-500'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 w-full`}
    >
      <div className='flex items-center'>
        <item.icon
          className={`${
            item.current
              ? 'text-emerald-500'
              : 'text-gray-400 group-hover:text-gray-500'
          } mr-3 flex-shrink-0 h-6 w-6`}
        />
        {item.name}
      </div>
      {item.badge && item.badge > 0 && (
        <span className='ml-auto bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse'>
          {item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className='fixed inset-0 bg-gray-600 bg-opacity-75'
          onClick={() => setSidebarOpen(false)}
        />
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
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
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
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
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
              {navigation.find((item) => item.current)?.name || 'Dashboard'}
            </h1>
          </div>
        </div>

        <main className='flex-1 relative overflow-y-auto focus:outline-none'>
          {children}
        </main>
      </div>
    </div>
  );
}
