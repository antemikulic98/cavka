'use client';

import { useState, useEffect } from 'react';
import { Save, Euro, Loader2, Check, Plus, Trash2 } from 'lucide-react';

interface InsurancePrice {
  _id?: string;
  acrissCode: string;
  dailyPrice: number;
  fullCoveragePrice?: number;
  description?: string;
  currency: string;
}

export default function InsurancePricing() {
  const [pricing, setPricing] = useState<InsurancePrice[]>([]);
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both pricing and available ACRISS codes
      const [pricingRes, codesRes] = await Promise.all([
        fetch('/api/settings/insurance', { credentials: 'include' }),
        fetch('/api/vehicles/acriss-codes', { credentials: 'include' }),
      ]);

      if (pricingRes.ok) {
        const data = await pricingRes.json();
        setPricing(data.pricing || []);
      }

      if (codesRes.ok) {
        const data = await codesRes.json();
        setAvailableCodes(data.codes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceForCode = (acrissCode: string): InsurancePrice => {
    const existing = pricing.find((p) => p.acrissCode === acrissCode);
    return (
      existing || {
        acrissCode,
        dailyPrice: 0,
        fullCoveragePrice: 0,
        currency: 'EUR',
      }
    );
  };

  const updatePrice = (acrissCode: string, field: keyof InsurancePrice, value: any) => {
    setPricing((prev) => {
      const existing = prev.find((p) => p.acrissCode === acrissCode);
      if (existing) {
        return prev.map((p) =>
          p.acrissCode === acrissCode ? { ...p, [field]: value } : p
        );
      } else {
        return [
          ...prev,
          {
            acrissCode,
            dailyPrice: 0,
            fullCoveragePrice: 0,
            currency: 'EUR',
            [field]: value,
          },
        ];
      }
    });
  };

  const savePrice = async (acrissCode: string) => {
    try {
      setSaving(acrissCode);
      setSavedCode(null);

      const priceData = getPriceForCode(acrissCode);

      console.log('Sending pricing data:', priceData);

      const response = await fetch('/api/settings/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(priceData),
      });

      const data = await response.json();

      if (response.ok) {
        setSavedCode(acrissCode);
        setTimeout(() => setSavedCode(null), 2000);
        await fetchData();
      } else {
        console.error('Server error:', data);
        alert(`Failed to save pricing: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert(`Failed to save pricing: ${error}`);
    } finally {
      setSaving(null);
    }
  };

  const addNewCode = () => {
    const code = newCode.trim().toUpperCase();

    if (code.length !== 4) {
      alert('ACRISS code must be exactly 4 characters');
      return;
    }

    if (availableCodes.includes(code)) {
      alert('This code already exists');
      return;
    }

    setAvailableCodes((prev) => [...prev, code].sort());
    setNewCode('');
    setShowAddNew(false);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Insurance Pricing by ACRISS Code
          </h2>
          <p className='text-sm text-gray-600'>
            Set daily insurance rates for each ACRISS code. These prices will be
            applied when customers book vehicles.
          </p>
        </div>
        <button
          onClick={() => setShowAddNew(!showAddNew)}
          className='flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors'
        >
          <Plus className='h-5 w-5 mr-2' />
          Add Code
        </button>
      </div>

      {/* Add New Code Form */}
      {showAddNew && (
        <div className='mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <h3 className='text-gray-900 mb-3'>Add New ACRISS Code</h3>
          <div className='flex gap-3'>
            <input
              type='text'
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder='Enter 4-letter code (e.g., EDMR)'
              maxLength={4}
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 uppercase'
            />
            <button
              onClick={addNewCode}
              className='px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors'
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddNew(false);
                setNewCode('');
              }}
              className='px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {availableCodes.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
          <p className='text-gray-600'>
            No ACRISS codes found. Add vehicles or manually add codes to set insurance
            pricing.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {availableCodes.map((code) => {
            const price = getPriceForCode(code);
            const isSaving = saving === code;
            const isSaved = savedCode === code;

            return (
              <div
                key={code}
                className='bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors'
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <span className='inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded'>
                      {code}
                    </span>
                    <span className='text-sm text-gray-500'>ACRISS Code</span>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Basic CDW Price */}
                  <div>
                    <label className='block text-sm text-gray-600 mb-2'>
                      Basic CDW (per day)
                    </label>
                    <div className='relative'>
                      <Euro className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <input
                        type='number'
                        value={price.dailyPrice === 0 ? '' : price.dailyPrice}
                        onChange={(e) =>
                          updatePrice(
                            code,
                            'dailyPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder='0.00'
                        step='0.01'
                        min='0'
                        className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                      />
                    </div>
                  </div>

                  {/* Full Coverage Price */}
                  <div>
                    <label className='block text-sm text-gray-600 mb-2'>
                      Full Coverage (per day)
                    </label>
                    <div className='relative'>
                      <Euro className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <input
                        type='number'
                        value={price.fullCoveragePrice === 0 ? '' : price.fullCoveragePrice || ''}
                        onChange={(e) =>
                          updatePrice(
                            code,
                            'fullCoveragePrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder='0.00'
                        step='0.01'
                        min='0'
                        className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className='flex items-end'>
                    <button
                      onClick={() => savePrice(code)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-center px-6 py-2 rounded-lg transition-all ${
                        isSaved
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <Check className='h-4 w-4 mr-2' />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className='mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <h4 className='text-gray-900 mb-2'>How Insurance Pricing Works</h4>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>• Basic CDW: Standard Collision Damage Waiver coverage</li>
          <li>• Full Coverage: Comprehensive coverage with lower excess</li>
          <li>• Prices are calculated per day and added to the total rental cost</li>
          <li>• Each ACRISS code represents a specific vehicle class and configuration</li>
          <li>• ACRISS codes are automatically detected from your vehicles</li>
        </ul>
      </div>
    </div>
  );
}
