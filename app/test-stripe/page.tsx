'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function TestStripePage() {
  const [sessionId, setSessionId] = useState('');

  const testSuccessPage = () => {
    if (sessionId) {
      window.location.href = `/payment/success?session_id=${sessionId}`;
    } else {
      alert('Please enter a session ID from your console logs');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle className='h-8 w-8 text-blue-600' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Test Stripe Redirect
          </h1>
          <p className='text-gray-600'>
            Use this page to test if your success page is working
          </p>
        </div>

        <div className='space-y-6'>
          <div className='bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6'>
            <h3 className='font-semibold text-yellow-900 mb-3'>
              📋 Instructions:
            </h3>
            <ol className='space-y-2 text-sm text-yellow-800'>
              <li className='flex items-start'>
                <span className='font-bold mr-2'>1.</span>
                <span>Complete a test payment on Stripe checkout</span>
              </li>
              <li className='flex items-start'>
                <span className='font-bold mr-2'>2.</span>
                <span>Check your terminal/console for the log that says "Stripe session created"</span>
              </li>
              <li className='flex items-start'>
                <span className='font-bold mr-2'>3.</span>
                <span>Copy the <code className='bg-yellow-100 px-1 rounded'>sessionId</code> value (starts with cs_test_...)</span>
              </li>
              <li className='flex items-start'>
                <span className='font-bold mr-2'>4.</span>
                <span>Paste it below and click "Test Success Page"</span>
              </li>
            </ol>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Paste Session ID:
            </label>
            <input
              type='text'
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder='cs_test_a1toZCyA4crxCbvmKf...'
              className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm'
            />
          </div>

          <button
            onClick={testSuccessPage}
            className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center'
          >
            Test Success Page
            <ArrowRight className='h-5 w-5 ml-2' />
          </button>

          <div className='bg-blue-50 border-2 border-blue-200 rounded-xl p-6'>
            <h3 className='font-semibold text-blue-900 mb-3'>
              💡 What happens in Stripe Test Mode:
            </h3>
            <ul className='space-y-2 text-sm text-blue-800'>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>After payment succeeds, you'll see a green checkmark ✅</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>Look for a <strong>"← Return to merchant"</strong> button at the TOP LEFT of the Stripe page</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>Click that button to return to your website</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>In <strong>production mode</strong> (live keys), redirect happens automatically!</span>
              </li>
            </ul>
          </div>

          <div className='bg-gray-50 border-2 border-gray-200 rounded-xl p-6'>
            <h3 className='font-semibold text-gray-900 mb-3'>
              🔧 Stripe Dashboard Check:
            </h3>
            <p className='text-sm text-gray-700 mb-3'>
              Make sure your Stripe settings are configured correctly:
            </p>
            <a
              href='https://dashboard.stripe.com/test/settings/checkout'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm'
            >
              Open Stripe Checkout Settings
              <ArrowRight className='h-4 w-4 ml-1' />
            </a>
            <p className='text-xs text-gray-600 mt-2'>
              Under "After payment", ensure it's set to "Redirect to your success page"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
