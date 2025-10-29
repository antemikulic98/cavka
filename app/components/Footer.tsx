'use client';

import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Car,
} from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Services',
      links: [
        'Car Rental',
        'Transfer Services',
        'Airport Pickup',
        'Long-term Rental',
      ],
    },
    {
      title: 'Support',
      links: [
        '24/7 Support',
        'Help Center',
        'Contact Us',
        'FAQ',
      ],
    },
    {
      title: 'Company',
      links: [
        'About Us',
        'Our Fleet',
        'Locations',
        'Careers',
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
  ];

  const locations = [
    'Zagreb Downtown',
    'Zagreb Airport',
    'Split Downtown',
    'Split Airport',
    'Dubrovnik Airport',
    'Rijeka',
    'Zadar',
    'Pula',
  ];

  return (
    <footer className='bg-gradient-to-b from-gray-900 to-black text-white'>
      {/* Main Footer Content */}
      <div className='container mx-auto px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8'>
          {/* Company Info */}
          <div className='lg:col-span-2'>
            <div className='flex items-center mb-4'>
              <Car className='h-8 w-8 text-emerald-500 mr-3' />
              <h2 className='text-xl font-bold text-white'>Car Rental</h2>
            </div>

            <p className='text-gray-400 leading-relaxed mb-6 text-sm'>
              Premium car rental and transfer services across Croatia. Quality
              vehicles, professional service, competitive prices.
            </p>

            {/* Contact Info */}
            <div className='space-y-3'>
              <div className='flex items-center text-gray-400 text-sm hover:text-emerald-400 transition-colors'>
                <Phone className='h-4 w-4 mr-3' />
                <span>+385 1 234 5678</span>
              </div>
              <div className='flex items-center text-gray-400 text-sm hover:text-emerald-400 transition-colors'>
                <Mail className='h-4 w-4 mr-3' />
                <span>info@carrental.hr</span>
              </div>
              <div className='flex items-center text-gray-400 text-sm'>
                <MapPin className='h-4 w-4 mr-3' />
                <span>Zagreb, Croatia</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>
                {section.title}
              </h3>
              <ul className='space-y-2'>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href='#'
                      className='text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm'
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
        <div className='mt-10 pt-8 border-t border-gray-800'>
          <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>
            Our Locations
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
            {locations.map((location, index) => (
              <div
                key={index}
                className='text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm'
              >
                {location}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className='border-t border-gray-800 bg-black'>
        <div className='container mx-auto px-6 lg:px-8 py-6'>
          <div className='flex flex-col md:flex-row items-center justify-between'>
            {/* Copyright */}
            <div className='text-gray-500 text-xs mb-4 md:mb-0'>
              © 2024 Car Rental Services. All rights reserved.
            </div>

            {/* Social Links */}
            <div className='flex items-center space-x-4'>
              <span className='text-gray-500 text-xs mr-2'>Follow us:</span>
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    className='text-gray-500 hover:text-emerald-400 transition-colors duration-200'
                    title={social.name}
                  >
                    <IconComponent className='h-5 w-5' />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
