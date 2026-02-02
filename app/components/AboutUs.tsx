import React from 'react';
import { Users, Heart, Star, Shield } from 'lucide-react';

export default function AboutUs() {
  return (
    <section className='py-20 bg-gradient-to-b from-white to-gray-50'>
      <div className='container mx-auto px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              About <span className='text-emerald-600'>Us</span>
            </h2>
            <div className='w-24 h-1 bg-emerald-600 mx-auto rounded-full'></div>
          </div>

          {/* Main Content */}
          <div className='bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100'>
            <div className='prose prose-lg max-w-none'>
              <p className='text-gray-700 leading-relaxed mb-6'>
                <span className='text-2xl font-bold text-emerald-600'>HIT Rent a Car</span> is a small, family-owned car rental company built on trust, quality, and personal service. Our name, <strong>HIT</strong>, carries a special meaning—it represents the first letters of three brothers who founded the company: <strong className='text-emerald-700'>Hrvoje, Ivan, and Toni</strong>.
              </p>

              <p className='text-gray-700 leading-relaxed mb-6'>
                From the very beginning, our vision has been clear: <strong>quality over quantity</strong>. Instead of focusing on large fleets, we carefully select modern, well-maintained vehicles to ensure safety, comfort, and reliability for every journey.
              </p>

              <p className='text-gray-700 leading-relaxed mb-6'>
                What truly sets us apart is our <strong>personal approach</strong>. We believe every guest is different, which is why we treat each customer individually, taking the time to understand their needs and tailor our service accordingly. Whether you need advice, flexibility, or special arrangements, we are always here to help.
              </p>

              <p className='text-gray-700 leading-relaxed mb-6'>
                At HIT Rent a Car, you are not just another reservation number—<strong className='text-emerald-700'>you are our guest</strong>. Our goal is to make your experience simple, stress-free, and enjoyable, so you can focus on what truly matters: enjoying your trip.
              </p>

              <p className='text-gray-700 leading-relaxed text-center text-lg font-medium mt-8'>
                We look forward to welcoming you and being a part of your journey.
              </p>
            </div>
          </div>

          {/* Value Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'>
            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Users className='h-7 w-7 text-emerald-600' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Family Owned</h3>
              <p className='text-center text-sm text-gray-600'>Built by three brothers with shared values</p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Star className='h-7 w-7 text-emerald-600' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Quality First</h3>
              <p className='text-center text-sm text-gray-600'>Modern, well-maintained vehicles</p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Heart className='h-7 w-7 text-emerald-600' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Personal Touch</h3>
              <p className='text-center text-sm text-gray-600'>Individual approach to every guest</p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Shield className='h-7 w-7 text-emerald-600' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Trust & Safety</h3>
              <p className='text-center text-sm text-gray-600'>Reliable service you can count on</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
