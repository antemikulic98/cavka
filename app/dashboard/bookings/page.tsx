'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import BookingManagement from './BookingManagement';

export default function DashboardBookingsPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Booking Management
          </h1>
          <p className='text-lg text-gray-600'>
            Manage all vehicle bookings, update statuses, and view customer
            information
          </p>
        </div>

        <Suspense
          fallback={
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-800'></div>
            </div>
          }
        >
          <BookingManagement />
        </Suspense>
      </div>
    </div>
  );
}
