'use client';

import { useState, useEffect, useCallback } from 'react';
import { Car } from 'lucide-react';

// Import new components
import VehicleHeader from './VehicleHeader';
import VehicleDetails from './VehicleDetails';
import VehicleCalendar from './VehicleCalendar';
import PriceEditModal from './PriceEditModal';
import DateInfoPanel from './DateInfoPanel';
import EditVehicleModal from './EditVehicleModal';

interface DayPricing {
  date: string;
  price: number;
  label?: string;
  type?: string;
}

interface Booking {
  _id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Vehicle {
  _id: string;
  year: number;
  make: string;
  model: string;
  fullName?: string;
  licensePlate: string;
  color: string;
  mainImage?: string;
  passengerCapacity: number;
  doorCount: number;
  bigSuitcases?: number;
  smallSuitcases?: number;
  luggageCapacity?: number;
  transmission: string;
  dailyRate: number;
  currency: string;
  category: string;
  location: string;
  status: string;
  description?: string;
  features: string[];
  createdAt: string;
  customPricing?: DayPricing[];
}

interface VehicleViewProps {
  vehicleId: string;
  onBack: () => void;
}

export default function VehicleView({ vehicleId, onBack }: VehicleViewProps) {
  // State
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dayPricing, setDayPricing] = useState<DayPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch vehicle details
  const fetchVehicleDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setVehicle(data.vehicle);
      } else {
        console.error('Failed to fetch vehicle details');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bookings`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the API response to match the expected interface
        const formattedBookings: Booking[] = data.bookings.map(
          (booking: any) => ({
            _id: booking.id,
            vehicleId: vehicleId,
            startDate: booking.startDate.split('T')[0], // Format to YYYY-MM-DD
            endDate: booking.endDate.split('T')[0], // Format to YYYY-MM-DD
            customerName: booking.customerName,
            customerEmail: '', // Not included in API response for privacy
            customerPhone: '', // Not included in API response for privacy
            totalAmount: booking.totalCost,
            status: booking.status,
            createdAt: booking.createdAt.split('T')[0], // Format to YYYY-MM-DD
          })
        );
        setBookings(formattedBookings);
      } else {
        console.error('Failed to fetch vehicle bookings');
        setBookings([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Set empty array on error
    }
  }, [vehicleId]);

  // Fetch day pricing
  const fetchDayPricing = useCallback(async () => {
    try {
      // Fetch custom pricing from database
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing`, {
        credentials: 'include',
      });

      let customPricing: DayPricing[] = [];
      if (response.ok) {
        const data = await response.json();
        customPricing = data.pricing || [];
      }

      setDayPricing(customPricing);
    } catch (error) {
      console.error('Error fetching day pricing:', error);
    }
  }, [vehicleId]);

  // Effects
  useEffect(() => {
    fetchVehicleDetails();
    fetchBookings();
    fetchDayPricing();
  }, [fetchVehicleDetails, fetchBookings, fetchDayPricing]);

  // Event handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (editMode && !isDateBooked(date) && date >= new Date()) {
      openPriceModal(date);
    }
  };

  const openPriceModal = (date: Date) => {
    const { price } = getPriceForDate(date);
    setEditingDate(date);
    setNewPrice(price.toString());
    setShowPriceModal(true);
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setEditingDate(null);
    setNewPrice('');
  };

  const savePriceChange = async () => {
    if (
      !editingDate ||
      !newPrice ||
      isNaN(parseFloat(newPrice)) ||
      parseFloat(newPrice) <= 0
    ) {
      return;
    }

    const dateStr = editingDate.toISOString().split('T')[0];
    const priceValue = parseFloat(newPrice);

    try {
      // Save to MongoDB via API
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: dateStr,
          price: priceValue,
          label: 'Custom Price',
          type: 'custom',
        }),
      });

      if (response.ok) {
        // Update local state
        const existingIndex = dayPricing.findIndex((p) => p.date === dateStr);
        const newPricing: DayPricing = {
          date: dateStr,
          price: priceValue,
          label: 'Custom Price',
          type: 'custom',
        };

        let updatedPricing;
        if (existingIndex >= 0) {
          updatedPricing = [...dayPricing];
          updatedPricing[existingIndex] = newPricing;
        } else {
          updatedPricing = [...dayPricing, newPricing];
        }

        setDayPricing(updatedPricing);
        closePriceModal();
      } else {
        const error = await response.json();
        alert(`Error saving price: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Failed to save price. Please try again.');
    }
  };

  const clearCustomPrice = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    try {
      // Remove from MongoDB via API
      const response = await fetch(`/api/vehicles/${vehicleId}/pricing`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: dateStr,
        }),
      });

      if (response.ok) {
        // Update local state
        const updatedPricing = dayPricing.filter((p) => p.date !== dateStr);
        setDayPricing(updatedPricing);
      } else {
        const error = await response.json();
        alert(`Error removing price: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing price:', error);
      alert('Failed to remove price. Please try again.');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Helper functions
  const getPriceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const customPricing = dayPricing.find((p) => p.date === dateStr);
    if (customPricing) {
      return {
        price: customPricing.price,
        pricing: customPricing,
        type: 'custom',
      };
    }

    return {
      price: vehicle?.dailyRate || 80,
      pricing: null,
      type: 'base',
    };
  };

  const isDateBooked = (date: Date) => {
    const checkDate = new Date(date);
    return bookings.some((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      return (
        checkDate >= startDate &&
        checkDate <= endDate &&
        booking.status === 'confirmed'
      );
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className='text-center py-12'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600'></div>
        <p className='mt-2 text-gray-600'>Loading vehicle details...</p>
      </div>
    );
  }

  // Not found state
  if (!vehicle) {
    return (
      <div className='text-center py-12'>
        <Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Vehicle not found
        </h3>
        <p className='text-gray-500'>
          The requested vehicle could not be found.
        </p>
        <button
          onClick={onBack}
          className='mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50'
        >
          Go Back
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className='space-y-6'>
      {/* Header */}
      <VehicleHeader
        onBack={onBack}
        onEdit={() => setShowEditModal(true)}
        onDelete={() => {
          // TODO: Implement delete functionality
          if (confirm('Are you sure you want to delete this vehicle?')) {
            console.log('Delete vehicle:', vehicle?._id);
          }
        }}
      />

      <div className='space-y-8'>
        {/* Vehicle Details */}
        <VehicleDetails
          vehicle={vehicle}
          bookings={bookings}
          dayPricing={dayPricing}
        />

        {/* BIG CALENDAR - Full Width */}
        <VehicleCalendar
          vehicle={vehicle}
          currentDate={currentDate}
          dayPricing={dayPricing}
          bookings={bookings}
          editMode={editMode}
          onDateClick={handleDateClick}
          onMonthNavigate={navigateMonth}
          onClearCustomPrice={clearCustomPrice}
          onToggleEditMode={() => setEditMode(!editMode)}
        />

        {/* Selected Date Info */}
        {selectedDate && (
          <DateInfoPanel
            selectedDate={selectedDate}
            dayPricing={dayPricing}
            bookings={bookings}
            vehicle={vehicle}
            editMode={editMode}
            onOpenPriceModal={openPriceModal}
            onClearCustomPrice={clearCustomPrice}
          />
        )}
      </div>

      {/* Price Edit Modal */}
      <PriceEditModal
        isOpen={showPriceModal}
        editingDate={editingDate}
        newPrice={newPrice}
        dayPricing={dayPricing}
        onClose={closePriceModal}
        onPriceChange={setNewPrice}
        onSave={savePriceChange}
      />

      {/* Edit Vehicle Modal */}
      {vehicle && (
        <EditVehicleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onVehicleUpdated={() => {
            fetchVehicleDetails();
            setShowEditModal(false);
          }}
          vehicle={vehicle}
        />
      )}
    </div>
  );
}
