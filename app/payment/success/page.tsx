'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Calendar, MapPin, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      console.log('Payment success page loaded with session ID:', sessionId);

      if (!sessionId) {
        console.error('No session ID found in URL');
        setError('Invalid session');
        setLoading(false);
        return;
      }

      try {
        // Verify payment with Stripe and create booking
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          console.log('✅ Payment verified and booking created:', data.booking);
          setBookingData(data.booking);
          setLoading(false);
        } else {
          console.error('Payment verification failed:', data.error);
          setError(data.error || 'Failed to verify payment');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center p-4'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 text-gray-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Payment Verification Failed
          </h1>
          <p className='text-gray-600 mb-6'>{error}</p>
          <Link
            href='/'
            className='inline-block bg-green-800 hover:bg-green-900 text-white font-semibold py-3 px-8 rounded-xl transition-colors'
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      <div className='max-w-2xl w-full'>
        {/* Success Card */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
          {/* Header Section */}
          <div className='bg-white p-8 text-center border-b border-gray-200'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='h-12 w-12 text-green-600' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Payment Successful!
            </h1>
            <p className='text-gray-600 text-lg'>
              Your booking has been confirmed
            </p>
            {bookingData && (
              <div className='mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 inline-block'>
                <p className='text-sm text-green-800 font-medium'>
                  Booking Reference: <span className='font-bold text-lg'>{bookingData.bookingReference}</span>
                </p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className='p-8'>
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6'>
              <div className='flex items-start'>
                <Mail className='h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0' />
                <div>
                  <h3 className='font-semibold text-gray-900 mb-1'>
                    Confirmation Email Sent
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    We've sent a confirmation email with your booking details and receipt.
                    Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className='mb-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>
                What happens next?
              </h3>
              <div className='space-y-3'>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <span className='text-gray-700 text-xs font-bold'>1</span>
                  </div>
                  <p className='text-gray-600 text-sm'>
                    You'll receive a confirmation email with your booking reference and all details
                  </p>
                </div>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <span className='text-gray-700 text-xs font-bold'>2</span>
                  </div>
                  <p className='text-gray-600 text-sm'>
                    We'll send you a reminder 24 hours before your pickup time
                  </p>
                </div>
                <div className='flex items-start'>
                  <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                    <span className='text-gray-700 text-xs font-bold'>3</span>
                  </div>
                  <p className='text-gray-600 text-sm'>
                    Bring your booking confirmation and a valid driver's license to pick up your vehicle
                  </p>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6'>
              <div className='flex items-start'>
                <svg
                  className='h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
                <div>
                  <h4 className='font-semibold text-gray-900 mb-1'>
                    Important Reminder
                  </h4>
                  <p className='text-gray-600 text-sm'>
                    Please arrive at least 15 minutes before your scheduled pickup time.
                    You'll need a valid driver's license, credit card, and proof of insurance (if applicable).
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Link
                href='/my-bookings'
                className='bg-green-800 hover:bg-green-900 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center shadow-lg hover:shadow-xl flex items-center justify-center'
              >
                <Calendar className='h-5 w-5 mr-2' />
                View My Booking
              </Link>
              <Link
                href='/search'
                className='bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center'
              >
                <svg
                  className='h-5 w-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                  />
                </svg>
                Browse More Vehicles
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className='mt-6 text-center'>
          <p className='text-gray-600 text-sm'>
            Need help? Contact us at{' '}
            <a
              href='mailto:support@example.com'
              className='text-green-600 hover:text-green-700 font-medium'
            >
              support@example.com
            </a>
            {' '}or call{' '}
            <a
              href='tel:+385123456789'
              className='text-green-600 hover:text-green-700 font-medium'
            >
              +385 123 456 789
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-white flex items-center justify-center p-4'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 text-gray-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
