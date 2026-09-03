'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, X } from 'lucide-react';

export interface LocationSuggestion {
  name: string;
  lat: number | null;
  lng: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, lat: number | null, lng: number | null) => void;
  placeholder?: string;
  className?: string;
  // Our own locations from the DB, shown as a dropdown when Google Places
  // is unavailable (missing key, blocked key, script failure)
  fallbackSuggestions?: LocationSuggestion[];
  // Lets the parent close its own overlays (calendar, time dropdowns) that
  // would otherwise cover the suggestion list
  onFocus?: () => void;
}

// Global script loader to avoid loading the script multiple times
let googleMapsLoaded = false;
let googleMapsLoading = false;
let googleMapsFailed = false;
// Which address input the user was last typing in — several instances exist
// on a page, and only this one may reclaim focus after Google blurs it
let lastFocusedAddressInput: HTMLInputElement | null = null;
const loadCallbacks: (() => void)[] = [];
const failCallbacks: (() => void)[] = [];

function notifyFailure() {
  googleMapsFailed = true;
  failCallbacks.forEach((cb) => cb());
  failCallbacks.length = 0;
}

// Fire one cheap prediction request to find out whether the key actually
// works — Google only reports auth failures after the first request
let placesProbeStarted = false;
function probePlacesAvailability() {
  if (placesProbeStarted || googleMapsFailed) return;
  if (!window.google?.maps?.places?.AutocompleteService) return;
  placesProbeStarted = true;
  try {
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: 'Split', componentRestrictions: { country: 'hr' } },
      (_predictions, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED ||
          status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR
        ) {
          notifyFailure();
        }
      }
    );
  } catch {
    notifyFailure();
  }
}

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
      notifyFailure();
      return;
    }

    // Google calls this global when the key is invalid or the needed APIs
    // are not enabled (e.g. ApiTargetBlockedMapError)
    (window as any).gm_authFailure = () => {
      console.error('Google Maps authentication failed — check API key restrictions');
      notifyFailure();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => notifyFailure();
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address',
  className = '',
  fallbackSuggestions = [],
  onFocus,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [placesFailed, setPlacesFailed] = useState(googleMapsFailed);
  const [showFallback, setShowFallback] = useState(false);
  const [text, setText] = useState(value);
  const [osmResults, setOsmResults] = useState<LocationSuggestion[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);

  useEffect(() => {
    if (googleMapsFailed) {
      setPlacesFailed(true);
      return;
    }
    failCallbacks.push(() => {
      setPlacesFailed(true);
      // Google reports auth failures only after the first typed request —
      // if the user is already in the field, open our fallback right away
      if (document.activeElement === inputRef.current) {
        setShowFallback(true);
      }
    });
    loadGoogleMapsScript().then(() => setIsReady(true));
  }, []);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places?.Autocomplete || autocompleteRef.current) return;

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
        setText(displayName);
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

  // When Google Places is down, search addresses through our own geocoding
  // endpoint (OpenStreetMap) so users can still enter any Croatian address
  useEffect(() => {
    if (!placesFailed) return;
    const query = text.trim();
    if (query.length < 3) {
      setOsmResults([]);
      setOsmLoading(false);
      return;
    }
    setOsmLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setOsmResults(data.success ? data.results : []);
        setOsmLoading(false);
      } catch {
        // request was aborted by newer input or failed — keep previous list
        if (!controller.signal.aborted) setOsmLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, placesFailed]);

  // On auth failure Google disables the input and swaps the placeholder for
  // "Oops! Something went wrong." — undo that so our fallback stays usable
  useEffect(() => {
    if (!placesFailed || !inputRef.current) return;
    const input = inputRef.current;

    // Block Google from disabling the input via the property — a disabled
    // input blurs, and mid-typing keystrokes would fall through to the page
    Object.defineProperty(input, 'disabled', {
      configurable: true,
      get: () => false,
      set: () => {},
    });

    const restore = () => {
      if (input.hasAttribute('disabled')) {
        input.removeAttribute('disabled');
        // Give focus back only to the field the user was actually typing in
        if (
          document.activeElement === document.body &&
          lastFocusedAddressInput === input
        ) {
          input.focus();
        }
      }
      if (input.placeholder !== placeholder) input.placeholder = placeholder;
      if (input.style.backgroundImage !== 'none') {
        input.style.backgroundImage = 'none';
      }
    };
    restore();
    const observer = new MutationObserver(restore);
    observer.observe(input, {
      attributes: true,
      attributeFilter: ['disabled', 'placeholder', 'style'],
    });
    return () => observer.disconnect();
  }, [placesFailed, placeholder]);

  // Close the fallback dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowFallback(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setText('');
    onChange('', null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleFallbackSelect = (suggestion: LocationSuggestion) => {
    setText(suggestion.name);
    if (inputRef.current) {
      inputRef.current.value = suggestion.name;
    }
    onChange(suggestion.name, suggestion.lat, suggestion.lng);
    setShowFallback(false);
  };

  const useFallback = placesFailed;
  const dbMatches = useFallback
    ? fallbackSuggestions.filter((s) =>
        s.name.toLowerCase().includes(text.trim().toLowerCase())
      )
    : [];
  // Own locations first (they can have fixed trip prices), then OSM addresses
  const filteredSuggestions = [
    ...dbMatches,
    ...osmResults.filter((o) => !dbMatches.some((d) => d.name === o.name)),
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10'>
        <MapPin className='h-5 w-5 text-green-600' />
      </div>
      <input
        ref={inputRef}
        type='text'
        defaultValue={value}
        placeholder={placeholder}
        className='w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-green-800 text-gray-900 text-sm font-medium shadow-sm hover:border-gray-300 transition-all duration-200 bg-white'
        onFocus={() => {
          lastFocusedAddressInput = inputRef.current;
          probePlacesAvailability();
          setShowFallback(true);
          onFocus?.();
        }}
        onChange={(e) => {
          setText(e.target.value);
          setShowFallback(true);
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

      {/* Fallback dropdown with our own locations when Google Places is unavailable */}
      {useFallback && showFallback && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50'>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.name}
                type='button'
                onClick={() => handleFallbackSelect(suggestion)}
                className='w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-800 transition-colors duration-150 text-sm font-medium flex items-center first:rounded-t-xl last:rounded-b-xl'
              >
                <MapPin className='h-4 w-4 text-green-600 mr-2 flex-shrink-0' />
                {suggestion.name}
              </button>
            ))
          ) : osmLoading ? (
            <p className='px-4 py-3 text-sm text-gray-500'>
              Searching addresses…
            </p>
          ) : text.trim().length >= 3 ? (
            <p className='px-4 py-3 text-sm text-gray-500'>
              No results found — try adding the city name
            </p>
          ) : (
            <p className='px-4 py-3 text-sm text-gray-500'>
              Keep typing to search addresses…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
