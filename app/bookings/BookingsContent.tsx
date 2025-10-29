'use client';

import { useState } from 'react';
import { Plus, List } from 'lucide-react';
import BookingManagement from '../dashboard/bookings/BookingManagement';
import BookingForm from './BookingForm';

export default function BookingsContent() {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');

  const handleBookingCreated = () => {
    // Switch back to list view after successful booking creation
    setActiveView('list');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {activeView === 'list' ? 'Booking Management' : 'Create New Booking'}
            </h1>
            <p className='text-lg text-gray-600'>
              {activeView === 'list'
                ? 'Manage all vehicle bookings, update statuses, and view customer information'
                : 'Create a new booking for a customer'}
            </p>
          </div>
          <button
            onClick={() => setActiveView(activeView === 'list' ? 'create' : 'list')}
            className='flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md hover:shadow-lg'
          >
            {activeView === 'list' ? (
              <>
                <Plus className='h-5 w-5' />
                <span>Create Booking</span>
              </>
            ) : (
              <>
                <List className='h-5 w-5' />
                <span>View All Bookings</span>
              </>
            )}
          </button>
        </div>

        {activeView === 'list' ? (
          <BookingManagement />
        ) : (
          <BookingForm onBookingCreated={handleBookingCreated} />
        )}
      </div>
    </div>
  );
}
