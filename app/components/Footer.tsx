'use client';

import React from 'react';
import { Phone, Mail, MapPin, Instagram, Cookie } from 'lucide-react';
import Image from 'next/image';
import Cookies from 'js-cookie';

export default function Footer() {
  const quickLinks = [
    { name: 'Car Rental', href: '/search?vehicleType=car' },
    { name: 'Transfer Services', href: '/search?vehicleType=transfers' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/hit_rentacar?igsh=dWh4NzUwdzljODZl' },
  ];

  const handleCookieSettings = () => {
    // Remove cookie consent to trigger banner
    Cookies.remove('cookie-consent');
    // Reload page to show banner
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <footer className='bg-gradient-to-b from-gray-900 to-black text-white'>
      {/* Main Footer Content */}
      <div className='container mx-auto px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Company Info */}
          <div>
            <div className='mb-4'>
              <a
                href='/'
                className='inline-block'
                aria-label='Hit Rent Croatia - Home'
              >
                <Image
                  src='/img/logo.svg'
                  alt='Hit Rent Croatia Logo - Premium Car Rental Service'
                  width={150}
                  height={50}
                  className='h-12 w-auto'
                  priority
                />
              </a>
            </div>

            <p className='text-gray-400 leading-relaxed mb-6 text-sm'>
              Hit Rent - Your trusted family-owned car rental and transfer service across
              Croatia. Premium vehicles, personal service, competitive
              prices. Proudly serving Zagreb, Split, Dubrovnik and all major Croatian
              destinations.
            </p>

            {/* Contact Info */}
            <div className='space-y-3'>
              <a
                href='tel:+385917224138'
                className='flex items-center text-gray-400 text-sm hover:text-emerald-400 transition-colors'
              >
                <Phone className='h-4 w-4 mr-3' />
                <span>+385 91 722 4138</span>
              </a>
              <a
                href='mailto:info@hit-rent.com'
                className='flex items-center text-gray-400 text-sm hover:text-emerald-400 transition-colors'
              >
                <Mail className='h-4 w-4 mr-3' />
                <span>info@hit-rent.com</span>
              </a>
              <div className='flex items-center text-gray-400 text-sm'>
                <MapPin className='h-4 w-4 mr-3' />
                <span>Zagreb, Split, Dubrovnik, Croatia</span>
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
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='text-center md:text-left text-gray-500 text-xs'>
              © {new Date().getFullYear()} Hit Rent Croatia. All rights reserved. | Premium Car Rental Service
            </div>
            <button
              onClick={handleCookieSettings}
              className='flex items-center gap-2 text-gray-400 hover:text-green-400 text-xs transition-colors duration-200'
            >
              <Cookie className='h-4 w-4' />
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
