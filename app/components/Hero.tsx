'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Car,
  Plus,
  X,
  Calendar,
  UserCheck,
} from 'lucide-react';
import MobileSearchModal from './MobileSearchModal';

export default function Hero() {
  const [showReturnLocation, setShowReturnLocation] = useState(false);

  // Vehicle type state
  const [selectedVehicleType, setSelectedVehicleType] = useState('car'); // 'car' or 'transfers'

  // Location state
  const [pickupLocation, setPickupLocation] = useState('Zagreb Downtown');
  const [returnLocationValue, setReturnLocationValue] = useState('');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showReturnDropdown, setShowReturnDropdown] = useState(false);

  // Mobile modal states
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);

  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingPickup, setSelectingPickup] = useState(true);
  const [showPickupTimeDropdown, setShowPickupTimeDropdown] = useState(false);
  const [showReturnTimeDropdown, setShowReturnTimeDropdown] = useState(false);

  // Current calendar month (for navigation)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Date and time state
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState('12:00 PM');
  const [returnDate, setReturnDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 4);
    return tomorrow;
  });
  const [returnTime, setReturnTime] = useState('12:00 PM');

  // Calendar helper functions
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

  // Available locations
  const locations = [
    'Zagreb Downtown',
    'Zagreb Airport',
    'Split Downtown',
    'Split Airport',
    'Dubrovnik Downtown',
    'Dubrovnik Airport',
    'Rijeka Downtown',
    'Pula Downtown',
    'Zadar Downtown',
  ];

  // Handle mobile search modal
  const handleMobileSearch = (searchData: {
    vehicleType: string;
    pickupLocation: string;
    returnLocation?: string;
    pickupDate: Date;
    returnDate: Date;
    pickupTime: string;
    returnTime: string;
  }) => {
    const searchParams = new URLSearchParams();

    searchParams.set('pickupLocation', searchData.pickupLocation);
    if (searchData.returnLocation) {
      searchParams.set('returnLocation', searchData.returnLocation);
    }
    searchParams.set('pickupDate', searchData.pickupDate.toISOString());
    searchParams.set('returnDate', searchData.returnDate.toISOString());
    searchParams.set('pickupTime', searchData.pickupTime);
    searchParams.set('returnTime', searchData.returnTime);
    searchParams.set('vehicleType', searchData.vehicleType);

    // Navigate to search results page
    window.location.href = `/search?${searchParams.toString()}`;
  };

  // Handle search - navigate to search page
  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    searchParams.set('pickupLocation', pickupLocation);
    if (showReturnLocation && returnLocationValue) {
      searchParams.set('returnLocation', returnLocationValue);
    }
    searchParams.set('pickupDate', pickupDate.toISOString());
    searchParams.set('returnDate', returnDate.toISOString());
    searchParams.set('pickupTime', pickupTime);
    searchParams.set('returnTime', returnTime);
    searchParams.set('vehicleType', selectedVehicleType);

    // Navigate to search results page
    window.location.href = `/search?${searchParams.toString()}`;
  };

  // Get calendar days for a specific month
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

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle date selection from calendar
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
        setShowCalendar(false);
      }
    }
  };

  // Navigate months
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

  const handleTimeSelect = (
    value: string,
    setter: (val: string) => void,
    dropdownSetter: (val: boolean) => void
  ) => {
    setter(value);
    dropdownSetter(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !event.target ||
        !(event.target as Element).closest('.dropdown-container')
      ) {
        setShowCalendar(false);
        setShowPickupTimeDropdown(false);
        setShowReturnTimeDropdown(false);
        setShowPickupDropdown(false);
        setShowReturnDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <section className='relative text-gray-900 min-h-screen overflow-hidden rounded-b-2xl'>
      {/* Hero Background Image */}
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat rounded-b-2xl'
        style={{
          backgroundImage: 'url(/img/hero.png)',
        }}
      ></div>

      <div className='container mx-auto px-4 lg:px-6 relative z-20 pt-24 overflow-x-hidden'>
        <div className='max-w-screen-2xl mx-auto overflow-x-hidden'>
          {/* Booking Widget - Desktop and Mobile Responsive */}
          <div className='rounded-2xl shadow-2xl p-6 border border-gray-200 backdrop-blur-md bg-white/98'>
            {/* Vehicle Type Tabs */}
            <div className='flex mb-8'>
              <button
                onClick={() => setSelectedVehicleType('car')}
                className={`px-6 py-3 rounded-l-2xl font-semibold flex items-center text-sm shadow-lg transition-all duration-200 ${
                  selectedVehicleType === 'car'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Car className='h-5 w-5 mr-2' />
                Rent a Car
              </button>
              <button
                onClick={() => setSelectedVehicleType('transfers')}
                className={`px-6 py-3 rounded-r-2xl font-semibold flex items-center text-sm shadow-lg transition-all duration-200 ${
                  selectedVehicleType === 'transfers'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserCheck className='h-5 w-5 mr-2' />
                Transfers
              </button>
            </div>

            {/* Mobile Layout - Simple Location Selection */}
            <div className='lg:hidden space-y-4'>
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-2'>
                  Pickup Location
                </label>
                <button
                  onClick={() => setShowMobileSearchModal(true)}
                  className='w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all duration-200'
                >
                  <div className='flex items-center'>
                    <MapPin className='h-5 w-5 text-green-600 mr-3' />
                    <span className='text-gray-900 font-medium'>
                      Select pickup location
                    </span>
                  </div>
                  <ChevronDown className='h-4 w-4 text-green-600' />
                </button>
              </div>
            </div>

            {/* Desktop Layout - Full Search Form */}
            <div className='hidden lg:block space-y-6 dropdown-container'>
              {/* Main Selector Row */}
              <div className='flex flex-col xl:flex-row gap-4 items-end'>
                {/* Pickup Location */}
                <div className='flex-1 min-w-0'>
                  <label className='block text-sm font-bold text-gray-800 mb-2'>
                    Pickup Location
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10'>
                      <MapPin className='h-5 w-5 text-green-600' />
                    </div>
                    <button
                      onClick={() => {
                        setShowPickupDropdown(!showPickupDropdown);
                        setShowReturnDropdown(false);
                        setShowCalendar(false);
                        setShowPickupTimeDropdown(false);
                        setShowReturnTimeDropdown(false);
                      }}
                      className='w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-green-800 text-gray-900 text-sm font-medium shadow-sm hover:border-gray-300 transition-all duration-200 bg-white text-left'
                    >
                      {pickupLocation}
                    </button>
                    <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                      <ChevronDown
                        className={`h-4 w-4 text-green-600 transition-transform duration-200 ${
                          showPickupDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {showPickupDropdown && (
                      <div className='absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50'>
                        {locations.map((location) => (
                          <button
                            key={location}
                            onClick={() => {
                              setPickupLocation(location);
                              setShowPickupDropdown(false);
                            }}
                            className='w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium first:rounded-t-xl last:rounded-b-xl'
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Return Location - Optional */}
                {showReturnLocation ? (
                  <div className='flex-1 min-w-0'>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>
                      Return Location
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10'>
                        <MapPin className='h-5 w-5 text-green-600' />
                      </div>
                      <button
                        onClick={() => {
                          setShowReturnDropdown(!showReturnDropdown);
                          setShowPickupDropdown(false);
                          setShowCalendar(false);
                          setShowPickupTimeDropdown(false);
                          setShowReturnTimeDropdown(false);
                        }}
                        className='w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-green-800 text-gray-900 text-sm font-medium shadow-sm hover:border-gray-300 transition-all duration-200 bg-white text-left'
                      >
                        {returnLocationValue || 'Select return location'}
                      </button>
                      <div className='absolute inset-y-0 right-8 pr-2 flex items-center pointer-events-none'>
                        <ChevronDown
                          className={`h-4 w-4 text-green-600 transition-transform duration-200 ${
                            showReturnDropdown ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setShowReturnLocation(false);
                          setReturnLocationValue('');
                          setShowReturnDropdown(false);
                        }}
                        className='absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors z-20'
                      >
                        <X className='h-5 w-5 text-gray-400 hover:text-red-500' />
                      </button>

                      {showReturnDropdown && (
                        <div className='absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50'>
                          {locations.map((location) => (
                            <button
                              key={location}
                              onClick={() => {
                                setReturnLocationValue(location);
                                setShowReturnDropdown(false);
                              }}
                              className='w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium first:rounded-t-xl last:rounded-b-xl'
                            >
                              {location}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='flex-1 min-w-0'>
                    <label className='block text-sm font-bold text-gray-800 mb-2'>
                      &nbsp;
                    </label>
                    <button
                      onClick={() => setShowReturnLocation(true)}
                      className='w-full flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-green-800 hover:text-green-900 hover:border-gray-400 font-semibold transition-all duration-200 text-sm bg-white'
                    >
                      <Plus className='h-5 w-5 mr-2' />
                      Add different return location
                    </button>
                  </div>
                )}

                {/* Pick-up Date & Time Combined */}
                <div className='relative'>
                  <label className='block text-sm font-bold text-gray-800 mb-2'>
                    Pick-up Date
                  </label>
                  <div className='flex'>
                    {/* Date Button - Left Side */}
                    <button
                      onClick={() => {
                        setShowCalendar(true);
                        setSelectingPickup(true);
                        setShowPickupTimeDropdown(false);
                        setShowReturnTimeDropdown(false);
                      }}
                      className='flex items-center px-4 py-4 border-2 border-gray-200 rounded-l-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm border-r-0'
                    >
                      <Calendar className='h-5 w-5 text-green-600 mr-3' />
                      <span className='text-sm font-medium text-gray-900'>
                        {formatDate(pickupDate)}
                      </span>
                    </button>

                    {/* Time Dropdown - Right Side */}
                    <button
                      onClick={() => {
                        setShowPickupTimeDropdown(!showPickupTimeDropdown);
                        setShowReturnTimeDropdown(false);
                        setShowCalendar(false);
                      }}
                      className='flex items-center justify-between px-4 py-4 border-2 border-gray-200 rounded-r-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm min-w-max'
                    >
                      <span className='text-sm font-medium text-gray-900 mr-2'>
                        {pickupTime}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-green-600 transition-transform duration-200 ${
                          showPickupTimeDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {showPickupTimeDropdown && (
                    <div className='absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 w-32'>
                      {timeOptions.map((time) => (
                        <button
                          key={time.value}
                          onClick={() =>
                            handleTimeSelect(
                              time.value,
                              setPickupTime,
                              setShowPickupTimeDropdown
                            )
                          }
                          className='w-full px-4 py-2 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium first:rounded-t-xl last:rounded-b-xl'
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return Date & Time Combined */}
                <div className='relative'>
                  <label className='block text-sm font-bold text-gray-800 mb-2'>
                    Return Date
                  </label>
                  <div className='flex'>
                    {/* Date Button - Left Side */}
                    <button
                      onClick={() => {
                        setShowCalendar(true);
                        setSelectingPickup(false);
                        setShowPickupTimeDropdown(false);
                        setShowReturnTimeDropdown(false);
                      }}
                      className='flex items-center px-4 py-4 border-2 border-gray-200 rounded-l-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm border-r-0'
                    >
                      <Calendar className='h-5 w-5 text-green-600 mr-3' />
                      <span className='text-sm font-medium text-gray-900'>
                        {formatDate(returnDate)}
                      </span>
                    </button>

                    {/* Time Dropdown - Right Side */}
                    <button
                      onClick={() => {
                        setShowReturnTimeDropdown(!showReturnTimeDropdown);
                        setShowPickupTimeDropdown(false);
                        setShowCalendar(false);
                      }}
                      className='flex items-center justify-between px-4 py-4 border-2 border-gray-200 rounded-r-xl hover:border-gray-300 transition-all duration-200 bg-white shadow-sm min-w-max'
                    >
                      <span className='text-sm font-medium text-gray-900 mr-2'>
                        {returnTime}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-green-600 transition-transform duration-200 ${
                          showReturnTimeDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {showReturnTimeDropdown && (
                    <div className='absolute top-full right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 w-32'>
                      {timeOptions.map((time) => (
                        <button
                          key={time.value}
                          onClick={() =>
                            handleTimeSelect(
                              time.value,
                              setReturnTime,
                              setShowReturnTimeDropdown
                            )
                          }
                          className='w-full px-4 py-2 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium first:rounded-t-xl last:rounded-b-xl'
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className='bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-950 text-white font-bold py-4 px-10 rounded-xl text-sm transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 whitespace-nowrap min-w-max'
                >
                  {selectedVehicleType === 'car'
                    ? 'Show Cars'
                    : 'Show Transfers'}
                </button>
              </div>

              {/* Calendar Overlay */}
              {showCalendar && (
                <div className='absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 p-6'>
                  {/* Calendar Header */}
                  <div className='flex justify-between items-center mb-6'>
                    <div className='flex space-x-4'>
                      <div
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectingPickup
                            ? 'bg-green-100 text-green-800'
                            : 'text-gray-600'
                        }`}
                      >
                        Pick-up date
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          !selectingPickup
                            ? 'bg-green-100 text-green-800'
                            : 'text-gray-600'
                        }`}
                      >
                        Return date
                      </div>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className='grid grid-cols-2 gap-8'>
                    {/* Current Month */}
                    <div>
                      <div className='flex justify-between items-center mb-4'>
                        <button
                          onClick={() => navigateMonth('prev')}
                          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                          <ChevronLeft className='h-5 w-5 text-gray-600' />
                        </button>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {monthNames[currentMonth]} {currentYear}
                        </h3>
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
                              onClick={() =>
                                date && handleCalendarDateSelect(date)
                              }
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
                                date.toDateString() ===
                                  pickupDate.toDateString()
                                  ? 'bg-green-100 text-green-800 font-semibold ring-2 ring-green-200'
                                  : ''
                              }
                              ${
                                date &&
                                date.toDateString() ===
                                  returnDate.toDateString()
                                  ? 'bg-orange-100 text-orange-800 font-semibold ring-2 ring-orange-200'
                                  : ''
                              }
                              ${
                                date && date > pickupDate && date < returnDate
                                  ? 'bg-gray-100'
                                  : ''
                              }
                              ${
                                date &&
                                date >=
                                  new Date(new Date().setHours(0, 0, 0, 0)) &&
                                date.toDateString() !==
                                  pickupDate.toDateString() &&
                                date.toDateString() !==
                                  returnDate.toDateString()
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

                    {/* Next Month */}
                    <div>
                      <div className='flex justify-center items-center mb-4'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {monthNames[(currentMonth + 1) % 12]}{' '}
                          {currentMonth === 11 ? currentYear + 1 : currentYear}
                        </h3>
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
                        {getCalendarDays(
                          currentMonth === 11 ? currentYear + 1 : currentYear,
                          (currentMonth + 1) % 12
                        ).map((date, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              date && handleCalendarDateSelect(date)
                            }
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
                                date.toDateString() ===
                                  pickupDate.toDateString()
                                  ? 'bg-green-100 text-green-800 font-semibold ring-2 ring-green-200'
                                  : ''
                              }
                              ${
                                date &&
                                date.toDateString() ===
                                  returnDate.toDateString()
                                  ? 'bg-orange-100 text-orange-800 font-semibold ring-2 ring-orange-200'
                                  : ''
                              }
                              ${
                                date && date > pickupDate && date < returnDate
                                  ? 'bg-gray-100'
                                  : ''
                              }
                              ${
                                date &&
                                date >=
                                  new Date(new Date().setHours(0, 0, 0, 0)) &&
                                date.toDateString() !==
                                  pickupDate.toDateString() &&
                                date.toDateString() !==
                                  returnDate.toDateString()
                                  ? 'hover:bg-gray-50'
                                  : ''
                              }
                            `}
                          >
                            {date?.getDate()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={showMobileSearchModal}
        onClose={() => setShowMobileSearchModal(false)}
        onSearch={handleMobileSearch}
        initialVehicleType={selectedVehicleType}
        locations={locations}
      />

      {/* Powerful Hero Title - Bottom Positioned to Avoid Car */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 text-center w-full px-2'>
        <div className='animate-fade-in-up relative'>
          {/* Background with glass morphism effect */}
          <div className='absolute -inset-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl'></div>

          <div className='relative z-10 py-6 px-4'>
            {/* Supporting tagline */}
            <p className='font-poppins text-sm md:text-sm lg:text-base text-gray-200 font-medium mb-2 opacity-90 tracking-wide uppercase animate-fade-in-delayed'>
              Premium Car Rental Experience
            </p>

            {/* Main headline with enhanced styling - Bigger single line on mobile */}
            <h1 className='font-poppins text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-1 tracking-tight leading-none'>
              <span className='block drop-shadow-2xl text-shadow-lg hover:scale-105 transition-transform duration-300 whitespace-nowrap'>
                DON&apos;T JUST RENT A CAR.
              </span>
            </h1>

            {/* Emphasized second line with gradient */}
            <h2 className='font-poppins text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-none'>
              <span className='block bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl hover:scale-105 transition-all duration-500 hover:from-amber-200 hover:via-yellow-300 hover:to-amber-400 whitespace-nowrap'>
                RENT THE EXPERIENCE.
              </span>
            </h2>
          </div>

          {/* Animated background elements */}
          <div className='absolute inset-0 -z-10'>
            <div className='absolute -top-12 left-1/4 w-40 h-40 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse'></div>
            <div className='absolute -bottom-12 right-1/4 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
          </div>
        </div>
      </div>
    </section>
  );
}
