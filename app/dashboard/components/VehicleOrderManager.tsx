'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Car, Save, RotateCcw, CheckCircle } from 'lucide-react';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  mainImage: string;
  status: string;
  order: number;
  category: string;
  dailyRate: number;
  currency: string;
}

interface SortableVehicleItemProps {
  vehicle: Vehicle;
}

function SortableVehicleItem({ vehicle }: SortableVehicleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vehicle._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'
    >
      <div className='flex items-center p-4 gap-4'>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600'
        >
          <GripVertical className='h-6 w-6' />
        </div>

        {/* Vehicle Image */}
        <div className='w-24 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden'>
          {vehicle.mainImage ? (
            <img
              src={vehicle.mainImage}
              alt={`${vehicle.make} ${vehicle.model}`}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='flex items-center justify-center h-full'>
              <Car className='h-6 w-6 text-gray-400' />
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className='flex-1 min-w-0'>
          <h3 className='text-base font-semibold text-gray-900 truncate'>
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h3>
          <div className='flex items-center gap-2 mt-1'>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                vehicle.status
              )}`}
            >
              {vehicle.status}
            </span>
            <span className='text-sm text-gray-600'>
              {vehicle.category} • {vehicle.currency}{vehicle.dailyRate}/day
            </span>
          </div>
        </div>

        {/* Order Number */}
        <div className='text-sm font-medium text-gray-500 px-3'>
          #{vehicle.order}
        </div>
      </div>
    </div>
  );
}

export default function VehicleOrderManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [originalVehicles, setOriginalVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Check if order has changed
    const orderChanged = vehicles.some((vehicle, index) => {
      const originalVehicle = originalVehicles.find(v => v._id === vehicle._id);
      return originalVehicle && originalVehicle.order !== index;
    });
    setHasChanges(orderChanged);
  }, [vehicles, originalVehicles]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/vehicles?limit=1000', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();

      // Sort vehicles by order field (ascending)
      const sortedVehicles = data.vehicles.sort((a: Vehicle, b: Vehicle) =>
        (a.order || 0) - (b.order || 0)
      );

      setVehicles(sortedVehicles);
      setOriginalVehicles(JSON.parse(JSON.stringify(sortedVehicles)));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setVehicles((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      // Prepare vehicle orders
      const vehicleOrders = vehicles.map((vehicle, index) => ({
        vehicleId: vehicle._id,
        order: index,
      }));

      const response = await fetch('/api/vehicles/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ vehicleOrders }),
      });

      if (!response.ok) {
        throw new Error('Failed to save vehicle order');
      }

      // Update originalVehicles to reflect saved state
      const updatedVehicles = vehicles.map((vehicle, index) => ({
        ...vehicle,
        order: index,
      }));
      setOriginalVehicles(JSON.parse(JSON.stringify(updatedVehicles)));
      setVehicles(updatedVehicles);
      setHasChanges(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving vehicle order:', error);
      alert('Failed to save vehicle order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setVehicles(JSON.parse(JSON.stringify(originalVehicles)));
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
        <span className='ml-3 text-gray-700'>Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Vehicle Display Order
          </h1>
          <p className='text-gray-600'>
            Drag and drop to reorder vehicles on landing page and search results
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-3'>
          {hasChanges && (
            <button
              onClick={handleReset}
              className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all duration-200'
            >
              <RotateCcw className='w-4 h-4 mr-2' />
              Reset
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              hasChanges && !saving
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className='w-4 h-4 mr-2' />
                Saved!
              </>
            ) : (
              <>
                <Save className='w-4 h-4 mr-2' />
                Save Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      {hasChanges && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-blue-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-blue-700'>
                You have unsaved changes. Click "Save Order" to apply changes to
                the website.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle List */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            All Vehicles ({vehicles.length})
          </h3>
          <p className='text-sm text-gray-600'>
            Vehicles at the top will appear first on the landing page and search
            results.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={vehicles.map((v) => v._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {vehicles.map((vehicle) => (
                <SortableVehicleItem key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
