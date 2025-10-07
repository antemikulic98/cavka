'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import Header from '../components/Header';
import BookingLookup from './BookingLookup';

export default function BookingsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900'>
      <Header />
      <div className='pt-20'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-white mb-4'>
              Manage Your Bookings
            </h1>
            <p className='text-lg text-emerald-100'>
              Enter your email address to view and manage your car rental
              bookings
            </p>
          </div>

          <Suspense
            fallback={
              <div className='flex justify-center items-center h-32'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-200'></div>
              </div>
            }
          >
            <BookingLookup />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
