'use client';

import { useState } from 'react';

interface DayPricing {
  date: string;
  price: number;
  label?: string;
  type?: string;
}

interface PriceEditModalProps {
  isOpen: boolean;
  editingDate: Date | null;
  newPrice: string;
  dayPricing: DayPricing[];
  onClose: () => void;
  onPriceChange: (price: string) => void;
  onSave: () => void;
}

export default function PriceEditModal({
  isOpen,
  editingDate,
  newPrice,
  dayPricing,
  onClose,
  onPriceChange,
  onSave,
}: PriceEditModalProps) {
  if (!isOpen || !editingDate) return null;

  const getPriceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const customPricing = dayPricing.find((p) => p.date === dateStr);
    return customPricing ? customPricing.price : 0;
  };

  return (
    <div className='fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl p-8 w-96 mx-4 shadow-2xl border backdrop-blur-xl'>
        <h3 className='text-xl font-bold text-gray-900 mb-4'>
          Set Price for{' '}
          {editingDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Daily Rate (€)
          </label>
          <div className='relative'>
            <span className='absolute left-3 top-3 text-gray-500'>€</span>
            <input
              type='number'
              value={newPrice}
              onChange={(e) => onPriceChange(e.target.value)}
              className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg text-gray-900 bg-white'
              placeholder='0.00'
              min='0'
              step='0.01'
              autoFocus
            />
          </div>
          <p className='text-sm text-gray-500 mt-2'>
            Current rate: €{getPriceForDate(editingDate)}
          </p>
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium'
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg'
          >
            Save Price
          </button>
        </div>
      </div>
    </div>
  );
}
