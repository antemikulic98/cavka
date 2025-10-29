'use client';

import { useState } from 'react';
import { Shield, Settings } from 'lucide-react';
import InsurancePricing from './InsurancePricing';

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState<'insurance' | 'general'>('insurance');

  const tabs = [
    { id: 'insurance' as const, label: 'Insurance Pricing', icon: Shield },
    { id: 'general' as const, label: 'General Settings', icon: Settings },
  ];

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
        <p className='text-gray-600 mt-2'>
          Manage your system settings and pricing
        </p>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-xl shadow-sm border mb-6'>
        <div className='flex border-b border-gray-200'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className='h-5 w-5 mr-2' />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className='p-6'>
          {activeTab === 'insurance' && <InsurancePricing />}
          {activeTab === 'general' && (
            <div className='text-center py-12'>
              <Settings className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>General settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
