'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Users,
  Settings,
  Car,
  MapPin,
  Calendar,
  Info,
  ChevronDown,
} from 'lucide-react';

interface Vehicle {
  _id: string;
  fullName: string;
  make: string;
  model: string;
  year: number;
  category: string;
  passengerCapacity: number;
  transmission: string;
  fuelAirCon?: string;
  fuelType?: string;
  dailyRate: number;
  currency: string;
  status: string;
  location: string;
  features: string[];
  mainImage?: string;
  images: string[];
  description?: string;
  bigSuitcases?: number;
  doorCount?: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  rentalDays: number;
  totalPrice: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  vehicle,
  pickupDate,
  returnDate,
  pickupLocation,
  rentalDays,
  totalPrice,
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [addOns, setAddOns] = useState({
    additionalDriver: false,
    wifiHotspot: false,
    roadsideAssistance: false,
    tireProtection: false,
    personalAccident: false,
    theftProtection: false,
    extendedTheft: false,
    interiorProtection: false,
  });
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [cdwCoverage, setCdwCoverage] = useState<'basic' | 'full'>('basic');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+385',
    phoneNumber: '',
    ageConfirmed: false,
    company: '',
    flightNumber: '',
    promoCode: '',
  });

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  if (!isOpen || !vehicle) return null;

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1); // Reset to step 1 when closing
    setSelectedDetail(null); // Clear any open details
    setCdwCoverage('basic'); // Reset CDW to basic
    setShowCountryDropdown(false); // Close country dropdown
    setClientInfo({
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+385',
      phoneNumber: '',
      ageConfirmed: false,
      company: '',
      flightNumber: '',
      promoCode: '',
    });
    onClose();
  };

  const toggleAddOn = (addOnKey: keyof typeof addOns) => {
    setAddOns((prev) => ({
      ...prev,
      [addOnKey]: !prev[addOnKey],
    }));
  };

  const getAddOnDetails = () => {
    return {
      additionalDriver: {
        name: 'Additional driver',
        price: 4.75,
        unit: '/day & driver',
        description:
          'Allow an additional person to drive your rental car. The additional driver must meet the same age and license requirements as the primary driver and must be present at the time of rental with a valid driving license.',
      },
      wifiHotspot: {
        name: 'WiFi Hotspot',
        price: 4.6,
        unit: '/day',
        description:
          'Stay connected on the go with unlimited WiFi access for up to 10 devices. Perfect for business trips, navigation, and entertainment during your journey.',
      },
      roadsideAssistance: {
        name: 'Roadside Assistance',
        price: 1.2,
        unit: '/day',
        description:
          '24/7 roadside assistance including battery jump-start, flat tire service, lockout assistance, and emergency fuel delivery. Get help whenever and wherever you need it.',
      },
      tireProtection: {
        name: 'Tire and Windshield Protection',
        price: 1.99,
        unit: '/day',
        description:
          'Protection against tire damage and windshield chips or cracks. Covers repair or replacement costs for damage that occurs during your rental period.',
      },
      personalAccident: {
        name: 'Personal Accident Protection',
        price: 2.39,
        unit: '/day',
        description:
          'Provides accident medical expense coverage and accidental death & dismemberment benefits for the driver and passengers while operating or riding in the rental vehicle.',
      },
      theftProtection: {
        name: 'Theft Protection',
        price: 5.99,
        unit: '/day',
        description:
          'Reduces your financial responsibility in case of vehicle theft. With this protection, your maximum liability is limited to €825.00 instead of the full vehicle value.',
      },
      extendedTheft: {
        name: 'Extended Theft Protection',
        price: 10.95,
        unit: '/day',
        description:
          'Enhanced theft protection with maximum financial responsibility of only €200.00. Provides peace of mind with minimal out-of-pocket costs in case of vehicle theft.',
      },
      interiorProtection: {
        name: 'Interior Protection',
        price: 2.1,
        unit: '/day',
        description:
          'Covers interior damage including stains, tears, or burns to seats, carpets, and other interior surfaces. Protects against costly cleaning or repair fees.',
      },
    };
  };

  const getSelectedAddOns = () => {
    const addOnDetails = getAddOnDetails();

    return Object.entries(addOns)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => ({
        key,
        ...addOnDetails[key as keyof typeof addOnDetails],
      }));
  };

  const calculateAddOnsTotal = () => {
    return getSelectedAddOns().reduce((total, addon) => total + addon.price, 0);
  };

  const getCdwCost = () => {
    return cdwCoverage === 'full' ? 15 : 0;
  };

  const getTotalDailyRate = () => {
    const baseCost = vehicle.dailyRate + getCdwCost();
    const addOnsCost = currentStep >= 3 ? calculateAddOnsTotal() : 0;
    return baseCost + addOnsCost;
  };

  const updateClientInfo = (field: string, value: string | boolean) => {
    setClientInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      clientInfo.firstName.trim() !== '' &&
      clientInfo.lastName.trim() !== '' &&
      clientInfo.email.trim() !== '' &&
      clientInfo.phoneNumber.trim() !== '' &&
      clientInfo.ageConfirmed &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)
    );
  };

  const countries = [
    { code: '+385', name: 'Croatia', flag: '🇭🇷' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
    { code: '+381', name: 'Serbia', flag: '🇷🇸' },
    { code: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  ];

  const getSelectedCountry = () => {
    return (
      countries.find((country) => country.code === clientInfo.countryCode) ||
      countries[0]
    );
  };

  const handleBookingCompletion = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsBookingLoading(true);

    try {
      const bookingData = {
        clientInfo,
        vehicleId: vehicle._id,
        pickupDate,
        returnDate,
        pickupLocation,
        rentalDays,
        cdwCoverage,
        addOns,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle conflict errors with detailed information
        if (response.status === 409 && errorData.conflicts) {
          const conflictList = errorData.conflicts
            .map((c: any) => `• ${c.dates} - Booking ${c.bookingReference}`)
            .join('\n');
          throw new Error(
            `Vehicle Not Available\n\n${errorData.message}\n\nConflicting bookings:\n${conflictList}\n\nPlease select different dates.`
          );
        }

        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();

      if (result.success) {
        // Show success message with booking reference
        alert(
          `🎉 Booking completed successfully!\n\nYour booking reference: ${result.booking.bookingReference}\n\nYou will receive a confirmation email shortly.`
        );

        // Reset form and close modal
        handleClose();
      } else {
        throw new Error('Booking creation failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(
        `❌ ${
          error instanceof Error ? error.message : 'Failed to complete booking'
        }`
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      M: 'Mini',
      E: 'Economy',
      C: 'Compact',
      I: 'Intermediate',
      S: 'Standard',
      F: 'Fullsize',
      P: 'Premium',
      L: 'Luxury',
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (rate: number, currency: string) => {
    const symbol =
      currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    const wholePart = Math.floor(rate);
    const centsPart = Math.round((rate - wholePart) * 100);

    return {
      symbol,
      whole: wholePart,
      cents: centsPart,
      hasDecimals: centsPart > 0,
    };
  };

  const price = formatPrice(getTotalDailyRate(), vehicle.currency);

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <>
          {/* Stay Flexible */}
          <div className='border border-gray-200 rounded-xl p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold text-gray-900'>Stay flexible</h3>
              <div className='flex items-center'>
                <span className='text-green-600 font-medium mr-2'>
                  Included
                </span>
                <Info className='h-4 w-4 text-gray-400' />
              </div>
            </div>
            <p className='text-sm text-gray-600'>
              Pay at pick-up, free cancellation and rebooking any time before
              pick-up time
            </p>
          </div>

          {/* Mileage */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-3'>Mileage</h3>
            <div className='border border-green-200 rounded-xl p-4 bg-green-50'>
              <div className='flex items-center justify-between'>
                <div>
                  <span className='font-bold text-green-800 text-lg'>
                    Unlimited km
                  </span>
                  <p className='text-sm text-green-600'>
                    Perfect for longer trips
                  </p>
                </div>
                <span className='bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold'>
                  Included
                </span>
              </div>
            </div>
          </div>
        </>
      );
    } else if (currentStep === 2) {
      return (
        <>
          {/* CDW Description */}
          <div className='mb-6'>
            <h3 className='font-semibold text-gray-900 mb-3'>
              Collision Damage Waiver CDW
            </h3>
            <p className='text-sm text-gray-600 leading-relaxed'>
              Hit the road worry-free, knowing you are protected from high costs
              in case your vehicle is damaged. Instead of paying up to the full
              vehicle value, you'd only need to cover the deductible amount
              specified.
            </p>
          </div>

          {/* CDW Options */}
          <div className='space-y-3'>
            {/* Basic CDW */}
            <div
              onClick={() => setCdwCoverage('basic')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                cdwCoverage === 'basic'
                  ? 'border-gray-400 bg-gray-100'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center'>
                  <div
                    className={`w-4 h-4 border-2 rounded-full mr-3 bg-white flex items-center justify-center ${
                      cdwCoverage === 'basic'
                        ? 'border-gray-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {cdwCoverage === 'basic' && (
                      <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
                    )}
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>
                      Basic Coverage
                    </h4>
                    <p className='text-xs text-gray-500'>€2,500 deductible</p>
                  </div>
                </div>
                <span className='bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold'>
                  Included
                </span>
              </div>
              <p className='text-sm text-gray-600 ml-7'>
                Standard protection with moderate deductible amount
              </p>
            </div>

            {/* Premium Full Coverage */}
            <div
              onClick={() => setCdwCoverage('full')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                cdwCoverage === 'full'
                  ? 'border-green-500 bg-green-100'
                  : 'border-green-300 bg-green-50 hover:bg-green-100'
              }`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center'>
                  <div
                    className={`w-4 h-4 border-2 rounded-full mr-3 bg-white flex items-center justify-center ${
                      cdwCoverage === 'full'
                        ? 'border-green-600'
                        : 'border-green-500'
                    }`}
                  >
                    {cdwCoverage === 'full' && (
                      <div className='w-2 h-2 bg-green-600 rounded-full'></div>
                    )}
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900'>Full Coverage</h4>
                    <p className='text-xs text-green-600'>€0 deductible</p>
                  </div>
                </div>
                <span className='bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold'>
                  +€15/day
                </span>
              </div>
              <p className='text-sm text-gray-600 ml-7'>
                Maximum protection with no deductible - drive worry-free
              </p>
            </div>
          </div>
        </>
      );
    } else if (currentStep === 3) {
      return (
        <div className='space-y-3'>
          {/* Additional Driver */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <Users className='h-5 w-5 text-gray-600 mr-3' />
              <div>
                <h4 className='font-medium text-gray-900'>Additional driver</h4>
                <p className='text-sm text-gray-600'>€4.75 / day & driver</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'additionalDriver'
                      ? null
                      : 'additionalDriver'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.additionalDriver}
                  onChange={() => toggleAddOn('additionalDriver')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Additional Driver Details */}
          {selectedDetail === 'additionalDriver' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().additionalDriver.description}
              </p>
            </div>
          )}

          {/* WiFi Hotspot */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <svg
                className='h-5 w-5 text-gray-600 mr-3'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm-1 16v-2h2v2h-2zm0-4v-2c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3z' />
              </svg>
              <div>
                <h4 className='font-medium text-gray-900'>WiFi Hotspot</h4>
                <p className='text-sm text-gray-600'>€4.60 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'wifiHotspot' ? null : 'wifiHotspot'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.wifiHotspot}
                  onChange={() => toggleAddOn('wifiHotspot')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* WiFi Hotspot Details */}
          {selectedDetail === 'wifiHotspot' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().wifiHotspot.description}
              </p>
            </div>
          )}

          {/* Roadside Assistance */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <Car className='h-5 w-5 text-gray-600 mr-3' />
              <div>
                <h4 className='font-medium text-gray-900'>
                  Roadside Assistance
                </h4>
                <p className='text-sm text-gray-600'>€1.20 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'roadsideAssistance'
                      ? null
                      : 'roadsideAssistance'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.roadsideAssistance}
                  onChange={() => toggleAddOn('roadsideAssistance')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Roadside Assistance Details */}
          {selectedDetail === 'roadsideAssistance' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().roadsideAssistance.description}
              </p>
            </div>
          )}

          {/* Tire and Windshield Protection */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <svg
                className='h-5 w-5 text-gray-600 mr-3'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
              </svg>
              <div>
                <h4 className='font-medium text-gray-900'>
                  Tire and Windshield Protection
                </h4>
                <p className='text-sm text-gray-600'>€1.99 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'tireProtection'
                      ? null
                      : 'tireProtection'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.tireProtection}
                  onChange={() => toggleAddOn('tireProtection')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Tire Protection Details */}
          {selectedDetail === 'tireProtection' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().tireProtection.description}
              </p>
            </div>
          )}

          {/* Personal Accident Protection */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <svg
                className='h-5 w-5 text-gray-600 mr-3'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
              </svg>
              <div>
                <h4 className='font-medium text-gray-900'>
                  Personal Accident Protection
                </h4>
                <p className='text-sm text-gray-600'>€2.39 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'personalAccident'
                      ? null
                      : 'personalAccident'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.personalAccident}
                  onChange={() => toggleAddOn('personalAccident')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Personal Accident Details */}
          {selectedDetail === 'personalAccident' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().personalAccident.description}
              </p>
            </div>
          )}

          {/* Theft Protection */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <svg
                className='h-5 w-5 text-gray-600 mr-3'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' />
              </svg>
              <div>
                <h4 className='font-medium text-gray-900'>Theft Protection</h4>
                <p className='text-sm text-gray-600'>
                  €825.00 (approx. €973.89) financial responsibility
                </p>
                <p className='text-sm text-gray-600'>€5.99 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'theftProtection'
                      ? null
                      : 'theftProtection'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.theftProtection}
                  onChange={() => toggleAddOn('theftProtection')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Theft Protection Details */}
          {selectedDetail === 'theftProtection' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().theftProtection.description}
              </p>
            </div>
          )}

          {/* Extended Theft Protection */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <svg
                className='h-5 w-5 text-gray-600 mr-3'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' />
              </svg>
              <div>
                <h4 className='font-medium text-gray-900'>
                  Extended Theft Protection
                </h4>
                <p className='text-sm text-gray-600'>
                  €200.00 (approx. €236.10) financial responsibility
                </p>
                <p className='text-sm text-gray-600'>€10.95 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'extendedTheft' ? null : 'extendedTheft'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.extendedTheft}
                  onChange={() => toggleAddOn('extendedTheft')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Extended Theft Details */}
          {selectedDetail === 'extendedTheft' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().extendedTheft.description}
              </p>
            </div>
          )}

          {/* Interior Protection */}
          <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'>
            <div className='flex items-center'>
              <svg
                className='h-5 w-5 text-gray-600 mr-3'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H9V7H7v10h2v-2h8v2h2V7z' />
              </svg>
              <div>
                <h4 className='font-medium text-gray-900'>
                  Interior Protection
                </h4>
                <p className='text-sm text-gray-600'>€2.10 / day</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  setSelectedDetail(
                    selectedDetail === 'interiorProtection'
                      ? null
                      : 'interiorProtection'
                  )
                }
                className='text-sm text-gray-500 hover:text-gray-700 hover:underline'
              >
                Details
              </button>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={addOns.interiorProtection}
                  onChange={() => toggleAddOn('interiorProtection')}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600'></div>
              </label>
            </div>
          </div>

          {/* Interior Protection Details */}
          {selectedDetail === 'interiorProtection' && (
            <div className='mx-4 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>
                {getAddOnDetails().interiorProtection.description}
              </p>
            </div>
          )}
        </div>
      );
    } else if (currentStep === 4) {
      return (
        <div className='max-w-2xl mx-auto space-y-8'>
          {/* Client Information Header */}
          <div className='text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100'>
            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
              Almost There! ✨
            </h3>
            <p className='text-gray-600 leading-relaxed'>
              Just a few details to complete your rental booking
            </p>
          </div>

          {/* Required Information Card */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <div className='flex items-center mb-6'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4'>
                <span className='text-red-600 text-xl font-bold'>*</span>
              </div>
              <h4 className='text-lg font-semibold text-gray-900'>
                Required Information
              </h4>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* First Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  First Name
                </label>
                <input
                  type='text'
                  value={clientInfo.firstName}
                  onChange={(e) =>
                    updateClientInfo('firstName', e.target.value)
                  }
                  className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                  placeholder='Your first name'
                />
              </div>

              {/* Last Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Last Name
                </label>
                <input
                  type='text'
                  value={clientInfo.lastName}
                  onChange={(e) => updateClientInfo('lastName', e.target.value)}
                  className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                  placeholder='Your last name'
                />
              </div>

              {/* Email */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={clientInfo.email}
                  onChange={(e) => updateClientInfo('email', e.target.value)}
                  className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                  placeholder='your.email@example.com'
                />
              </div>

              {/* Phone Number */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Phone Number
                </label>
                <div className='flex space-x-3'>
                  {/* Custom Country Selector */}
                  <div className='relative' ref={countryDropdownRef}>
                    <button
                      type='button'
                      onClick={() =>
                        setShowCountryDropdown(!showCountryDropdown)
                      }
                      className='px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 font-medium min-w-[160px] flex items-center justify-between hover:bg-gray-100'
                    >
                      <div className='flex items-center space-x-2'>
                        <span className='text-xl'>
                          {getSelectedCountry().flag}
                        </span>
                        <span className='text-sm font-medium'>
                          {getSelectedCountry().code}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                          showCountryDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {showCountryDropdown && (
                      <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto'>
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type='button'
                            onClick={() => {
                              updateClientInfo('countryCode', country.code);
                              setShowCountryDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3 ${
                              country.code === clientInfo.countryCode
                                ? 'bg-green-50 text-green-800'
                                : 'text-gray-900'
                            }`}
                          >
                            <span className='text-xl'>{country.flag}</span>
                            <span className='text-sm font-medium'>
                              {country.code}
                            </span>
                            <span className='text-sm text-gray-600 truncate'>
                              {country.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type='tel'
                    value={clientInfo.phoneNumber}
                    onChange={(e) =>
                      updateClientInfo('phoneNumber', e.target.value)
                    }
                    className='flex-1 px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                    placeholder='Your phone number'
                  />
                </div>
              </div>
            </div>

            {/* Age Confirmation */}
            <div className='mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl'>
              <div className='flex items-center space-x-4'>
                <input
                  type='checkbox'
                  id='ageConfirmed'
                  checked={clientInfo.ageConfirmed}
                  onChange={(e) =>
                    updateClientInfo('ageConfirmed', e.target.checked)
                  }
                  className='w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500'
                />
                <label
                  htmlFor='ageConfirmed'
                  className='text-sm font-semibold text-gray-900 cursor-pointer'
                >
                  I confirm that I am older than 22 years
                </label>
              </div>
            </div>
          </div>

          {/* Optional Information Card */}
          <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <div className='flex items-center mb-6'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-blue-600 text-sm font-bold'>?</span>
              </div>
              <h4 className='text-lg font-semibold text-gray-900'>
                Optional Information
              </h4>
              <span className='ml-2 text-sm text-gray-500'>
                (helps us serve you better)
              </span>
            </div>

            <div className='space-y-6'>
              {/* Company */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Company Name
                </label>
                <p className='text-xs text-gray-500 mb-2'>
                  Only if booking for business purposes
                </p>
                <input
                  type='text'
                  value={clientInfo.company}
                  onChange={(e) => updateClientInfo('company', e.target.value)}
                  className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                  placeholder='Your company name'
                />
              </div>

              {/* Flight Number */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Flight Number
                </label>
                <p className='text-xs text-gray-500 mb-2'>
                  Helps us coordinate your pickup time
                </p>
                <input
                  type='text'
                  value={clientInfo.flightNumber}
                  onChange={(e) =>
                    updateClientInfo('flightNumber', e.target.value)
                  }
                  className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                  placeholder='e.g., LH1234, BA567'
                />
              </div>

              {/* Promo Code */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Promo Code
                </label>
                <p className='text-xs text-gray-500 mb-2'>
                  Have a special discount code?
                </p>
                <input
                  type='text'
                  value={clientInfo.promoCode}
                  onChange={(e) =>
                    updateClientInfo('promoCode', e.target.value)
                  }
                  className='w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 font-medium placeholder-gray-500'
                  placeholder='Enter your promo code'
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4'>
      <div className='bg-white rounded-none sm:rounded-2xl w-full h-full sm:max-w-5xl sm:h-[600px] overflow-hidden shadow-2xl'>
        <div className='flex flex-col sm:flex-row h-full'>
          {/* Left Side - Car Image as Full Background */}
          <div className='flex-1 relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-300 min-h-[40vh] sm:min-h-0'>
            {/* Car Image - Full Background */}
            {vehicle.mainImage ? (
              <div className='absolute inset-0'>
                <img
                  src={vehicle.mainImage}
                  alt={vehicle.fullName}
                  className='w-full h-full object-cover'
                />
                {/* Dark overlay for text readability */}
                <div className='absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/50'></div>
              </div>
            ) : (
              <div className='absolute inset-0 flex items-center justify-center'>
                <Car className='h-64 w-64 text-white/30' />
              </div>
            )}

            {/* Car Name - Top Left */}
            <div className='absolute top-8 left-8 text-white z-10'>
              <h1 className='text-3xl font-bold mb-1'>
                {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()}
                <span className='font-normal text-lg ml-2'>or similar</span>
              </h1>
              <p className='text-lg opacity-90'>
                {getCategoryDisplayName(vehicle.category)}{' '}
                {vehicle.transmission}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className='absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200 z-10'
            >
              <X className='h-6 w-6' />
            </button>

            {/* Car Features - Bottom */}
            <div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent'>
              <div className='flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-white mb-4'>
                <div className='flex items-center'>
                  <Users className='h-4 w-4 mr-2 text-white' />
                  <span className='text-sm font-medium'>
                    {vehicle.passengerCapacity} Seats
                  </span>
                </div>
                <div className='flex items-center'>
                  <svg
                    className='h-4 w-4 mr-2 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M9.5 1C8.11 1 7 2.11 7 3.5V5H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3V3.5C17 2.11 15.89 1 14.5 1h-5zM9.5 3h5c.28 0 .5.22.5.5V5H9V3.5c0-.28.22-.5.5-.5zM6 12h12v2H6v-2z' />
                  </svg>
                  <span className='text-sm font-medium'>
                    {vehicle.bigSuitcases || 1} Suitcase(s)
                  </span>
                </div>
                <div className='flex items-center'>
                  <svg
                    className='h-4 w-4 mr-2 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M20 8v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2h2c1.1 0 2 .9 2 2zM10 4v2h4V4h-4zm8 4H6v12h12V8z' />
                  </svg>
                  <span className='text-sm font-medium'>1 Bag(s)</span>
                </div>
                <div className='flex items-center'>
                  <svg
                    className='h-4 w-4 mr-2 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97L2.46 14.6c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z' />
                  </svg>
                  <span className='text-sm font-medium'>
                    {vehicle.transmission === 'A' ||
                    vehicle.transmission === 'Automatic'
                      ? 'Automatic'
                      : vehicle.transmission === 'M' ||
                        vehicle.transmission === 'Manual'
                      ? 'Manual'
                      : vehicle.transmission}
                  </span>
                </div>
                <div className='flex items-center'>
                  <svg
                    className='h-4 w-4 mr-2 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M19 4h-4L7.11 5.87C6.24 6.04 5 6.53 5 8.5V19c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2M7 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5M19 12H7V8.5c0-.17.03-.33.08-.49L13 7h6v5z' />
                  </svg>
                  <span className='text-sm font-medium'>
                    {vehicle.doorCount || 4} Doors
                  </span>
                </div>
              </div>
              <div className='flex justify-center'>
                <div className='flex items-center'>
                  <svg
                    className='h-4 w-4 mr-2 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h1c.55 0 1 .45 1 1s-.45 1-1 1H7c-.55 0-1-.45-1-1s.45-1 1-1zm4 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0h-3c-.55 0-1-.45-1-1s.45-1 1-1h3c.55 0 1 .45 1 1s-.45 1-1 1zm0 3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0 3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z' />
                  </svg>
                  <span className='text-sm font-medium text-white'>
                    Minimum age of the youngest driver: 21
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Options */}
          <div className='flex-1 flex flex-col bg-white overflow-y-auto'>
            {/* Header */}
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  {currentStep === 1
                    ? 'Booking options'
                    : currentStep === 2
                    ? 'Coverage options'
                    : currentStep === 3
                    ? 'Additional services'
                    : 'Your information'}
                </h2>
                <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                  Step {currentStep} of 4
                </span>
              </div>
              {currentStep !== 3 && (
                <div className='flex items-center text-sm text-gray-600'>
                  <Calendar className='h-4 w-4 mr-2' />
                  <span>
                    {formatDate(pickupDate)} - {formatDate(returnDate)}
                  </span>
                  <span className='mx-2'>•</span>
                  <span>
                    {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
            </div>

            {/* Booking Options */}
            <div className='flex-1 p-6 space-y-4'>{renderStepContent()}</div>

            {/* Bottom Section - Price & Button */}
            <div className='p-6 border-t border-gray-200 bg-gray-50'>
              <div className='mb-6'>
                <div className='flex items-baseline justify-between'>
                  <div className='flex items-baseline'>
                    <span className='text-lg text-gray-800 font-medium'>
                      {price.symbol}
                    </span>
                    <span className='text-4xl font-bold text-gray-900'>
                      {price.whole}
                    </span>
                    {price.hasDecimals && (
                      <span className='text-2xl font-bold text-gray-900'>
                        .{price.cents.toString().padStart(2, '0')}
                      </span>
                    )}
                    <span className='text-lg text-gray-600 ml-2'>/day</span>
                  </div>
                  <div>
                    <span className='text-xl font-bold text-gray-800'>
                      €{(getTotalDailyRate() * rentalDays).toFixed(2)} total
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                {/* Back Button for Step 2 and 3 */}
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors duration-200'
                  >
                    Back
                  </button>
                )}

                {/* Next/Complete Button */}
                <button
                  onClick={
                    currentStep === 4
                      ? () => handleBookingCompletion()
                      : handleNextStep
                  }
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl ${
                    currentStep === 4 && (!isFormValid() || isBookingLoading)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-800 hover:bg-green-900 text-white'
                  }`}
                  disabled={
                    currentStep === 4 && (!isFormValid() || isBookingLoading)
                  }
                >
                  {currentStep === 4
                    ? isBookingLoading
                      ? 'Processing...'
                      : 'Complete Booking'
                    : 'Next'}
                </button>

                <button
                  onClick={() => setShowPriceDetails(!showPriceDetails)}
                  className='w-full text-green-600 hover:text-green-700 font-medium py-2 hover:bg-green-50 rounded-lg transition-all duration-200 flex items-center justify-center'
                >
                  <span className='mr-1'>Price details</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showPriceDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Price Details Accordion */}
                {showPriceDetails && (
                  <div className='mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3'>
                    {/* Base Car Price */}
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-700'>
                        {vehicle.make} {vehicle.model} ({rentalDays}{' '}
                        {rentalDays === 1 ? 'day' : 'days'})
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        €{(vehicle.dailyRate * rentalDays).toFixed(2)}
                      </span>
                    </div>

                    {/* Stay Flexible */}
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-700'>
                        Stay flexible
                      </span>
                      <span className='text-sm font-medium text-green-600'>
                        Included
                      </span>
                    </div>

                    {/* Unlimited Mileage */}
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-700'>
                        Unlimited km
                      </span>
                      <span className='text-sm font-medium text-green-600'>
                        Included
                      </span>
                    </div>

                    {/* CDW (only show if past step 1) */}
                    {currentStep >= 2 && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-700'>
                          CDW -{' '}
                          {cdwCoverage === 'basic'
                            ? 'Basic Coverage'
                            : 'Full Coverage'}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            cdwCoverage === 'basic'
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {cdwCoverage === 'basic'
                            ? 'Included'
                            : `€${(15 * rentalDays).toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    {/* Selected Add-ons (show if on step 3 or 4) */}
                    {currentStep >= 3 &&
                      getSelectedAddOns().map((addon) => (
                        <div key={addon.key} className='flex justify-between'>
                          <span className='text-sm text-gray-700'>
                            {addon.name} ({rentalDays}{' '}
                            {rentalDays === 1 ? 'day' : 'days'})
                          </span>
                          <span className='text-sm font-medium text-gray-900'>
                            €{(addon.price * rentalDays).toFixed(2)}
                          </span>
                        </div>
                      ))}

                    {/* Divider */}
                    <hr className='border-gray-300' />

                    {/* Total */}
                    <div className='flex justify-between'>
                      <span className='text-base font-semibold text-gray-900'>
                        Total
                      </span>
                      <span className='text-base font-bold text-gray-900'>
                        €{(getTotalDailyRate() * rentalDays).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
