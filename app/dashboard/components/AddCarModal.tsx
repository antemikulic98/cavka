'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Car,
  Info,
  DollarSign,
  MapPin,
  Settings,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import CustomSelect from '@/app/components/CustomSelect';
import ColorSelect from '@/app/components/ColorSelect';

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded: () => void;
}

interface CarFormData {
  // Basic Information
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;

  // ACRISS Classification
  category: string;
  bodyType: string;
  transmission: string;
  fuelAirCon: string;

  // Capacity & Features
  passengerCapacity: number;
  doorCount: number;
  bigSuitcases: number;
  smallSuitcases: number;
  features: string[];

  // Pricing
  dailyRate: number;
  currency: string;

  // Location & Description
  location: string;
  description: string;
}

// ACRISS Classification options based on official standard
const ACRISS_CATEGORIES = [
  { code: 'M', label: 'Mini' },
  { code: 'E', label: 'Economy' },
  { code: 'C', label: 'Compact' },
  { code: 'I', label: 'Intermediate' },
  { code: 'S', label: 'Standard' },
  { code: 'F', label: 'Fullsize' },
  { code: 'P', label: 'Premium' },
  { code: 'L', label: 'Luxury' },
  { code: 'X', label: 'Special' },
];

const ACRISS_BODY_TYPES = [
  { code: 'B', label: '2-3 Door' },
  { code: 'C', label: '2-4 Door' },
  { code: 'D', label: '4-5 Door' },
  { code: 'W', label: 'Wagon/Estate' },
  { code: 'V', label: 'Passenger Van' },
  { code: 'L', label: 'Limousine' },
  { code: 'S', label: 'Sport' },
  { code: 'T', label: 'Convertible' },
  { code: 'F', label: 'SUV' },
  { code: 'J', label: 'Open Air All Terrain' },
  { code: 'P', label: 'Pickup' },
  { code: 'X', label: 'Special' },
];

const ACRISS_FUEL_AIRCON = [
  { code: 'R', label: 'Air Conditioning' },
  { code: 'N', label: 'No Air Conditioning' },
  { code: 'H', label: 'Hybrid' },
  { code: 'L', label: 'LPG' },
  { code: 'X', label: 'Ethanol' },
];

// Convert arrays to select options format
const makeOptions = [
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Volkswagen',
  'Toyota',
  'Honda',
  'Nissan',
  'Ford',
  'Chevrolet',
  'Hyundai',
  'Kia',
  'Mazda',
  'Subaru',
  'Volvo',
  'Peugeot',
  'Renault',
  'Opel',
  'Skoda',
  'Seat',
  'Fiat',
  'Alfa Romeo',
  'Jeep',
  'Land Rover',
  'Jaguar',
  'Porsche',
  'Tesla',
  'Other',
].map((make) => ({ value: make, label: make }));

const categoryOptions = ACRISS_CATEGORIES.map((category) => ({
  value: category.code,
  label: category.label,
}));

const bodyTypeOptions = ACRISS_BODY_TYPES.map((bodyType) => ({
  value: bodyType.code,
  label: bodyType.label,
}));

const transmissionOptions = [
  { value: 'M', label: 'Manual' },
  { value: 'A', label: 'Automatic' },
];

const fuelAirConOptions = ACRISS_FUEL_AIRCON.map((option) => ({
  value: option.code,
  label: option.label,
}));

const currencyOptions = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'HRK', label: 'HRK (kn)' },
];

const locationOptions = [
  { value: 'Split Airport', label: 'Split Airport' },
  { value: 'Split Downtown', label: 'Split Downtown' },
  { value: 'Zagreb Airport', label: 'Zagreb Airport' },
  { value: 'Zagreb Downtown', label: 'Zagreb Downtown' },
  { value: 'Rijeka', label: 'Rijeka' },
  { value: 'Zadar Downtown', label: 'Zadar Downtown' },
  { value: 'Zadar Airport', label: 'Zadar Airport' },
  { value: 'Dubrovnik Airport', label: 'Dubrovnik Airport' },
  { value: 'Dubrovnik Downtown', label: 'Dubrovnik Downtown' },
];

// Generate year options
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: 25 },
  (_, i) => currentYear + 1 - i
).map((year) => ({ value: year, label: year.toString() }));

const COMMON_FEATURES = [
  'Bluetooth',
  'GPS Navigation',
  'Parking Sensors',
  'Backup Camera',
  'Heated Seats',
  'Leather Interior',
  'Sunroof',
  'Cruise Control',
  'USB Ports',
  'Wireless Charging',
  'Apple CarPlay',
  'Android Auto',
  'Premium Sound System',
  'Keyless Entry',
  'Push Button Start',
];

export default function AddCarModal({
  isOpen,
  onClose,
  onCarAdded,
}: AddCarModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: 0,
    color: '',
    licensePlate: '',
    category: 'E', // Economy
    bodyType: 'D', // 4-5 Door
    transmission: 'M', // Manual
    fuelAirCon: 'R', // Air Conditioning
    passengerCapacity: 5,
    doorCount: 4,
    bigSuitcases: 2,
    smallSuitcases: 2,
    features: [],
    dailyRate: 50,
    currency: 'EUR',
    location: 'Zagreb Downtown',
    description: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSelectChange = (name: string) => (value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.make) errors.push('Make is required');
        if (!formData.model) errors.push('Model is required');
        if (!formData.year) errors.push('Year is required');
        if (!formData.color) errors.push('Color is required');
        if (!formData.licensePlate) errors.push('License plate is required');
        break;

      case 2:
        if (!formData.category) errors.push('Category is required');
        if (!formData.bodyType) errors.push('Body type is required');
        if (!formData.transmission) errors.push('Transmission is required');
        if (!formData.fuelAirCon)
          errors.push('Fuel/Air conditioning is required');
        break;

      case 3:
        if (!formData.passengerCapacity)
          errors.push('Passenger capacity is required');
        if (!formData.doorCount) errors.push('Door count is required');
        break;

      case 4:
        if (!formData.dailyRate) errors.push('Daily rate is required');
        if (!formData.location) errors.push('Location is required');
        break;
    }

    return errors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setValidationErrors(stepErrors);
      // Scroll to top of modal to show validation errors
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
      return;
    }
    setValidationErrors([]); // Clear any previous errors
    setCurrentStep(currentStep + 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('🚫 Enter key blocked - prevented automatic submission');
    }
  };

  const generateAcrissCode = () => {
    // Official ACRISS code generation (4 letters)
    // 1st: Category, 2nd: Body Type, 3rd: Transmission, 4th: Fuel/Air Con
    return `${formData.category}${formData.bodyType}${formData.transmission}${formData.fuelAirCon}`;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Basic Information validation
    if (!formData.make) errors.push('Make is required');
    if (!formData.model) errors.push('Model is required');
    if (!formData.year) errors.push('Year is required');
    if (!formData.color) errors.push('Color is required');
    if (!formData.licensePlate) errors.push('License plate is required');

    // ACRISS Classification validation
    if (!formData.category) errors.push('Category is required');
    if (!formData.bodyType) errors.push('Body type is required');
    if (!formData.transmission) errors.push('Transmission is required');
    if (!formData.fuelAirCon) errors.push('Fuel/Air conditioning is required');

    // Capacity validation
    if (!formData.passengerCapacity)
      errors.push('Passenger capacity is required');
    if (!formData.doorCount) errors.push('Door count is required');

    // Pricing validation
    if (!formData.dailyRate) errors.push('Daily rate is required');
    if (!formData.location) errors.push('Location is required');

    return errors;
  };

  const [isExplicitSubmit, setIsExplicitSubmit] = useState(false);

  // Direct submission function that bypasses form events and state timing issues
  const handleSubmitDirect = async () => {
    console.log('🚀 handleSubmitDirect called!');

    if (currentStep !== 4) {
      console.log('❌ Not on step 4, cannot submit');
      return;
    }

    if (loading || uploadingImages) {
      console.log('❌ Already loading or uploading, cannot submit');
      return;
    }

    // Validate all fields before proceeding
    console.log('🔍 Validating form...');
    const formValidationErrors = validateForm();
    console.log('Validation result:', {
      errors: formValidationErrors,
      errorCount: formValidationErrors.length,
    });

    if (formValidationErrors.length > 0) {
      console.log('❌ Form validation failed:', formValidationErrors);
      setValidationErrors(formValidationErrors);
      // Scroll to top of modal to show validation errors
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
      return;
    }

    console.log('✅ Form validation passed, starting submission process...');
    setLoading(true);
    setValidationErrors([]); // Clear any validation errors

    try {
      // First, upload images if any
      let imageUrls: string[] = [];

      if (selectedImages.length > 0) {
        console.log(`📤 Uploading ${selectedImages.length} images...`);
        setUploadingImages(true);

        try {
          const formData = new FormData();
          selectedImages.forEach((file) => {
            formData.append('images', file);
          });

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload images');
          }

          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.images.map(
            (img: { url: string }) => img.url
          );

          console.log(`✅ Successfully uploaded ${imageUrls.length} images`);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          setUploadingImages(false);
          throw new Error(
            `Image upload failed: ${
              uploadError instanceof Error
                ? uploadError.message
                : 'Unknown error'
            }`
          );
        } finally {
          setUploadingImages(false);
        }
      }

      const vehicleData = {
        ...formData,
        acrissCode: generateAcrissCode(),
        images: imageUrls,
        mainImage: imageUrls[0] || '',
      };

      console.log('📤 Sending vehicle data to API...', vehicleData);

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        console.log('✅ Vehicle added successfully!');
        onCarAdded();
        onClose();
        // Reset form
        setCurrentStep(1);
        setFormData({
          make: '',
          model: '',
          year: 0,
          color: '',
          licensePlate: '',
          category: 'E', // Economy
          bodyType: 'D', // 4-5 Door
          transmission: 'M', // Manual
          fuelAirCon: 'R', // Air Conditioning
          passengerCapacity: 5,
          doorCount: 4,
          bigSuitcases: 2,
          smallSuitcases: 2,
          features: [],
          dailyRate: 50,
          currency: 'EUR',
          location: 'Zagreb Downtown',
          description: '',
        });
        setSelectedImages([]);
      } else {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setValidationErrors([`Failed to add vehicle: ${errorMessage}`]);

      // Scroll to show the error
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit called!', {
      currentStep,
      isExplicitSubmit,
      loading,
      uploadingImages,
    });

    e.preventDefault();
    e.stopPropagation();

    console.log('🔍 Form submission attempt:', {
      currentStep,
      isExplicitSubmit,
      loading,
    });

    // Block ALL automatic submissions - only allow explicit button clicks
    if (!isExplicitSubmit || currentStep !== 4) {
      console.log(
        '❌ Form submission blocked - not explicit or not on step 4',
        {
          isExplicitSubmit,
          currentStep,
        }
      );
      setIsExplicitSubmit(false); // Reset flag
      return;
    }

    console.log('✅ Form submission allowed - proceeding...');

    // Validate all fields before proceeding
    console.log('🔍 Validating form...');
    const formValidationErrors = validateForm();
    console.log('Validation result:', {
      errors: formValidationErrors,
      errorCount: formValidationErrors.length,
    });

    if (formValidationErrors.length > 0) {
      console.log('❌ Form validation failed:', formValidationErrors);
      setValidationErrors(formValidationErrors);
      // Scroll to top of modal to show validation errors
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
      return;
    }

    console.log('✅ Form validation passed, starting submission process...');
    setLoading(true);
    setIsExplicitSubmit(false); // Reset flag after successful validation
    setValidationErrors([]); // Clear any validation errors

    try {
      // First, upload images if any
      let imageUrls: string[] = [];

      if (selectedImages.length > 0) {
        console.log('📸 Starting image upload process...');
        setUploadingImages(true);

        try {
          const formData = new FormData();
          selectedImages.forEach((file) => {
            formData.append('images', file);
          });

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload images');
          }

          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.images.map(
            (img: { url: string }) => img.url
          );

          console.log(`✅ Successfully uploaded ${imageUrls.length} images`);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          setUploadingImages(false);
          throw new Error(
            `Image upload failed: ${
              uploadError instanceof Error
                ? uploadError.message
                : 'Unknown error'
            }`
          );
        } finally {
          setUploadingImages(false);
        }
      }

      const vehicleData = {
        ...formData,
        acrissCode: generateAcrissCode(),
        images: imageUrls,
        mainImage: imageUrls[0] || '',
      };

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        onCarAdded();
        onClose();
        // Reset form
        setCurrentStep(1);
        setFormData({
          make: '',
          model: '',
          year: 0,
          color: '',
          licensePlate: '',
          category: 'E', // Economy
          bodyType: 'D', // 4-5 Door
          transmission: 'M', // Manual
          fuelAirCon: 'R', // Air Conditioning
          passengerCapacity: 5,
          doorCount: 4,
          bigSuitcases: 2,
          smallSuitcases: 2,
          features: [],
          dailyRate: 50,
          currency: 'EUR',
          location: 'Zagreb Downtown',
          description: '',
        });
        setSelectedImages([]);
      } else {
        throw new Error('Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setValidationErrors([`Failed to add vehicle: ${errorMessage}`]);

      // Scroll to show the error
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className='flex items-center mb-6'>
              <Car className='h-6 w-6 text-emerald-600 mr-3' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Basic Information
              </h3>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Make
                </label>
                <CustomSelect
                  options={makeOptions}
                  value={formData.make}
                  onChange={handleSelectChange('make')}
                  placeholder='Select Make'
                  searchable
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Model
                </label>
                <input
                  type='text'
                  name='model'
                  value={formData.model}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white'
                  placeholder='e.g., Camry'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Year
                </label>
                <CustomSelect
                  options={yearOptions}
                  value={formData.year || ''}
                  onChange={handleSelectChange('year')}
                  placeholder='Select Year'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Color
                </label>
                <ColorSelect
                  value={formData.color}
                  onChange={handleSelectChange('color')}
                  placeholder='Select Color'
                />
              </div>

              <div className='col-span-2'>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  License Plate
                </label>
                <input
                  type='text'
                  name='licensePlate'
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white uppercase font-medium'
                  placeholder='e.g., ZG-1234-AA'
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='flex items-center mb-6'>
              <Settings className='h-6 w-6 text-emerald-600 mr-3' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Vehicle Classification
              </h3>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Category (1st Letter)
                </label>
                <CustomSelect
                  options={categoryOptions}
                  value={formData.category}
                  onChange={handleSelectChange('category')}
                  placeholder='Select Category'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Body Type (2nd Letter)
                </label>
                <CustomSelect
                  options={bodyTypeOptions}
                  value={formData.bodyType}
                  onChange={handleSelectChange('bodyType')}
                  placeholder='Select Body Type'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Transmission (3rd Letter)
                </label>
                <CustomSelect
                  options={transmissionOptions}
                  value={formData.transmission}
                  onChange={handleSelectChange('transmission')}
                  placeholder='Select Transmission'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Fuel/Air Con (4th Letter)
                </label>
                <CustomSelect
                  options={fuelAirConOptions}
                  value={formData.fuelAirCon}
                  onChange={handleSelectChange('fuelAirCon')}
                  placeholder='Select Fuel/Air Con'
                />
              </div>

              <div className='col-span-2'>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  ACRISS Code (Generated)
                </label>
                <input
                  type='text'
                  value={generateAcrissCode()}
                  readOnly
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-800 font-mono text-lg text-center tracking-widest'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Based on{' '}
                  <a
                    href='https://www.sixt.com/rental-guide/acriss-code/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-emerald-600 hover:text-emerald-700 underline'
                  >
                    ACRISS standard
                  </a>
                  : Category • Body Type • Transmission • Fuel/Air Con
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='flex items-center mb-6'>
              <Info className='h-6 w-6 text-emerald-600 mr-3' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Capacity & Features
              </h3>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Passengers
                </label>
                <input
                  type='number'
                  name='passengerCapacity'
                  value={formData.passengerCapacity}
                  onChange={handleInputChange}
                  min='1'
                  max='9'
                  className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Doors
                </label>
                <input
                  type='number'
                  name='doorCount'
                  value={formData.doorCount}
                  onChange={handleInputChange}
                  min='2'
                  max='5'
                  className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white'
                />
              </div>
            </div>

            {/* Luggage Section */}
            <div className='mb-6'>
              <label className='block text-sm font-semibold text-gray-900 mb-3'>
                Luggage Capacity
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 border border-gray-200 rounded-xl p-4'>
                  <div className='flex items-center mb-2'>
                    <div className='w-8 h-6 bg-gray-600 rounded-sm mr-3'></div>
                    <span className='text-sm font-medium text-gray-900'>
                      Big Suitcases
                    </span>
                  </div>
                  <input
                    type='number'
                    name='bigSuitcases'
                    value={formData.bigSuitcases}
                    onChange={handleInputChange}
                    min='0'
                    max='6'
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Large checked bags
                  </p>
                </div>

                <div className='bg-gray-50 border border-gray-200 rounded-xl p-4'>
                  <div className='flex items-center mb-2'>
                    <div className='w-6 h-4 bg-gray-400 rounded-sm mr-3'></div>
                    <span className='text-sm font-medium text-gray-900'>
                      Small Suitcases
                    </span>
                  </div>
                  <input
                    type='number'
                    name='smallSuitcases'
                    value={formData.smallSuitcases}
                    onChange={handleInputChange}
                    min='0'
                    max='8'
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Carry-on & small bags
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 mb-4'>
                Additional Features
              </label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {COMMON_FEATURES.map((feature) => (
                  <label key={feature} className='group cursor-pointer'>
                    <div
                      className={`
                      flex items-center p-3 rounded-xl border-2 transition-all duration-200
                      ${
                        formData.features.includes(feature)
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-25'
                      }
                      group-hover:shadow-md
                    `}
                    >
                      <div className='relative flex items-center'>
                        <input
                          type='checkbox'
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className='h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded'
                        />
                        {formData.features.includes(feature) && (
                          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                            <svg
                              className='h-3 w-3 text-white'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span
                        className={`
                        ml-3 text-sm font-medium transition-colors duration-200
                        ${
                          formData.features.includes(feature)
                            ? 'text-emerald-800'
                            : 'text-gray-700'
                        }
                      `}
                      >
                        {feature}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='flex items-center mb-6'>
              <ImageIcon className='h-6 w-6 text-emerald-600 mr-3' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Images & Pricing
              </h3>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 mb-2'>
                Vehicle Images
              </label>
              <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-emerald-400 transition-colors'>
                <div className='space-y-1 text-center'>
                  <Upload className='mx-auto h-12 w-12 text-gray-400' />
                  <div className='flex text-sm text-gray-600'>
                    <label className='relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500'>
                      <span>Upload files</span>
                      <input
                        type='file'
                        className='sr-only'
                        multiple
                        accept='image/*'
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className='pl-1'>or drag and drop</p>
                  </div>
                  <p className='text-xs text-gray-500'>
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>

              {selectedImages.length > 0 && (
                <div className='mt-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-sm font-medium text-gray-900'>
                      Selected files: {selectedImages.length}
                    </p>
                    {uploadingImages && (
                      <div className='flex items-center text-emerald-600'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2'></div>
                        <span className='text-xs'>Uploading...</span>
                      </div>
                    )}
                  </div>
                  <div className='max-h-24 overflow-y-auto'>
                    <ul className='text-xs text-gray-700 space-y-1'>
                      {selectedImages.map((file, index) => (
                        <li
                          key={index}
                          className='flex items-center justify-between p-2 bg-gray-50 rounded'
                        >
                          <span className='truncate'>{file.name}</span>
                          <span className='text-gray-500 ml-2'>
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Daily Rate
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <span className='text-gray-600 text-lg font-semibold'>
                      €
                    </span>
                  </div>
                  <input
                    type='number'
                    name='dailyRate'
                    value={formData.dailyRate === 0 ? '' : formData.dailyRate}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setFormData((prev) => ({ ...prev, dailyRate: 0 }));
                      }
                    }}
                    min='0'
                    step='0.01'
                    className='w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-out focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 hover:shadow-md text-gray-900 placeholder-gray-500 bg-white font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    placeholder='0.00'
                  />
                  <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                    <span className='text-gray-500 text-sm'>per day</span>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Currency
                </label>
                <CustomSelect
                  options={currencyOptions}
                  value={formData.currency}
                  onChange={handleSelectChange('currency')}
                  placeholder='Select Currency'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 mb-2'>
                Location
              </label>
              <CustomSelect
                options={locationOptions}
                value={formData.location}
                onChange={handleSelectChange('location')}
                placeholder='Select Location'
                searchable={true}
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 mb-2'>
                Description
              </label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 bg-white'
                placeholder='Additional details about the vehicle...'
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='fixed inset-0 z-[60] overflow-y-auto'>
      <div className='flex items-start justify-center min-h-screen pt-8 px-4 pb-32 text-center'>
        {/* Backdrop */}
        <div
          className='fixed inset-0 backdrop-blur-sm transition-opacity'
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className='relative inline-block bg-white rounded-2xl text-left overflow-visible shadow-2xl transform transition-all sm:align-middle sm:max-w-2xl sm:w-full mx-4'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 modal-content'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>
                Add New Vehicle
              </h2>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400 mt-0.5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3 flex-1'>
                    <h3 className='text-sm font-medium text-red-800 mb-2'>
                      Please complete the following fields:
                    </h3>
                    <ul className='text-sm text-red-700 space-y-1'>
                      {validationErrors.map((error, index) => (
                        <li key={index} className='flex items-center'>
                          <span className='w-1.5 h-1.5 bg-red-400 rounded-full mr-2 flex-shrink-0'></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setValidationErrors([])}
                    className='flex-shrink-0 ml-4 text-red-400 hover:text-red-600 transition-colors'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className='mb-10'>
              <div className='relative'>
                {/* Progress Line */}
                <div className='absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8'></div>
                <div
                  className='absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mx-8 transition-all duration-300 ease-out'
                  style={{
                    width:
                      currentStep === 1
                        ? '0%'
                        : currentStep === 4
                        ? 'calc(92% - 2rem)'
                        : `calc(${((currentStep - 1) / 3) * 92}% - 2rem)`,
                  }}
                ></div>

                {/* Steps */}
                <div className='relative flex justify-between'>
                  {[
                    { number: 1, icon: Car, title: 'Basic Info' },
                    { number: 2, icon: Settings, title: 'Classification' },
                    { number: 3, icon: Info, title: 'Features' },
                    { number: 4, icon: ImageIcon, title: 'Images & Price' },
                  ].map((step, index) => (
                    <div
                      key={step.number}
                      className='flex flex-col items-center'
                    >
                      {/* Step Circle */}
                      <div
                        className={`
                          relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          transition-all duration-300 ease-out transform
                          ${
                            currentStep > step.number
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : currentStep === step.number
                              ? 'bg-emerald-600 text-white shadow-xl scale-110 ring-2 ring-emerald-200'
                              : 'bg-white text-gray-400 border-2 border-gray-200'
                          }
                        `}
                      >
                        {currentStep > step.number ? (
                          <Check className='h-4 w-4' />
                        ) : (
                          <step.icon className='h-4 w-4' />
                        )}

                        {/* Active Step Pulse */}
                        {currentStep === step.number && (
                          <div className='absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20'></div>
                        )}
                      </div>

                      {/* Step Label */}
                      <div className='mt-2'>
                        <div
                          className={`
                            text-xs font-medium transition-colors duration-200
                            ${
                              currentStep >= step.number
                                ? 'text-emerald-700'
                                : 'text-gray-400'
                            }
                          `}
                        >
                          {step.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
              <div className='mb-8'>{renderStepContent()}</div>

              <div className='flex justify-between pt-6 mt-6 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    type='button'
                    onClick={handleNextStep}
                    className='px-6 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type='button'
                    onClick={async () => {
                      // Call handleSubmit directly
                      await handleSubmitDirect();
                    }}
                    disabled={loading || uploadingImages}
                    className='px-6 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {uploadingImages
                      ? 'Uploading Images...'
                      : loading
                      ? 'Adding Vehicle...'
                      : 'Add Vehicle'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
