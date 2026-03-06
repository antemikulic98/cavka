'use client';

import { useState } from 'react';
import { X, Calendar, Lock, AlertCircle } from 'lucide-react';

interface BlockDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (startDate: Date, endDate: Date, reason: string) => Promise<void>;
  selectedDate: Date | null;
}

const BLOCK_REASONS = [
  'Maintenance',
  'Personal Use',
  'Repairs',
  'Seasonal Break',
  'Insurance Hold',
  'Other',
];

export default function BlockDateModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
}: BlockDateModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('Maintenance');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize dates when modal opens
  useState(() => {
    if (isOpen && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date cannot be before start date');
      return;
    }

    const finalReason = reason === 'Other' ? customReason : reason;

    if (!finalReason.trim()) {
      setError('Please provide a reason for blocking these dates');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(start, end, finalReason);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to block dates');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setReason('Maintenance');
    setCustomReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // Calculate number of days
  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const dayCount = getDayCount();

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={handleClose}
    >
      <div
        className='bg-white rounded-2xl w-full max-w-lg shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center'>
            <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3'>
              <Lock className='h-5 w-5 text-orange-600' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>Block Dates</h2>
              <p className='text-sm text-gray-600'>
                Make vehicle unavailable for booking
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-5'>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
              <AlertCircle className='h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5' />
              <div className='text-sm text-red-800'>{error}</div>
            </div>
          )}

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Start Date *
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                End Date *
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900'
              />
            </div>
          </div>

          {/* Day Count Display */}
          {dayCount > 0 && (
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-3'>
              <div className='flex items-center text-orange-800'>
                <Calendar className='h-4 w-4 mr-2' />
                <span className='text-sm font-medium'>
                  {dayCount} {dayCount === 1 ? 'day' : 'days'} will be blocked
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900'
              required
            >
              {BLOCK_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason */}
          {reason === 'Other' && (
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Custom Reason *
              </label>
              <input
                type='text'
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder='Enter reason for blocking'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900'
              />
            </div>
          )}

          {/* Info Box */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <h4 className='text-sm font-semibold text-gray-900 mb-2'>
              What happens when you block dates?
            </h4>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• The vehicle will not be available for new bookings</li>
              <li>• Existing bookings for these dates will not be affected</li>
              <li>• You can unblock dates at any time</li>
              <li>• Blocked dates are shown in orange on the calendar</li>
            </ul>
          </div>

          {/* Actions */}
          <div className='flex space-x-3 pt-2'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Blocking...
                </>
              ) : (
                <>
                  <Lock className='h-4 w-4 mr-2' />
                  Block Dates
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
