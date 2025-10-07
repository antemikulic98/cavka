'use client';

import React, { useState } from 'react';
import { Globe, Calendar, ChevronDown } from 'lucide-react';

export default function Header() {
  const [language, setLanguage] = useState('EN'); // 'EN' or 'HR'

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'HR' : 'EN');
  };

  return (
    <header className='absolute top-0 left-0 right-0 z-50 bg-transparent'>
      {/* Main Header */}
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          {/* Logo */}
          <div className='flex items-center'>
            <img src='/img/logo.svg' alt='Logo' className='h-12 w-auto' />
          </div>

          {/* Language Switcher & Manage Booking */}
          <div className='flex items-center space-x-6'>
            {/* Enhanced Language Switcher */}
            <button
              onClick={toggleLanguage}
              className='flex items-center text-white hover:text-gray-200 font-medium text-sm transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10'
            >
              <Globe className='h-4 w-4 mr-2' />
              <span className='mr-1'>{language}</span>
              <ChevronDown className='h-3 w-3' />
            </button>

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
