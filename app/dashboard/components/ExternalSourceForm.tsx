'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  DollarSign,
  FileText,
  Save,
  AlertCircle,
} from 'lucide-react';

interface ExternalSourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  overbooking: {
    id: string;
    bookingReference: string;
    vehicleInfo: {
      make: string;
      model: string;
      currency: string;
    };
    pricing: {
      totalCost: number;
    };
    externalSource?: {
      _id: string;
      supplierType: string;
      supplierName: string;
      supplierContact: string;
      costFromSupplier: number;
      sellingPrice: number;
      currency: string;
      status: string;
      notes?: string;
    };
  };
  onSuccess: () => void;
}

export default function ExternalSourceForm({
  isOpen,
  onClose,
  overbooking,
  onSuccess,
}: ExternalSourceFormProps) {
  const [formData, setFormData] = useState({
    supplierType: 'company' as 'company' | 'person',
    supplierName: '',
    supplierContact: '',
    costFromSupplier: 0,
    sellingPrice: overbooking.pricing.totalCost,
    currency: overbooking.vehicleInfo.currency || 'EUR',
    status: 'arranged',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form if editing existing external source
  useEffect(() => {
    if (overbooking.externalSource) {
      setFormData({
        supplierType: overbooking.externalSource.supplierType as 'company' | 'person',
        supplierName: overbooking.externalSource.supplierName,
        supplierContact: overbooking.externalSource.supplierContact,
        costFromSupplier: overbooking.externalSource.costFromSupplier,
        sellingPrice: overbooking.externalSource.sellingPrice,
        currency: overbooking.externalSource.currency,
        status: overbooking.externalSource.status,
        notes: overbooking.externalSource.notes || '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        sellingPrice: overbooking.pricing.totalCost,
        currency: overbooking.vehicleInfo.currency || 'EUR',
      }));
    }
  }, [overbooking]);

  const profitMargin = formData.sellingPrice - formData.costFromSupplier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/overbookings/${overbooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          vehicleId: overbooking.id, // This should be the vehicle ID from overbooking
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSuccess();
          onClose();
        } else {
          setError(data.error || 'Failed to save external source');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save external source');
      }
    } catch (err) {
      console.error('Error saving external source:', err);
      setError('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Arrange External Car Source
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              Booking: {overbooking.bookingReference} - {overbooking.vehicleInfo.make}{' '}
              {overbooking.vehicleInfo.model}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3'>
              <AlertCircle className='h-5 w-5 text-red-600 mt-0.5' />
              <div>
                <h3 className='text-sm font-medium text-red-800'>Error</h3>
                <p className='text-sm text-red-700 mt-1'>{error}</p>
              </div>
            </div>
          )}

          {/* Supplier Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Supplier Type
            </label>
            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => setFormData({ ...formData, supplierType: 'company' })}
                className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                  formData.supplierType === 'company'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2
                  className={`h-5 w-5 ${
                    formData.supplierType === 'company' ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`font-medium ${
                    formData.supplierType === 'company' ? 'text-emerald-900' : 'text-gray-700'
                  }`}
                >
                  Company
                </span>
              </button>
              <button
                type='button'
                onClick={() => setFormData({ ...formData, supplierType: 'person' })}
                className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                  formData.supplierType === 'person'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User
                  className={`h-5 w-5 ${
                    formData.supplierType === 'person' ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`font-medium ${
                    formData.supplierType === 'person' ? 'text-emerald-900' : 'text-gray-700'
                  }`}
                >
                  Person
                </span>
              </button>
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label htmlFor='supplierName' className='block text-sm font-medium text-gray-700 mb-2'>
              Supplier Name *
            </label>
            <input
              type='text'
              id='supplierName'
              required
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              placeholder={
                formData.supplierType === 'company' ? 'Company name' : 'Person name'
              }
            />
          </div>

          {/* Supplier Contact */}
          <div>
            <label htmlFor='supplierContact' className='block text-sm font-medium text-gray-700 mb-2'>
              Contact (Phone/Email) *
            </label>
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                id='supplierContact'
                required
                value={formData.supplierContact}
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                placeholder='Phone number or email'
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
            <h3 className='font-medium text-gray-900'>Pricing Details</h3>

            <div className='grid grid-cols-2 gap-4'>
              {/* Cost from Supplier */}
              <div>
                <label htmlFor='costFromSupplier' className='block text-sm font-medium text-gray-700 mb-2'>
                  Cost from Supplier *
                </label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                  <input
                    type='number'
                    id='costFromSupplier'
                    required
                    min='0'
                    step='0.01'
                    value={formData.costFromSupplier}
                    onChange={(e) =>
                      setFormData({ ...formData, costFromSupplier: parseFloat(e.target.value) || 0 })
                    }
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label htmlFor='sellingPrice' className='block text-sm font-medium text-gray-700 mb-2'>
                  Selling Price (to Customer) *
                </label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                  <input
                    type='number'
                    id='sellingPrice'
                    required
                    min='0'
                    step='0.01'
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                    }
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>

            {/* Profit Margin Display */}
            <div className='bg-white rounded-lg p-4 border-2 border-dashed border-gray-300'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>Profit Margin</span>
                <span
                  className={`text-lg font-bold ${
                    profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {profitMargin >= 0 ? '+' : ''}
                  {profitMargin.toFixed(2)} {formData.currency}
                </span>
              </div>
              {profitMargin < 0 && (
                <p className='text-xs text-red-600 mt-2'>
                  Warning: You're losing money on this arrangement
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
              Status
            </label>
            <select
              id='status'
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
            >
              <option value='arranged'>Arranged</option>
              <option value='confirmed'>Confirmed</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor='notes' className='block text-sm font-medium text-gray-700 mb-2'>
              Notes (Optional)
            </label>
            <div className='relative'>
              <FileText className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
              <textarea
                id='notes'
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                placeholder='Add any additional notes about this arrangement...'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end space-x-4 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className='h-5 w-5' />
                  <span>Save Arrangement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
