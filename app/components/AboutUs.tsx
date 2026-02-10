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
              About <span className='text-green-800'>Us</span>
            </h2>
            <div className='w-24 h-1 bg-green-800 mx-auto rounded-full'></div>
          </div>

          {/* Main Content */}
          <div className='bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100'>
            <div className='prose prose-lg max-w-none'>
              <p className='text-gray-700 leading-relaxed mb-6'>
                <span className='text-2xl font-bold text-green-800'>Family Rent a Car</span> is a family-owned car rental company built on trust, quality, and personal service. We are proud to serve travelers exploring the beautiful country of Croatia with reliable vehicles and genuine hospitality.
              </p>

              <p className='text-gray-700 leading-relaxed mb-6'>
                From the very beginning, our vision has been clear: <strong>quality over quantity</strong>. Instead of maintaining massive fleets, we carefully select modern, well-maintained vehicles to ensure safety, comfort, and reliability for every journey. Each car in our collection is chosen with our customers in mind.
              </p>

              <p className='text-gray-700 leading-relaxed mb-6'>
                What truly sets us apart is our <strong>personal, family-oriented approach</strong>. We believe every guest is unique, which is why we treat each customer as part of our extended family. We take the time to understand your needs and tailor our service accordingly. Whether you need advice on routes, flexibility with pickup times, or special arrangements, we are always here to help.
              </p>

              <p className='text-gray-700 leading-relaxed mb-6'>
                At <strong className='text-green-800'>Family Rent a Car</strong>, you are not just another reservation number—<strong className='text-green-800'>you are family</strong>. Our goal is to make your car rental experience simple, stress-free, and enjoyable, so you can focus on what truly matters: creating unforgettable memories exploring Croatia.
              </p>

              <p className='text-gray-700 leading-relaxed text-center text-lg font-medium mt-8'>
                We look forward to welcoming you to our Family and being a part of your Croatian adventure.
              </p>
            </div>
          </div>

          {/* Value Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'>
            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Users className='h-7 w-7 text-green-800' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Family Owned</h3>
              <p className='text-center text-sm text-gray-600'>Built by three brothers with shared values</p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Star className='h-7 w-7 text-green-800' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Quality First</h3>
              <p className='text-center text-sm text-gray-600'>Modern, well-maintained vehicles</p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Heart className='h-7 w-7 text-green-800' />
              </div>
              <h3 className='text-center font-semibold text-gray-900 mb-2'>Personal Touch</h3>
              <p className='text-center text-sm text-gray-600'>Individual approach to every guest</p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow'>
              <div className='bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto'>
                <Shield className='h-7 w-7 text-green-800' />
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
