'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

export default function Header() {

  return (
    <header className='absolute top-0 left-0 right-0 z-50 bg-transparent'>
      {/* Main Header */}
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          {/* Logo */}
          <div className='flex items-center'>
            <a href='/' className='flex items-center' aria-label='Hit Rent Croatia - Home'>
              <Image
                src='/img/logo.svg'
                alt='Hit Rent Croatia - Premium Car Rental Service'
                width={150}
                height={48}
                className='h-12 w-auto'
                priority
              />
            </a>
          </div>

          {/* Manage Booking */}
          <div className='flex items-center space-x-6'>

            {/* Manage Booking with Icon */}
            <a
              href='/my-bookings'
              className='flex items-center text-white hover:text-gray-200 font-bold text-sm transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <Calendar className='h-4 w-4 mr-2' />
              Manage Booking
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
