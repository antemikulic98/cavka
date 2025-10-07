import React from 'react';
import { Car, Zap, Shield, Smartphone, Award, Globe } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Car,
      title: 'Premium Fleet',
      description:
        'Curated collection of luxury vehicles from leading manufacturers, maintained to the highest industry standards.',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description:
        'Streamlined digital reservation system with real-time availability and immediate confirmation.',
    },
    {
      icon: Shield,
      title: 'Comprehensive Coverage',
      description:
        'Full insurance protection included with every rental, providing complete peace of mind.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Platform',
      description:
        'Advanced mobile application for booking management, vehicle access, and customer support.',
    },
    {
      icon: Award,
      title: 'Premium Service',
      description:
        'White-glove service experience with dedicated account management and concierge support.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description:
        'International coverage across 25+ strategic locations in major business centers worldwide.',
    },
  ];

  return (
    <section className='py-20 bg-gray-50'>
      <div className='container mx-auto px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-light text-gray-900 mb-6'>
            Why Choose
            <span className='font-semibold text-blue-900 block'>
              Professional Car Rental
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
            We deliver exceptional mobility solutions through industry-leading
            technology, premium vehicles, and uncompromising service standards.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className='bg-white p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200'
              >
                {/* Icon */}
                <div className='mb-6'>
                  <IconComponent className='h-8 w-8 text-blue-900' />
                </div>

                {/* Title */}
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className='text-gray-600 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className='text-center mt-16 bg-white p-12 rounded-sm shadow-sm border border-gray-200'>
          <h3 className='text-2xl font-semibold text-gray-900 mb-4'>
            Ready to Experience Professional Car Rental?
          </h3>
          <p className='text-gray-600 mb-8 max-w-2xl mx-auto'>
            Join thousands of business professionals who trust our premium
            mobility solutions for their transportation needs.
          </p>
          <button className='bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
