'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Save, X } from 'lucide-react';

interface Location {
  _id?: string;
  name: string;
  type: 'pickup' | 'both';
  serviceType: 'rental' | 'transfer' | 'both';
  city?: string;
  active: boolean;
  order: number;
}

export default function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/settings/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSaveLocation = async (location: Location) => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Location saved successfully!');
        setEditingLocation(null);
        setShowAddForm(false);
        fetchLocations();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('❌ Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/settings/locations?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Location deleted successfully!');
        fetchLocations();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('❌ Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const LocationForm = ({ location, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState<Location>(
      location || {
        name: '',
        type: 'both',
        serviceType: 'both',
        city: '',
        active: true,
        order: 0,
      }
    );

    return (
      <div className='bg-white border-2 border-emerald-200 rounded-xl p-6 mb-4 shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          {location ? 'Edit Location' : 'Add New Location'}
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center'>
              <MapPin className='h-4 w-4 mr-1 text-emerald-600' />
              Location Name *
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all'
              placeholder='e.g., Zagreb Downtown'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              City
            </label>
            <input
              type='text'
              value={formData.city || ''}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all'
              placeholder='e.g., Zagreb'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Location Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as 'pickup' | 'both',
                })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white'
            >
              <option value='both'>Pickup & Return</option>
              <option value='pickup'>Pickup Only</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Service Type
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceType: e.target.value as 'rental' | 'transfer' | 'both',
                })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white'
            >
              <option value='both'>🚗 Car Rental & Transfer</option>
              <option value='rental'>🚙 Car Rental Only</option>
              <option value='transfer'>🚐 Transfer Only</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Display Order
            </label>
            <input
              type='number'
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all'
              placeholder='0'
            />
          </div>
        </div>

        <div className='bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200'>
          <label className='flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className='h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded'
            />
            <span className='ml-3 text-sm font-medium text-gray-700'>
              Active (visible to users)
            </span>
          </label>
        </div>

        <div className='flex gap-3 pt-2'>
          <button
            onClick={() => onSave(formData)}
            disabled={loading || !formData.name}
            className='flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors shadow-sm'
          >
            <Save className='h-4 w-4 mr-2' />
            {loading ? 'Saving...' : 'Save Location'}
          </button>
          <button
            onClick={onCancel}
            className='px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center font-medium transition-colors'
          >
            <X className='h-4 w-4 mr-2' />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
            <MapPin className='h-7 w-7 mr-2 text-emerald-600' />
            Locations Management
          </h2>
          <p className='text-sm text-gray-600 mt-2'>
            Manage pickup and return locations for rentals and transfers
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className='px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center font-medium shadow-md hover:shadow-lg transition-all'
          >
            <Plus className='h-5 w-5 mr-2' />
            Add Location
          </button>
        )}
      </div>

      {showAddForm && (
        <LocationForm
          location={null}
          onSave={handleSaveLocation}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className='space-y-3'>
        {locations.map((location) => (
          <div key={location._id}>
            {editingLocation?._id === location._id ? (
              <LocationForm
                location={editingLocation}
                onSave={handleSaveLocation}
                onCancel={() => setEditingLocation(null)}
              />
            ) : (
              <div className='bg-white flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all'>
                <div className='flex items-center flex-1'>
                  <div className='bg-emerald-50 p-3 rounded-lg mr-4'>
                    <MapPin className='h-5 w-5 text-emerald-600' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-semibold text-gray-900 text-lg'>
                        {location.name}
                      </span>
                      {location.city && (
                        <span className='text-sm text-gray-500 font-medium'>
                          • {location.city}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-sm text-gray-600'>
                        {location.type === 'both' ? '🔄 Pickup & Return' : '📍 Pickup Only'}
                      </span>
                      {location.serviceType === 'rental' && (
                        <span className='text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium'>
                          🚙 Rental
                        </span>
                      )}
                      {location.serviceType === 'transfer' && (
                        <span className='text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium'>
                          🚐 Transfer
                        </span>
                      )}
                      {location.serviceType === 'both' && (
                        <span className='text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium'>
                          🚗 Both
                        </span>
                      )}
                      {!location.active && (
                        <span className='text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-medium'>
                          ❌ Inactive
                        </span>
                      )}
                      <span className='text-xs text-gray-500'>
                        Order: {location.order}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingLocation(location)}
                    className='px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location._id!)}
                    disabled={loading}
                    className='px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center transition-colors'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {locations.length === 0 && !showAddForm && (
          <div className='bg-white border-2 border-dashed border-gray-300 rounded-xl text-center py-16'>
            <div className='bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <MapPin className='h-10 w-10 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No locations yet</h3>
            <p className='text-gray-500 mb-6'>Get started by adding your first pickup/return location</p>
            <button
              onClick={() => setShowAddForm(true)}
              className='px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center font-medium shadow-md hover:shadow-lg transition-all'
            >
              <Plus className='h-5 w-5 mr-2' />
              Add Your First Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
