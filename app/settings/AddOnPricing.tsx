'use client';

import { useState, useEffect } from 'react';
import { Save, Euro, Loader2, Check, Plus } from 'lucide-react';

interface AddOnPrice {
  _id?: string;
  acrissCode: string;
  additionalDriver?: number;
  wifiHotspot?: number;
  roadsideAssistance?: number;
  tireProtection?: number;
  personalAccident?: number;
  theftProtection?: number;
  extendedTheft?: number;
  interiorProtection?: number;
  currency: string;
}

const ADD_ON_LABELS = {
  additionalDriver: 'Additional Driver',
  wifiHotspot: 'WiFi Hotspot',
  roadsideAssistance: 'Roadside Assistance',
  tireProtection: 'Tire & Windshield Protection',
  personalAccident: 'Personal Accident Protection',
  theftProtection: 'Theft Protection',
  extendedTheft: 'Extended Theft Protection',
  interiorProtection: 'Interior Protection',
};

export default function AddOnPricing() {
  const [pricing, setPricing] = useState<AddOnPrice[]>([]);
  const [availableCodes, setAvailableCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedCode, setSavedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both pricing and available ACRISS codes
      const [pricingRes, codesRes] = await Promise.all([
        fetch('/api/settings/addons', { credentials: 'include' }),
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

  const getPriceForCode = (acrissCode: string): AddOnPrice => {
    const existing = pricing.find((p) => p.acrissCode === acrissCode);
    return (
      existing || {
        acrissCode,
        additionalDriver: 4.75,
        wifiHotspot: 4.6,
        roadsideAssistance: 1.2,
        tireProtection: 1.99,
        personalAccident: 2.39,
        theftProtection: 5.99,
        extendedTheft: 10.95,
        interiorProtection: 2.1,
        currency: 'EUR',
      }
    );
  };

  const updatePrice = (
    acrissCode: string,
    field: keyof AddOnPrice,
    value: any
  ) => {
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
            ...getPriceForCode(acrissCode),
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

      console.log('Sending add-on pricing data:', priceData);

      const response = await fetch('/api/settings/addons', {
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

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          Add-on Pricing by ACRISS Code
        </h2>
        <p className='text-sm text-gray-600'>
          Set daily prices for add-on services for each ACRISS code. These prices
          will be applied when customers book vehicles.
        </p>
      </div>

      {availableCodes.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
          <p className='text-gray-600'>
            No ACRISS codes found. Add vehicles to set add-on pricing.
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          {availableCodes.map((code) => {
            const price = getPriceForCode(code);
            const isSaving = saving === code;
            const isSaved = savedCode === code;

            return (
              <div
                key={code}
                className='bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors'
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <span className='inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded'>
                      {code}
                    </span>
                    <span className='text-sm text-gray-500'>ACRISS Code</span>
                  </div>
                  <button
                    onClick={() => savePrice(code)}
                    disabled={isSaving}
                    className={`flex items-center px-6 py-2 rounded-lg transition-all ${
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
                        Save Prices
                      </>
                    )}
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {Object.entries(ADD_ON_LABELS).map(([key, label]) => (
                    <div key={key}>
                      <label className='block text-sm text-gray-600 mb-2'>
                        {label}
                      </label>
                      <div className='relative'>
                        <Euro className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <input
                          type='number'
                          value={
                            price[key as keyof typeof ADD_ON_LABELS] === 0
                              ? ''
                              : price[key as keyof typeof ADD_ON_LABELS] || ''
                          }
                          onChange={(e) =>
                            updatePrice(
                              code,
                              key as keyof AddOnPrice,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='0.00'
                          step='0.01'
                          min='0'
                          className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                        />
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>per day</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className='mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <h4 className='text-gray-900 mb-2'>How Add-on Pricing Works</h4>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>
            • All add-on prices are per day and will be multiplied by rental
            duration
          </li>
          <li>
            • Each ACRISS code can have different pricing for add-ons
          </li>
          <li>• Prices are shown to customers during the booking process</li>
          <li>• Default prices are used if not specifically set for a code</li>
        </ul>
      </div>
    </div>
  );
}
