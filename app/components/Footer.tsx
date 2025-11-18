'use client';

import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
} from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const quickLinks = [
    { name: 'Car Rental', href: '/search?vehicleType=car' },
    { name: 'Transfer Services', href: '/search?vehicleType=transfers' },
    { name: 'Contact Us', href: '#' },
    { name: 'About Us', href: '#' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
  ];

  return (
    <footer className='bg-gradient-to-b from-gray-900 to-black text-white'>
      {/* Main Footer Content */}
      <div className='container mx-auto px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Company Info */}
          <div>
            <div className='mb-4'>
              <a href='/' className='inline-block'>
                <Image
                  src='/img/logo.svg'
                  alt='Logo'
                  width={150}
                  height={50}
                  className='h-12 w-auto'
                />
              </a>
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

          {/* Quick Links */}
          <div>
            <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>
              Quick Links
            </h3>
            <ul className='space-y-2'>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className='text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm'
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Follow */}
          <div>
            <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>
              Follow Us
            </h3>
            <div className='flex items-center space-x-4 mb-6'>
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    className='text-gray-400 hover:text-emerald-400 transition-colors duration-200'
                    title={social.name}
                  >
                    <IconComponent className='h-6 w-6' />
                  </a>
                );
              })}
            </div>
            <p className='text-gray-400 text-sm'>
              Stay connected for the latest offers and updates.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className='border-t border-gray-800 bg-black'>
        <div className='container mx-auto px-6 lg:px-8 py-6'>
          <div className='text-center text-gray-500 text-xs'>
            © 2024 Car Rental Services. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
