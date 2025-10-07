'use client';

import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Hash,
  Euro,
  MapPin,
  Clock,
  Car,
  Edit,
  Check,
} from 'lucide-react';

interface DayPricing {
  date: string;
  price: number;
  label?: string;
  type?: string;
}

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  rentalDays?: number;
  status: string;
  bookingReference?: string;
  customerName?: string;
  totalCost?: number;
  createdAt?: string;
}

interface VehicleCalendarProps {
  vehicle: {
    dailyRate: number;
  };
  currentDate: Date;
  dayPricing: DayPricing[];
  bookings: Booking[];
  editMode: boolean;
  onDateClick: (date: Date) => void;
  onMonthNavigate: (direction: 'prev' | 'next') => void;
  onClearCustomPrice: (date: Date) => void;
  onToggleEditMode: () => void;
}

export default function VehicleCalendar({
  vehicle,
  currentDate,
  dayPricing,
  bookings,
  editMode,
  onDateClick,
  onMonthNavigate,
  onClearCustomPrice,
  onToggleEditMode,
}: VehicleCalendarProps) {
  const getPriceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const customPricing = dayPricing.find((p) => p.date === dateStr);
    if (customPricing) {
      return {
        price: customPricing.price,
        pricing: customPricing,
        type: 'custom',
      };
    }

    return {
      price: vehicle?.dailyRate || 80,
      pricing: null,
      type: 'base',
    };
  };

  const getPriceTypeColor = (
    type: string,
    isBooked: boolean = false,
    isPast: boolean = false
  ) => {
    if (isPast) {
      return 'bg-gray-100 border-2 border-gray-300 text-gray-500';
    }

    if (isBooked) {
      return 'bg-red-50 border-2 border-red-300 text-red-800 hover:bg-red-100';
    }

    // Clean available styling - green theme
    return 'bg-green-50 border-2 border-green-300 text-green-800 hover:bg-green-100 hover:border-green-400';
  };

  const isDateBooked = (date: Date) => {
    const checkDateStr = date.toISOString().split('T')[0];
    return bookings.some((booking) => {
      const startDateStr = booking.startDate.split('T')[0];
      const endDateStr = booking.endDate.split('T')[0];
      return (
        checkDateStr >= startDateStr &&
        checkDateStr <= endDateStr &&
        booking.status === 'confirmed'
      );
    });
  };

  // Get booking details for a specific date
  const getBookingForDate = (date: Date) => {
    const checkDateStr = date.toISOString().split('T')[0];
    return bookings.find((booking) => {
      const startDateStr = booking.startDate.split('T')[0];
      const endDateStr = booking.endDate.split('T')[0];
      return (
        checkDateStr >= startDateStr &&
        checkDateStr <= endDateStr &&
        booking.status === 'confirmed'
      );
    });
  };

  // Determine booking position (start, middle, end, single)
  const getBookingPosition = (date: Date, booking: Booking) => {
    const checkDateStr = date.toISOString().split('T')[0];
    const startDateStr = booking.startDate.split('T')[0];
    const endDateStr = booking.endDate.split('T')[0];

    if (startDateStr === endDateStr) {
      return 'single';
    } else if (checkDateStr === startDateStr) {
      return 'start';
    } else if (checkDateStr === endDateStr) {
      return 'end';
    } else {
      return 'middle';
    }
  };

  // Get booking period styling based on position
  const getBookingPeriodStyling = (position: string) => {
    const baseClasses =
      'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 text-red-800 shadow-sm';

    switch (position) {
      case 'start':
        return `${baseClasses} border-red-400 shadow-md`;
      case 'middle':
        return `${baseClasses} border-red-300`;
      case 'end':
        return `${baseClasses} border-red-400 shadow-md`;
      case 'single':
        return `${baseClasses} border-red-400 shadow-md`;
      default:
        return `${baseClasses}`;
    }
  };

  // Calculate booking duration (inclusive of both start and end dates)
  const getBookingDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate.split('T')[0]);
    const end = new Date(endDate.split('T')[0]);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Get the day number within a booking period (1-indexed)
  const getBookingDayNumber = (currentDate: Date, startDate: string) => {
    const currentStr = currentDate.toISOString().split('T')[0];
    const startStr = startDate.split('T')[0];
    const current = new Date(currentStr + 'T00:00:00.000Z');
    const start = new Date(startStr + 'T00:00:00.000Z');
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className='h-32'></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date in UTC to avoid timezone issues
      const date = new Date(
        Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
      const isToday =
        date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
      const isBooked = isDateBooked(date);
      const booking = getBookingForDate(date);
      const todayUTC = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
      );
      const isPast = date < todayUTC;

      const { price, pricing, type } = getPriceForDate(date);
      const hasCustomPricing = pricing !== null;

      // Get booking position and styling for smart period display
      const bookingPosition = booking
        ? getBookingPosition(date, booking)
        : null;
      const bookingDuration = booking
        ? booking.rentalDays ||
          getBookingDuration(booking.startDate, booking.endDate)
        : 0;

      // Create rich tooltip for booked dates
      const createBookingTooltip = () => {
        if (!booking)
          return isPast
            ? 'Past date'
            : `${
                editMode ? 'Click to edit price' : 'Available'
              } - €${price}/day`;

        const startDate = new Date(booking.startDate).toLocaleDateString();
        const endDate = new Date(booking.endDate).toLocaleDateString();
        const customerName = booking.customerName || 'Unknown Customer';
        const reference = booking.bookingReference || booking._id.slice(-6);
        const totalCost = booking.totalCost ? `€${booking.totalCost}` : 'N/A';

        return `${customerName} • Ref: ${reference}\n${startDate} - ${endDate} (${bookingDuration} days)\nTotal: ${totalCost}\n${bookingPosition?.toUpperCase()} of booking period`;
      };

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(date)}
          className={`h-32 p-3 rounded-xl cursor-pointer transition-all duration-300 relative shadow-sm hover:shadow-lg ${
            isPast
              ? 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed'
              : isBooked && bookingPosition
              ? getBookingPeriodStyling(bookingPosition) + ' hover:bg-red-100'
              : getPriceTypeColor(type, false, false)
          } ${
            editMode && !isBooked && !isPast
              ? 'hover:scale-105 hover:shadow-xl'
              : ''
          }`}
          title={createBookingTooltip()}
        >
          <div className='font-bold text-lg mb-1'>{day}</div>

          {/* Available date pricing */}
          {!isBooked && !isPast && (
            <div className='text-sm font-bold text-green-900'>€{price}</div>
          )}

          {/* Past date indicator */}
          {isPast && !isBooked && (
            <div className='text-xs text-gray-500 font-medium'>Past</div>
          )}

          {/* Enhanced booking information */}
          {isBooked && booking && (
            <div className='space-y-2'>
              {/* Booking position indicator */}
              {bookingPosition === 'start' && (
                <div className='flex items-center text-xs text-red-800 font-bold bg-red-200 px-2 py-1 rounded-md'>
                  <Calendar className='w-3 h-3 mr-1' />
                  START ({bookingDuration}d)
                </div>
              )}
              {bookingPosition === 'middle' && (
                <div className='flex items-center text-xs text-red-800 font-bold bg-red-200 px-2 py-1 rounded-md'>
                  <Clock className='w-3 h-3 mr-1' />
                  DAY {getBookingDayNumber(date, booking.startDate)}
                </div>
              )}
              {bookingPosition === 'end' && (
                <div className='flex items-center text-xs text-red-800 font-bold bg-red-200 px-2 py-1 rounded-md'>
                  <MapPin className='w-3 h-3 mr-1' />
                  END
                </div>
              )}
              {bookingPosition === 'single' && (
                <div className='flex items-center text-xs text-red-800 font-bold bg-red-200 px-2 py-1 rounded-md'>
                  <Calendar className='w-3 h-3 mr-1' />1 DAY
                </div>
              )}

              {/* Customer name (truncated for space) */}
              {booking.customerName && (
                <div className='flex items-center text-xs text-red-700 font-medium truncate'>
                  <User className='w-3 h-3 mr-1 flex-shrink-0' />
                  {booking.customerName.split(' ')[0]}
                </div>
              )}

              {/* Booking reference */}
              {booking.bookingReference && (
                <div className='flex items-center text-xs text-red-600 font-mono'>
                  <Hash className='w-3 h-3 mr-1 flex-shrink-0' />
                  {booking.bookingReference.slice(-4)}
                </div>
              )}
            </div>
          )}

          {/* Custom pricing indicator - blue dot */}
          {hasCustomPricing && !isBooked && !isPast && (
            <div className='absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-600 shadow-md border-2 border-white'></div>
          )}

          {/* Edit mode controls */}
          {pricing && editMode && !isBooked && !isPast && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await onClearCustomPrice(date);
              }}
              className='absolute top-1 left-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all hover:scale-110'
              title='Remove custom price'
            >
              ×
            </button>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className='bg-white rounded-2xl shadow-md border p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-6'>
          <h3 className='text-2xl font-bold text-gray-900'>
            Availability Calendar
          </h3>
          <button
            onClick={onToggleEditMode}
            className={`flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all shadow-sm ${
              editMode
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-200'
                : 'bg-white text-gray-700 border-2 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {editMode ? (
              <>
                <Check className='w-4 h-4 mr-2' />
                Done Editing
              </>
            ) : (
              <>
                <Edit className='w-4 h-4 mr-2' />
                Edit Prices
              </>
            )}
          </button>
          {editMode && (
            <div className='flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
              <span className='text-sm font-medium'>
                Click dates to set prices
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center bg-white rounded-xl shadow-sm border p-2'>
          <button
            onClick={() => onMonthNavigate('prev')}
            className='p-3 hover:bg-gray-50 rounded-lg transition-all'
          >
            <ChevronLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div className='px-6 py-3 text-lg font-bold text-gray-900 min-w-0'>
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <button
            onClick={() => onMonthNavigate('next')}
            className='p-3 hover:bg-gray-50 rounded-lg transition-all'
          >
            <ChevronRight className='w-5 h-5 text-gray-600' />
          </button>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className='flex items-center justify-center space-x-6 mb-6 bg-white p-4 rounded-xl shadow-sm border'>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-green-500 rounded-lg mr-2 shadow-sm'></div>
          <span className='text-sm font-semibold text-gray-700'>Available</span>
        </div>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-red-500 rounded-lg mr-2 shadow-sm'></div>
          <span className='text-sm font-semibold text-gray-700'>
            Booked Period
          </span>
        </div>
        <div className='flex items-center'>
          <Calendar className='w-4 h-4 mr-2 text-blue-600' />
          <span className='text-sm font-semibold text-gray-700'>
            Period Start/End
          </span>
        </div>
        <div className='flex items-center'>
          <div className='w-4 h-4 bg-gray-400 rounded-lg mr-2 shadow-sm'></div>
          <span className='text-sm font-semibold text-gray-700'>Past</span>
        </div>
        {editMode && (
          <div className='flex items-center'>
            <div className='w-4 h-4 bg-blue-500 rounded-lg mr-2 shadow-sm'></div>
            <span className='text-sm font-semibold text-gray-700'>
              Custom Price
            </span>
          </div>
        )}
      </div>

      {/* Clean Calendar Header */}
      <div className='grid grid-cols-7 gap-2 mb-4'>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className='p-4 text-center text-sm font-bold text-gray-700 bg-white rounded-xl shadow-sm border'
          >
            {day}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-2'>{renderCalendar()}</div>
    </div>
  );
}
