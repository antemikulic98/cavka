import React from 'react';
import { Star, User } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      company: 'TechForward Solutions',
      rating: 5,
      text: 'Professional car rental service exceeded expectations. The BMW 5 Series was maintained to exceptional standards, with seamless pickup procedures ideal for executive travel.',
      location: 'New York, NY',
      initials: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Operations Director',
      company: 'Global Consulting Group',
      rating: 5,
      text: 'Outstanding fleet management and customer service. The Tesla Model S provided reliable transportation with advanced features perfectly suited for business requirements.',
      location: 'San Francisco, CA',
      initials: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      company: 'Brand Dynamics',
      rating: 5,
      text: 'Premium SUV rental for corporate event transportation. Professional service standards and vehicle quality exceeded client expectations. Highly recommended for business use.',
      location: 'Miami, FL',
      initials: 'ER',
    },
    {
      name: 'David Thompson',
      role: 'Managing Partner',
      company: 'Thompson & Associates',
      rating: 5,
      text: 'Executive vehicle rental service met stringent requirements for client meetings. The Mercedes E-Class provided appropriate professional image and reliability.',
      location: 'Los Angeles, CA',
      initials: 'DT',
    },
    {
      name: 'Lisa Wang',
      role: 'Event Coordinator',
      company: 'Premium Events Ltd.',
      rating: 5,
      text: 'Luxury vehicle coordination for high-profile corporate events. Professional staff and immaculate fleet quality ensured successful client satisfaction.',
      location: 'Chicago, IL',
      initials: 'LW',
    },
    {
      name: 'James Wilson',
      role: 'Creative Director',
      company: 'Wilson Media Group',
      rating: 5,
      text: 'Specialized vehicle requirements for commercial production work. The Audi Q7 provided necessary space and reliability for equipment transportation needs.',
      location: 'Seattle, WA',
      initials: 'JW',
    },
  ];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-blue-900 fill-blue-900' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-light text-gray-900 mb-6'>
            Client
            <span className='font-semibold text-blue-900 block'>
              Testimonials
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
            Trusted by business professionals and corporate clients across major
            metropolitan areas. Here's what our clients say about our
            professional car rental services.
          </p>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 py-12 border-t border-b border-gray-200'>
          <div className='text-center'>
            <div className='text-3xl font-semibold text-gray-900 mb-2'>
              4.9/5
            </div>
            <div className='text-gray-600 text-sm uppercase tracking-wider'>
              Client Rating
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-semibold text-gray-900 mb-2'>
              50,000+
            </div>
            <div className='text-gray-600 text-sm uppercase tracking-wider'>
              Professional Clients
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-semibold text-gray-900 mb-2'>98%</div>
            <div className='text-gray-600 text-sm uppercase tracking-wider'>
              Retention Rate
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-semibold text-gray-900 mb-2'>
              24/7
            </div>
            <div className='text-gray-600 text-sm uppercase tracking-wider'>
              Concierge Support
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className='bg-gray-50 rounded-sm p-8 border border-gray-200 hover:shadow-sm transition-shadow duration-200'
            >
              {/* Rating */}
              <div className='flex items-center mb-4'>
                {renderStars(testimonial.rating)}
              </div>

              {/* Testimonial Text */}
              <p className='text-gray-600 mb-6 leading-relaxed text-sm'>
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className='flex items-center'>
                {/* Avatar */}
                <div className='w-12 h-12 rounded-sm bg-blue-900 flex items-center justify-center text-white font-semibold mr-4'>
                  {testimonial.initials}
                </div>

                {/* Details */}
                <div>
                  <div className='font-semibold text-gray-900 text-sm'>
                    {testimonial.name}
                  </div>
                  <div className='text-xs text-gray-600'>
                    {testimonial.role}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='mt-20'>
          <div className='bg-gray-50 rounded-sm p-12 border border-gray-200'>
            <div className='text-center'>
              <h3 className='text-2xl font-semibold text-gray-900 mb-4'>
                Join Our Professional Network
              </h3>
              <p className='text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
                Experience professional car rental services trusted by leading
                businesses and executives. Contact us to discuss your corporate
                transportation needs.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button className='bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
                  Get Corporate Quote
                </button>
                <button className='border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium py-3 px-8 rounded-sm transition-colors duration-200'>
                  View Case Studies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
