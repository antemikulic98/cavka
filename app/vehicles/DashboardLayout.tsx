'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import {
  Home,
  Calendar,
  Car,
  BarChart3,
  User,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: UserSession;
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
      name: 'Browse Cars',
      icon: Car,
      href: '/vehicles',
      current: pathname.startsWith('/vehicles'),
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className='h-screen flex overflow-hidden bg-gray-100'>
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen}>
        <Dialog onClose={setSidebarOpen} className='relative z-50 lg:hidden'>
          <TransitionChild
            enter='transition-opacity ease-linear duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity ease-linear duration-300'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />
          </TransitionChild>

          <div className='fixed inset-0 flex z-40'>
            <TransitionChild
              enter='transition ease-in-out duration-300 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <DialogPanel className='relative flex-1 flex flex-col max-w-xs w-full bg-white'>
                <TransitionChild
                  enter='ease-in-out duration-300'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-300'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
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
                </TransitionChild>
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
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

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
                    className='ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-red-500 focus:outline-none'
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
                {pathname === '/vehicles' && 'Fleet Management'}
                {pathname.startsWith('/vehicles/') &&
                  pathname !== '/vehicles' &&
                  'Vehicle Details'}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='flex-1 relative overflow-y-auto focus:outline-none'>
          {children}
        </main>
      </div>
    </div>
  );
}
