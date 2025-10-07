'use client';

import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ChevronUp,
} from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Services',
      links: [
        'Executive Car Rental',
        'Corporate Fleet',
        'Long-term Contracts',
        'Chauffeur Services',
        'Airport Transportation',
        'Event Transportation',
      ],
    },
    {
      title: 'Support',
      links: [
        '24/7 Concierge Support',
        'Help Center',
        'Contact Sales',
        'Roadside Assistance',
        'Insurance Services',
        'Documentation',
      ],
    },
    {
      title: 'Company',
      links: [
        'About Us',
        'Fleet Overview',
        'Career Opportunities',
        'Press Center',
        'Partnership Program',
        'Investor Relations',
      ],
    },
    {
      title: 'Legal',
      links: [
        'Terms of Service',
        'Privacy Policy',
        'Data Protection',
        'Rental Agreement',
        'Cancellation Terms',
        'Insurance Policy',
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'LinkedIn', icon: Linkedin, url: '#' },
    { name: 'YouTube', icon: Youtube, url: '#' },
  ];

  const locations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Miami, FL',
    'San Francisco, CA',
    'Boston, MA',
  ];

  return (
    <footer className='bg-gray-900 text-white'>
      {/* Main Footer Content */}
      <div className='container mx-auto px-6 lg:px-8 py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-6 gap-8'>
          {/* Company Info */}
          <div className='lg:col-span-2'>
            <div className='mb-6'>
              <h2 className='text-2xl font-semibold text-white'>
                Professional Car Rental
              </h2>
              <p className='text-gray-400 mt-2 text-sm'>
                Executive Transportation Solutions
              </p>
            </div>

            <p className='text-gray-300 leading-relaxed mb-6 text-sm'>
              Leading provider of premium vehicle rental services for business
              professionals, corporate clients, and executive transportation
              needs across major metropolitan areas.
            </p>

            {/* Contact Info */}
            <div className='space-y-3'>
              <div className='flex items-center text-gray-300 text-sm'>
                <Phone className='h-4 w-4 mr-3' />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className='flex items-center text-gray-300 text-sm'>
                <Mail className='h-4 w-4 mr-3' />
                <span>info@professionalcarrental.com</span>
              </div>
              <div className='flex items-center text-gray-300 text-sm'>
                <MapPin className='h-4 w-4 mr-3' />
                <span>123 Executive Plaza, Business District, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className='lg:col-span-1'>
              <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>
                {section.title}
              </h3>
              <ul className='space-y-2'>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href='#'
                      className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Service Areas */}
        <div className='mt-12 pt-8 border-t border-gray-800'>
          <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>
            Service Areas
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            {locations.map((location, index) => (
              <a
                key={index}
                href='#'
                className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'
              >
                {location}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className='mt-12 pt-8 border-t border-gray-800'>
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between'>
            <div className='mb-6 lg:mb-0'>
              <h3 className='font-semibold text-white mb-2 text-sm uppercase tracking-wider'>
                Business Updates
              </h3>
              <p className='text-gray-400 text-sm'>
                Receive corporate rates and fleet management updates.
              </p>
            </div>

            <div className='flex w-full lg:w-auto max-w-md'>
              <input
                type='email'
                placeholder='Corporate email address'
                className='flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-sm focus:outline-none focus:border-gray-600 text-white placeholder-gray-500 text-sm'
              />
              <button className='bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-r-sm transition-colors duration-200 font-medium text-sm'>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className='border-t border-gray-800'>
        <div className='container mx-auto px-6 lg:px-8 py-6'>
          <div className='flex flex-col md:flex-row items-center justify-between'>
            {/* Copyright */}
            <div className='text-gray-400 text-xs mb-4 md:mb-0'>
              © 2024 Professional Car Rental Services. All rights reserved.
              Licensed transportation provider.
            </div>

            {/* Social Links */}
            <div className='flex items-center space-x-3'>
              <span className='text-gray-400 text-xs mr-2'>Connect:</span>
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    className='text-gray-400 hover:text-white transition-colors duration-200'
                    title={social.name}
                  >
                    <IconComponent className='h-4 w-4' />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className='fixed bottom-8 right-8 bg-blue-900 hover:bg-blue-800 text-white w-10 h-10 rounded-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 z-50'
      >
        <ChevronUp className='h-5 w-5' />
      </button>
    </footer>
  );
}
