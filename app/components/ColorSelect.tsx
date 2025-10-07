'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

interface ColorSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const COLOR_OPTIONS: ColorOption[] = [
  { value: 'White', label: 'White', hex: '#FFFFFF' },
  { value: 'Black', label: 'Black', hex: '#000000' },
  { value: 'Silver', label: 'Silver', hex: '#C0C0C0' },
  { value: 'Gray', label: 'Gray', hex: '#808080' },
  { value: 'Red', label: 'Red', hex: '#DC2626' },
  { value: 'Blue', label: 'Blue', hex: '#2563EB' },
  { value: 'Green', label: 'Green', hex: '#059669' },
  { value: 'Yellow', label: 'Yellow', hex: '#FACC15' },
  { value: 'Orange', label: 'Orange', hex: '#EA580C' },
  { value: 'Brown', label: 'Brown', hex: '#92400E' },
  { value: 'Gold', label: 'Gold', hex: '#D97706' },
  { value: 'Purple', label: 'Purple', hex: '#7C3AED' },
  { value: 'Pink', label: 'Pink', hex: '#EC4899' },
  { value: 'Beige', label: 'Beige', hex: '#D4BF8E' },
  { value: 'Maroon', label: 'Maroon', hex: '#7F1D1D' },
];

export default function ColorSelect({
  value,
  onChange,
  placeholder = 'Select Color',
  className = '',
  required = false,
  disabled = false,
}: ColorSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = COLOR_OPTIONS.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    const handleScroll = () => {
      // Close dropdown on page scroll
      if (isOpen) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0) {
          onChange(COLOR_OPTIONS[highlightedIndex].value);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(
            highlightedIndex < COLOR_OPTIONS.length - 1
              ? highlightedIndex + 1
              : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(
            highlightedIndex > 0
              ? highlightedIndex - 1
              : COLOR_OPTIONS.length - 1
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (isOpen) {
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Select Button */}
      <button
        type='button'
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={`
          relative w-full px-4 py-3 text-left bg-white border-2 rounded-xl shadow-sm
          transition-all duration-200 ease-out
          ${
            disabled
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : isOpen
              ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-lg'
              : required && !selectedOption
              ? 'border-red-300 hover:border-red-400 hover:shadow-md'
              : 'border-gray-300 hover:border-emerald-400 hover:shadow-md'
          }
          ${!selectedOption && !disabled ? 'text-gray-500' : 'text-gray-900'}
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
        `}
        disabled={disabled}
      >
        <div className='flex items-center'>
          {selectedOption && (
            <div
              className='w-5 h-5 rounded-full mr-3 border-2 border-gray-200 shadow-sm'
              style={{ backgroundColor: selectedOption.hex }}
            />
          )}
          <span className='block truncate font-medium'>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            } ${disabled ? 'text-gray-300' : 'text-gray-600'}`}
          />
        </span>
      </button>

      {/* Required indicator */}
      {required && !selectedOption && (
        <div className='absolute top-2 right-2 flex items-center'>
          <div className='w-1.5 h-1.5 bg-red-500 rounded-full'></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className='absolute z-[70] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden'>
          <div className='max-h-60 overflow-y-auto'>
            {COLOR_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                type='button'
                onClick={() => handleOptionClick(option.value)}
                className={`
                  w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150
                  ${
                    highlightedIndex === index ||
                    selectedOption?.value === option.value
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-gray-900 hover:bg-gray-50'
                  }
                  ${
                    selectedOption?.value === option.value
                      ? 'font-semibold'
                      : ''
                  }
                `}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div
                      className='w-5 h-5 rounded-full mr-3 border-2 border-gray-200 shadow-sm'
                      style={{ backgroundColor: option.hex }}
                    />
                    <span className='truncate'>{option.label}</span>
                  </div>
                  {selectedOption?.value === option.value && (
                    <Check className='h-4 w-4 text-emerald-600' />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
