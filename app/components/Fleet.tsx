import React from 'react';
import { Car, Users, Zap, Battery } from 'lucide-react';

export default function Fleet() {
  const carCategories = [
    {
      name: 'Executive Sedans',
      description: 'Premium business-class vehicles for corporate travel',
      features: [
        'Leather Interior',
        'Advanced Safety Systems',
        'Hybrid Technology',
      ],
      price: 'From $129/day',
      icon: Car,
      popular: false,
      vehicles: 'BMW 5 Series, Mercedes E-Class, Audi A6',
    },
    {
      name: 'Luxury SUVs',
      description: 'Spacious premium vehicles for team travel and events',
      features: ['8-Seat Capacity', 'All-Wheel Drive', 'Premium Audio'],
      price: 'From $189/day',
      icon: Users,
      popular: true,
      vehicles: 'BMW X7, Mercedes GLS, Audi Q8',
    },
    {
      name: 'Performance Vehicles',
      description: 'High-performance cars for executive clients',
      features: ['Sport Package', 'Premium Interior', 'Advanced Handling'],
      price: 'From $349/day',
      icon: Zap,
      popular: false,
      vehicles: 'BMW M5, Mercedes AMG, Audi RS6',
    },
    {
      name: 'Electric Fleet',
      description: 'Sustainable luxury vehicles with zero emissions',
      features: ['Zero Emissions', 'Long Range Battery', 'Silent Operation'],
      price: 'From $159/day',
      icon: Battery,
      popular: false,
      vehicles: 'Tesla Model S, BMW iX, Mercedes EQS',
    },
  ];

  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-light text-gray-900 mb-6'>
            Vehicle
            <span className='font-semibold text-blue-900 block'>
              Categories
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
            Our premium fleet features carefully selected vehicles from
            industry-leading manufacturers, maintained to exceptional standards.
          </p>
        </div>

        {/* Fleet Categories */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {carCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className='relative'>
                {/* Popular Badge */}
                {category.popular && (
                  <div className='absolute -top-3 right-4 z-10'>
                    <span className='bg-blue-900 text-white px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wider'>
                      Popular
                    </span>
                  </div>
                )}

                <div
                  className={`bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 p-8 h-full border ${
                    category.popular
                      ? 'border-blue-200 ring-1 ring-blue-100'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <div className='mb-6'>
                    <IconComponent className='h-10 w-10 text-blue-900' />
                  </div>

                  {/* Category Name */}
                  <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className='text-gray-600 mb-4 text-sm leading-relaxed'>
                    {category.description}
                  </p>

                  {/* Vehicle Examples */}
                  <p className='text-xs text-gray-500 mb-6 leading-relaxed'>
                    {category.vehicles}
                  </p>

                  {/* Features */}
                  <div className='mb-6'>
                    <ul className='space-y-2'>
                      {category.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className='flex items-center text-xs text-gray-600'
                        >
                          <span className='w-1.5 h-1.5 bg-blue-900 rounded-full mr-3 flex-shrink-0'></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price */}
                  <div className='mb-6'>
                    <span className='text-2xl font-semibold text-gray-900'>
                      {category.price}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-sm font-medium transition-colors duration-200 ${
                      category.popular
                        ? 'bg-blue-900 hover:bg-blue-800 text-white'
                        : 'border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className='mt-20 bg-gray-50 p-12 rounded-sm border border-gray-200'>
          <div className='text-center'>
            <h3 className='text-2xl font-semibold text-gray-900 mb-4'>
              Custom Fleet Solutions
            </h3>
            <p className='text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
              Need specialized vehicles or have specific requirements? Our fleet
              management team can arrange custom solutions for corporate clients
              and special events.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
                Contact Fleet Manager
              </button>
              <button className='border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
                View All Vehicles
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
