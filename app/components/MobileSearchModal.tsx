'use client';

import React, { useState } from 'react';
import { MapPin, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchData: {
    vehicleType: string;
    pickupLocation: string;
    returnLocation?: string;
    pickupDate: Date;
    returnDate: Date;
    pickupTime: string;
    returnTime: string;
  }) => void;
  initialVehicleType?: string;
  locations: string[];
}

type ModalStep = 'pickup-location' | 'return-location' | 'dates';

export default function MobileSearchModal({
  isOpen,
  onClose,
  onSearch,
  initialVehicleType = 'car',
  locations,
}: MobileSearchModalProps) {
  const [step, setStep] = useState<ModalStep>('pickup-location');
  const [vehicleType] = useState(initialVehicleType);
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [showReturnLocation, setShowReturnLocation] = useState(false);
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 4);
    return tomorrow;
  });
  const [pickupTime, setPickupTime] = useState('12:00 PM');
  const [returnTime, setReturnTime] = useState('12:00 PM');

  // Calendar states
  const [selectingPickup, setSelectingPickup] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const generateTimes = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of ['00', '30']) {
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const display = `${hour12}:${minute} ${period}`;
        times.push({ value: display, label: display });
      }
    }
    return times;
  };

  const timeOptions = generateTimes();

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCalendarDateSelect = (date: Date) => {
    if (selectingPickup) {
      setPickupDate(date);
      if (date >= returnDate) {
        const newReturnDate = new Date(date);
        newReturnDate.setDate(date.getDate() + 1);
        setReturnDate(newReturnDate);
      }
      setSelectingPickup(false);
    } else {
      if (date > pickupDate) {
        setReturnDate(date);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleNextStep = () => {
    switch (step) {
      case 'pickup-location':
        if (showReturnLocation) {
          setStep('return-location');
        } else {
          setStep('dates');
        }
        break;
      case 'return-location':
        setStep('dates');
        break;
      case 'dates':
        // Perform search
        onSearch({
          vehicleType,
          pickupLocation,
          returnLocation: showReturnLocation ? returnLocation : undefined,
          pickupDate,
          returnDate,
          pickupTime,
          returnTime,
        });
        onClose();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'return-location':
        setStep('pickup-location');
        break;
      case 'dates':
        if (showReturnLocation) {
          setStep('return-location');
        } else {
          setStep('pickup-location');
        }
        break;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'pickup-location':
        return pickupLocation !== '';
      case 'return-location':
        return returnLocation !== '';
      case 'dates':
        return pickupDate && returnDate;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'pickup-location':
        return 'Pickup Location';
      case 'return-location':
        return 'Return Location';
      case 'dates':
        return 'Select Dates';
      default:
        return '';
    }
  };

  const getNextButtonText = () => {
    switch (step) {
      case 'dates':
        return 'Search Now';
      default:
        return 'Continue';
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] lg:hidden'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' />

      {/* Modal */}
      <div className='absolute inset-0 bg-white flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white'>
          <div className='flex items-center'>
            {step !== 'pickup-location' && (
              <button
                onClick={handleBack}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors mr-2'
              >
                <ChevronLeft className='h-6 w-6 text-gray-600' />
              </button>
            )}
            <h2 className='text-lg font-semibold text-gray-900'>
              {getStepTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='h-6 w-6 text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Pickup Location Selection */}
          {step === 'pickup-location' && (
            <div className='p-4 space-y-4'>
              <div className='text-center mb-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Where do you want to pick up?
                </h3>
                <p className='text-gray-600'>Select your pickup location</p>
              </div>

              <div className='space-y-2'>
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => setPickupLocation(location)}
                    className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 ${
                      pickupLocation === location
                        ? 'bg-green-50 border-2 border-green-200 text-green-800'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <MapPin
                      className={`h-5 w-5 mr-3 ${
                        pickupLocation === location
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div className='flex-1'>
                      <div
                        className={`font-medium ${
                          pickupLocation === location
                            ? 'text-green-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {location}
                      </div>
                    </div>
                    {pickupLocation === location && (
                      <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center'>
                        <div className='w-2 h-2 bg-white rounded-full' />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className='mt-8 pt-4 border-t border-gray-200'>
                <button
                  onClick={() => setShowReturnLocation(!showReturnLocation)}
                  className={`w-full flex items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    showReturnLocation
                      ? 'border-green-300 bg-green-50 text-green-800'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Plus className='h-5 w-5 mr-2' />
                  {showReturnLocation
                    ? 'Different return location added'
                    : 'Add different return location'}
                </button>
              </div>
            </div>
          )}

          {/* Return Location Selection */}
          {step === 'return-location' && (
            <div className='p-4 space-y-4'>
              <div className='text-center mb-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Where do you want to return?
                </h3>
                <p className='text-gray-600'>Select your return location</p>
              </div>

              <div className='space-y-2'>
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => setReturnLocation(location)}
                    className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 ${
                      returnLocation === location
                        ? 'bg-green-50 border-2 border-green-200 text-green-800'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <MapPin
                      className={`h-5 w-5 mr-3 ${
                        returnLocation === location
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div className='flex-1'>
                      <div
                        className={`font-medium ${
                          returnLocation === location
                            ? 'text-green-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {location}
                      </div>
                    </div>
                    {returnLocation === location && (
                      <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center'>
                        <div className='w-2 h-2 bg-white rounded-full' />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          {step === 'dates' && (
            <div className='p-4 space-y-6'>
              <div className='text-center mb-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  When do you need it?
                </h3>
                <p className='text-gray-600'>
                  Select your pickup and return dates
                </p>
              </div>

              {/* Date Selection Tabs */}
              <div className='flex mb-4'>
                <button
                  onClick={() => setSelectingPickup(true)}
                  className={`flex-1 px-4 py-3 rounded-l-xl font-medium transition-colors ${
                    selectingPickup
                      ? 'bg-green-100 text-green-800 border-2 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                  }`}
                >
                  Pickup: {formatDate(pickupDate)}
                </button>
                <button
                  onClick={() => setSelectingPickup(false)}
                  className={`flex-1 px-4 py-3 rounded-r-xl font-medium transition-colors ${
                    !selectingPickup
                      ? 'bg-green-100 text-green-800 border-2 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                  }`}
                >
                  Return: {formatDate(returnDate)}
                </button>
              </div>

              {/* Calendar */}
              <div className='bg-white border border-gray-200 rounded-xl p-4'>
                {/* Calendar Header */}
                <div className='flex justify-between items-center mb-4'>
                  <button
                    onClick={() => navigateMonth('prev')}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <ChevronLeft className='h-5 w-5 text-gray-600' />
                  </button>
                  <h4 className='text-lg font-semibold text-gray-900'>
                    {monthNames[currentMonth]} {currentYear}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <ChevronRight className='h-5 w-5 text-gray-600' />
                  </button>
                </div>

                {/* Day Headers */}
                <div className='grid grid-cols-7 gap-1 mb-2'>
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className='text-center text-xs font-medium text-gray-500 p-2'
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className='grid grid-cols-7 gap-1'>
                  {getCalendarDays(currentYear, currentMonth).map(
                    (date, index) => (
                      <button
                        key={index}
                        onClick={() => date && handleCalendarDateSelect(date)}
                        disabled={
                          !date ||
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className={`
                        p-3 text-sm rounded-lg transition-all duration-200 
                        ${!date ? 'invisible' : ''}
                        ${
                          date &&
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                            ? 'text-gray-300 cursor-not-allowed'
                            : ''
                        }
                        ${
                          date &&
                          date.toDateString() === pickupDate.toDateString()
                            ? 'bg-green-500 text-white font-semibold'
                            : ''
                        }
                        ${
                          date &&
                          date.toDateString() === returnDate.toDateString()
                            ? 'bg-orange-500 text-white font-semibold'
                            : ''
                        }
                        ${
                          date && date > pickupDate && date < returnDate
                            ? 'bg-gray-100'
                            : ''
                        }
                        ${
                          date &&
                          date >= new Date(new Date().setHours(0, 0, 0, 0)) &&
                          date.toDateString() !== pickupDate.toDateString() &&
                          date.toDateString() !== returnDate.toDateString()
                            ? 'hover:bg-gray-50'
                            : ''
                        }
                      `}
                      >
                        {date?.getDate()}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Time Selection */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Pickup Time
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  >
                    {timeOptions.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Return Time
                  </label>
                  <select
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  >
                    {timeOptions.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Continue Button */}
        <div className='p-4 border-t border-gray-200 bg-white'>
          <button
            onClick={handleNextStep}
            disabled={!canProceed()}
            className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 ${
              canProceed()
                ? 'bg-green-800 hover:bg-green-900 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {getNextButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
