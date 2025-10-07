'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  className = '',
  required = false,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    const handleScroll = () => {
      // Close dropdown on page scroll
      if (isOpen) {
        setIsOpen(false);
        setSearchTerm('');
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

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(
            highlightedIndex < filteredOptions.length - 1
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
              : filteredOptions.length - 1
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm('');
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
        <span className='block truncate font-medium'>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
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
          {/* Search Input */}
          {searchable && (
            <div className='p-3 border-b border-gray-100'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  ref={searchInputRef}
                  type='text'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  className='w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-500'
                  placeholder='Search options...'
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className='max-h-60 overflow-y-auto'>
            {filteredOptions.length === 0 ? (
              <div className='px-4 py-3 text-sm text-gray-500 text-center'>
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
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
                    <span className='truncate'>{option.label}</span>
                    {selectedOption?.value === option.value && (
                      <Check className='h-4 w-4 text-emerald-600' />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
