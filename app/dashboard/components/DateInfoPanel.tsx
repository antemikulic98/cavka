'use client';

import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Hash,
  Euro,
  Car,
  Edit,
  Phone,
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
  customerEmail?: string;
  customerPhone?: string;
  totalAmount?: number;
}

interface DateInfoPanelProps {
  selectedDate: Date;
  dayPricing: DayPricing[];
  bookings: Booking[];
  vehicle: { dailyRate: number };
  editMode: boolean;
  onOpenPriceModal: (date: Date) => void;
  onClearCustomPrice: (date: Date) => void;
}

export default function DateInfoPanel({
  selectedDate,
  dayPricing,
  bookings,
  vehicle,
  editMode,
  onOpenPriceModal,
  onClearCustomPrice,
}: DateInfoPanelProps) {
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

  return (
    <div className='bg-white rounded-lg shadow-sm border p-6'>
      <h3 className='text-lg font-medium text-gray-900 mb-4'>
        Details for {selectedDate.toLocaleDateString()}
      </h3>
      {(() => {
        const isBooked = isDateBooked(selectedDate);
        const booking = getBookingForDate(selectedDate);

        if (isBooked && booking) {
          const startDate = new Date(
            booking.startDate.split('T')[0] + 'T00:00:00.000Z'
          );
          const endDate = new Date(
            booking.endDate.split('T')[0] + 'T00:00:00.000Z'
          );
          // Use stored rentalDays if available, otherwise calculate
          const diffDays =
            booking.rentalDays ||
            Math.floor(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

          // Determine which day of the booking this is
          const dayNumber = getBookingDayNumber(
            selectedDate,
            booking.startDate
          );
          const isStartDate =
            selectedDate.toISOString().split('T')[0] ===
            booking.startDate.split('T')[0];
          const isEndDate =
            selectedDate.toISOString().split('T')[0] ===
            booking.endDate.split('T')[0];

          return (
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center mb-4 pb-3 border-b border-gray-100'>
                <div className='w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3'>
                  {isStartDate ? (
                    <Car className='w-4 h-4 text-orange-600' />
                  ) : isEndDate ? (
                    <MapPin className='w-4 h-4 text-orange-600' />
                  ) : (
                    <Clock className='w-4 h-4 text-orange-600' />
                  )}
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    {isStartDate
                      ? 'Booking Starts Today'
                      : isEndDate
                      ? 'Booking Ends Today'
                      : `Day ${dayNumber} of Booking`}
                  </h4>
                  <p className='text-sm text-gray-500'>
                    {startDate.toLocaleDateString()} -{' '}
                    {endDate.toLocaleDateString()} ({diffDays} day
                    {diffDays > 1 ? 's' : ''})
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {booking.customerName && (
                    <div className='flex items-center space-x-3'>
                      <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                        <User className='w-3 h-3 text-blue-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                          Customer
                        </p>
                        <p className='text-sm font-medium text-gray-900'>
                          {booking.customerName}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.bookingReference && (
                    <div className='flex items-center space-x-3'>
                      <div className='w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0'>
                        <Hash className='w-3 h-3 text-purple-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                          Reference
                        </p>
                        <p className='text-sm font-medium text-gray-900 font-mono'>
                          {booking.bookingReference}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {booking.customerEmail && (
                    <div className='flex items-center space-x-3'>
                      <div className='w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'>
                        <span className='text-green-600 text-xs font-bold'>
                          @
                        </span>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                          Email
                        </p>
                        <p className='text-sm font-medium text-gray-900'>
                          {booking.customerEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.customerPhone && (
                    <div className='flex items-center space-x-3'>
                      <div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0'>
                        <Phone className='w-3 h-3 text-indigo-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                          Phone
                        </p>
                        <p className='text-sm font-medium text-gray-900'>
                          {booking.customerPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='pt-3 border-t border-gray-100'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2'>
                        <Calendar className='w-4 h-4 text-gray-600' />
                      </div>
                      <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Duration
                      </p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {diffDays} day{diffDays > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className='text-center'>
                      <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2'>
                        <MapPin className='w-4 h-4 text-gray-600' />
                      </div>
                      <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                        Progress
                      </p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {isStartDate
                          ? 'Start'
                          : isEndDate
                          ? 'End'
                          : `${dayNumber}/${diffDays}`}
                      </p>
                    </div>

                    {(booking.totalCost || booking.totalAmount) && (
                      <div className='text-center'>
                        <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2'>
                          <Euro className='w-4 h-4 text-gray-600' />
                        </div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                          Total
                        </p>
                        <p className='text-sm font-semibold text-gray-900'>
                          €{booking.totalCost || booking.totalAmount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {booking.createdAt && (
                  <div className='pt-3 border-t border-gray-100 text-center'>
                    <p className='text-xs text-gray-500'>
                      Booked on{' '}
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          return (
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center mb-4 pb-3 border-b border-gray-100'>
                <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    Vehicle Available
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Ready for booking on this date
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='text-center'>
                  <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3'>
                    <Euro className='w-6 h-6 text-gray-600' />
                  </div>
                  <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                    Daily Rate
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    €
                    {(() => {
                      const { price, pricing, type } =
                        getPriceForDate(selectedDate);
                      return price;
                    })()}
                  </p>
                  {(() => {
                    const { pricing } = getPriceForDate(selectedDate);
                    return (
                      pricing?.label && (
                        <p className='text-xs text-blue-600 font-medium mt-1'>
                          {pricing.label}
                        </p>
                      )
                    );
                  })()}
                </div>

                {editMode &&
                  !isDateBooked(selectedDate) &&
                  selectedDate >= new Date() && (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3'>
                      <div className='flex items-center'>
                        <Edit className='w-4 h-4 text-gray-600 mr-2' />
                        <p className='text-sm font-medium text-gray-900'>
                          Edit Price for {selectedDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <button
                          onClick={() => onOpenPriceModal(selectedDate)}
                          className='px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm'
                        >
                          Set Custom Price
                        </button>
                        {(() => {
                          const { pricing } = getPriceForDate(selectedDate);
                          return (
                            pricing && (
                              <button
                                onClick={() => onClearCustomPrice(selectedDate)}
                                className='px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-sm'
                              >
                                Remove Custom
                              </button>
                            )
                          );
                        })()}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
