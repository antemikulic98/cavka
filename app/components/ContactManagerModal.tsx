'use client';

import { useState } from 'react';
import { X, Phone, Send, Mail } from 'lucide-react';

interface ContactManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactManagerModal({
  isOpen,
  onClose,
}: ContactManagerModalProps) {
  const [carModel, setCarModel] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate sending
    setTimeout(() => {
      alert('Message sent! We will contact you soon.');
      setSending(false);
      setCarModel('');
      setMessage('');
      onClose();
    }, 1000);
  };

  const handleCall = () => {
    window.location.href = 'tel:+385917224138';
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        {/* Backdrop with blur */}
        <div
          className='fixed inset-0 backdrop-blur-md transition-opacity'
          onClick={onClose}
        />

        {/* Center trick */}
        <span
          className='hidden sm:inline-block sm:align-middle sm:h-screen'
          aria-hidden='true'
        >
          &#8203;
        </span>

        {/* Modal */}
        <div className='relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full'>
          <div className='bg-gradient-to-br from-emerald-50 to-white px-6 pt-6 pb-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-2xl font-bold text-gray-900'>
                Contact Fleet Manager
              </h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <X className='h-6 w-6' />
              </button>
            </div>
            <p className='text-sm text-gray-600'>
              Get in touch with our team for inquiries
            </p>
          </div>

          <div className='px-6 pb-6'>
            {/* Quick Call Option */}
            <div className='mb-6'>
              <button
                onClick={handleCall}
                className='w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              >
                <Phone className='h-5 w-5 mr-3' />
                Call Manager Now
              </button>
              <p className='text-center text-xs text-gray-500 mt-2'>
                +385 91 722 4138
              </p>
            </div>

            {/* Divider */}
            <div className='relative mb-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-200'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 bg-white text-gray-500'>or send a message</span>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Car Model (Optional)
                </label>
                <input
                  type='text'
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder='e.g. BMW 5 Series'
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder='Tell us what you need...'
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 resize-none'
                />
              </div>

              <button
                type='submit'
                disabled={sending}
                className='w-full flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {sending ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='h-5 w-5 mr-2' />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
