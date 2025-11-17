'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  Car,
  FileText,
  DollarSign,
} from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface ProfileContentProps {
  user: UserSession;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        // Reload page after 1 second to show updated info
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
    });
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Profile</h1>
          <p className='text-gray-600 mt-2'>Manage your account information</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Profile Card */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              {/* Header */}
              <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8'>
                <div className='flex items-center space-x-4'>
                  <div className='h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg'>
                    <User className='h-10 w-10 text-emerald-600' />
                  </div>
                  <div className='flex-1'>
                    <h2 className='text-2xl font-bold text-white'>
                      {user.fullName || 'User'}
                    </h2>
                    <p className='text-emerald-100 text-sm mt-1'>{user.email}</p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className='px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium flex items-center space-x-2'
                    >
                      <Edit2 className='h-4 w-4' />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Personal Information
                </h3>

                <div className='space-y-4'>
                  {/* First Name */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                      />
                    ) : (
                      <p className='text-gray-900 bg-gray-50 px-4 py-2 rounded-lg'>
                        {user.first_name || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                      />
                    ) : (
                      <p className='text-gray-900 bg-gray-50 px-4 py-2 rounded-lg'>
                        {user.last_name || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <div className='flex items-center space-x-2 text-gray-900 bg-gray-50 px-4 py-2 rounded-lg'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <span>{user.email}</span>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>Email cannot be changed</p>
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Member Since
                    </label>
                    <div className='flex items-center space-x-2 text-gray-900 bg-gray-50 px-4 py-2 rounded-lg'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <span>
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className='flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200'>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className='flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {loading ? (
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      ) : (
                        <>
                          <Save className='h-4 w-4' />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <X className='h-4 w-4' />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Role Card */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center'>
                  <Shield className='h-5 w-5 text-emerald-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Account Role</h3>
                  <p className='text-sm text-gray-500'>Your access level</p>
                </div>
              </div>
              <div className='bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2'>
                <p className='text-emerald-800 font-semibold capitalize'>Admin</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Quick Stats</h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Car className='h-4 w-4 text-gray-400' />
                    <span className='text-sm text-gray-600'>Vehicles Added</span>
                  </div>
                  <span className='font-semibold text-gray-900'>-</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <FileText className='h-4 w-4 text-gray-400' />
                    <span className='text-sm text-gray-600'>Total Bookings</span>
                  </div>
                  <span className='font-semibold text-gray-900'>-</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <DollarSign className='h-4 w-4 text-gray-400' />
                    <span className='text-sm text-gray-600'>Total Revenue</span>
                  </div>
                  <span className='font-semibold text-gray-900'>-</span>
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-4'>
                Stats will be available soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
