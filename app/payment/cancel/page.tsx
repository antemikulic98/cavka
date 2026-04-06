'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');

  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      <div className='max-w-2xl w-full'>
        {/* Cancel Card */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
          {/* Header Section */}
          <div className='bg-white p-8 text-center border-b border-gray-200'>
            <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='h-12 w-12 text-gray-600' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Payment Cancelled
            </h1>
            <p className='text-gray-600 text-lg'>
              Your booking was not completed
            </p>
          </div>

          {/* Details Section */}
          <div className='p-8'>
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6'>
              <h3 className='font-semibold text-gray-900 mb-3'>
                What happened?
              </h3>
              <p className='text-gray-600 text-sm mb-3'>
                You cancelled the payment process before completing your booking.
                No charges have been made to your card.
              </p>
              <p className='text-gray-600 text-sm'>
                Don't worry! Your vehicle selection is still available and you can
                complete your booking whenever you're ready.
              </p>
            </div>

            {/* Why Pay Now Benefits */}
            <div className='mb-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>
                Why pay now and save?
              </h3>
              <div className='space-y-3'>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <svg
                      className='h-3.5 w-3.5 text-gray-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='font-medium text-gray-900 mb-1 text-sm'>
                      Save up to 15% instantly
                    </p>
                    <p className='text-gray-600 text-sm'>
                      Get an immediate discount on your total rental cost
                    </p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <svg
                      className='h-3.5 w-3.5 text-gray-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='font-medium text-gray-900 mb-1 text-sm'>
                      Secure your reservation
                    </p>
                    <p className='text-gray-600 text-sm'>
                      Lock in your price and guarantee vehicle availability
                    </p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <svg
                      className='h-3.5 w-3.5 text-gray-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='font-medium text-gray-900 mb-1 text-sm'>
                      Faster pickup process
                    </p>
                    <p className='text-gray-600 text-sm'>
                      Skip the payment counter and get on the road quicker
                    </p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <CreditCard className='h-3.5 w-3.5 text-gray-600' />
                  </div>
                  <div>
                    <p className='font-medium text-gray-900 mb-1 text-sm'>
                      Secure payment
                    </p>
                    <p className='text-gray-600 text-sm'>
                      Protected by Stripe, the world's most trusted payment platform
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Link
                href={vehicleId ? `/search?vehicleId=${vehicleId}&expandSearch=true` : '/search'}
                className='bg-green-800 hover:bg-green-900 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center shadow-lg hover:shadow-xl flex items-center justify-center'
              >
                <ArrowLeft className='h-5 w-5 mr-2' />
                Complete Your Booking
              </Link>
              <Link
                href='/'
                className='bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center border-2 border-gray-300 hover:border-gray-400'
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className='mt-6 text-center'>
          <p className='text-gray-600 text-sm'>
            Having trouble with payment?{' '}
            <a
              href='mailto:booking@hit-rent.com'
              className='text-green-600 hover:text-green-700 font-medium'
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-white flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}
