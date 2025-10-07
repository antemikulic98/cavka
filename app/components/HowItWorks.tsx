import React from 'react';
import { Search, Calendar, Key, Shield } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Select Vehicle',
      description:
        'Browse our premium fleet using advanced filters. Compare specifications, availability, and pricing across categories.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Reserve & Confirm',
      description:
        'Complete your reservation with flexible scheduling and transparent pricing. Instant confirmation and contract generation.',
      icon: Calendar,
    },
    {
      step: '03',
      title: 'Secure Pickup',
      description:
        'Present valid documentation at your chosen location. Complete vehicle inspection and receive access credentials.',
      icon: Key,
    },
    {
      step: '04',
      title: 'Professional Support',
      description:
        'Access 24/7 concierge support, roadside assistance, and fleet management services throughout your rental period.',
      icon: Shield,
    },
  ];

  return (
    <section className='py-20 bg-gray-50'>
      <div className='container mx-auto px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-light text-gray-900 mb-6'>
            Rental
            <span className='font-semibold text-blue-900 block'>Process</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
            Our streamlined four-step process ensures efficient vehicle
            acquisition with professional service standards and complete
            transparency.
          </p>
        </div>

        {/* Steps */}
        <div className='relative'>
          {/* Connection Line */}
          <div className='hidden lg:block absolute top-20 left-0 right-0 h-px bg-gray-300 z-0'></div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className='relative'>
                  {/* Step Card */}
                  <div className='bg-white rounded-sm shadow-sm border border-gray-200 p-8 relative z-10'>
                    {/* Step Number */}
                    <div className='absolute -top-4 left-8 bg-blue-900 text-white w-8 h-8 rounded-sm flex items-center justify-center font-semibold text-sm'>
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className='mb-6 mt-4'>
                      <IconComponent className='h-8 w-8 text-blue-900' />
                    </div>

                    {/* Title */}
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className='text-gray-600 text-sm leading-relaxed'>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className='mt-20'>
          <div className='bg-white rounded-sm p-12 shadow-sm border border-gray-200'>
            <div className='text-center'>
              <h3 className='text-2xl font-semibold text-gray-900 mb-4'>
                Ready to Begin Your Rental Process?
              </h3>
              <p className='text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
                Start your professional car rental experience today. Our team is
                ready to assist with vehicle selection and reservation
                management.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button className='bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
                  Start Reservation
                </button>
                <button className='border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
