'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, X } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, lat: number | null, lng: number | null) => void;
  placeholder?: string;
  className?: string;
}

// Global script loader to avoid loading the script multiple times
let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (googleMapsLoaded) {
      resolve();
      return;
    }

    loadCallbacks.push(resolve);

    if (googleMapsLoading) return;
    googleMapsLoading = true;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address',
  className = '',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript().then(() => setIsReady(true));
  }, []);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'hr' },
      fields: ['formatted_address', 'geometry', 'name'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const displayName = place.name && place.formatted_address?.includes(place.name)
          ? place.formatted_address
          : place.name
            ? `${place.name}, ${place.formatted_address}`
            : place.formatted_address || '';
        onChange(
          displayName,
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
      }
    });

    autocompleteRef.current = autocomplete;
  }, [onChange]);

  useEffect(() => {
    if (isReady) {
      initAutocomplete();
    }
  }, [isReady, initAutocomplete]);

  const handleClear = () => {
    onChange('', null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10'>
        <MapPin className='h-5 w-5 text-green-600' />
      </div>
      <input
        ref={inputRef}
        type='text'
        defaultValue={value}
        placeholder={placeholder}
        className='w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-green-800 text-gray-900 text-sm font-medium shadow-sm hover:border-gray-300 transition-all duration-200 bg-white'
        onChange={(e) => {
          // When user types manually (before selecting from autocomplete), clear coords
          onChange(e.target.value, null, null);
        }}
      />
      {value && (
        <button
          type='button'
          onClick={handleClear}
          className='absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors z-20'
        >
          <X className='h-4 w-4 text-gray-400 hover:text-red-500' />
        </button>
      )}
    </div>
  );
}
