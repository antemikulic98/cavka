'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

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
  onBulkSave?: (startDate: Date, endDate: Date, price: number, label: string) => void;
}

export default function PriceEditModal({
  isOpen,
  editingDate,
  newPrice,
  dayPricing,
  onClose,
  onPriceChange,
  onSave,
  onBulkSave,
}: PriceEditModalProps) {
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [priceLabel, setPriceLabel] = useState('');

  if (!isOpen || !editingDate) return null;

  const getPriceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const customPricing = dayPricing.find((p) => p.date === dateStr);
    return customPricing ? customPricing.price : 0;
  };

  const handleSave = () => {
    if (mode === 'range' && onBulkSave && endDate) {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) return;
      onBulkSave(editingDate, endDate, price, priceLabel);
    } else {
      onSave();
    }
  };

  const calculateDaysInRange = () => {
    if (!endDate || !editingDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - editingDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className='fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl p-8 w-[500px] mx-4 shadow-2xl border'>
        <h3 className='text-xl font-bold text-gray-900 mb-6'>
          Set Vehicle Pricing
        </h3>

        {/* Mode Toggle */}
        <div className='flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg'>
          <button
            onClick={() => setMode('single')}
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              mode === 'single'
                ? 'bg-white text-green-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single Day
          </button>
          <button
            onClick={() => setMode('range')}
            className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              mode === 'range'
                ? 'bg-white text-green-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Date Range
          </button>
        </div>

        {/* Single Day Mode */}
        {mode === 'single' && (
          <div className='mb-6'>
            <p className='text-sm text-gray-600 mb-4'>
              {editingDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Date Range Mode */}
        {mode === 'range' && (
          <div className='mb-6 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Start Date
                </label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
                  <input
                    type='date'
                    value={editingDate.toISOString().split('T')[0]}
                    readOnly
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900'
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  End Date
                </label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
                  <input
                    type='date'
                    value={endDate?.toISOString().split('T')[0] || ''}
                    min={editingDate.toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                  />
                </div>
              </div>
            </div>
            {endDate && (
              <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
                <p className='text-sm text-green-800 font-medium'>
                  {calculateDaysInRange()} days selected
                </p>
              </div>
            )}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Label (Optional)
              </label>
              <input
                type='text'
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                placeholder='e.g., Peak Season, Holiday Rate'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
              />
            </div>
          </div>
        )}

        {/* Price Input */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Daily Rate (€)
          </label>
          <div className='relative'>
            <span className='absolute left-3 top-3 text-gray-500 text-lg'>€</span>
            <input
              type='number'
              value={newPrice}
              onChange={(e) => onPriceChange(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-gray-900'
              placeholder='0.00'
              min='0'
              step='0.01'
              autoFocus
            />
          </div>
          {mode === 'single' && (
            <p className='text-sm text-gray-500 mt-2'>
              Current rate: €{getPriceForDate(editingDate)}
            </p>
          )}
          {mode === 'range' && endDate && newPrice && (
            <p className='text-sm text-gray-600 mt-2'>
              Total revenue: €{(parseFloat(newPrice) * calculateDaysInRange()).toFixed(2)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={mode === 'range' && !endDate}
            className='px-6 py-2.5 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {mode === 'range' ? `Apply to ${calculateDaysInRange()} Days` : 'Save Price'}
          </button>
        </div>
      </div>
    </div>
  );
}
