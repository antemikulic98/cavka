'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    fullName: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Login Card */}
        <div className='bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10'>
          <div>
            <div className='flex justify-center mb-8'>
              <img
                src='/img/logo-black.svg'
                alt='Logo'
                className='h-16 w-auto'
              />
            </div>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {/* Email Input */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-800 mb-3'
                >
                  Email Address
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors duration-200' />
                  </div>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={form.email}
                    onChange={handleChange}
                    className='appearance-none rounded-2xl relative block w-full px-4 py-4 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 text-base bg-gray-50/80 hover:bg-white focus:bg-white shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 font-medium'
                    placeholder='your@email.com'
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-semibold text-gray-800 mb-3'
                >
                  Password
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors duration-200' />
                  </div>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    value={form.password}
                    onChange={handleChange}
                    className='appearance-none rounded-2xl relative block w-full px-4 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 text-base bg-gray-50/80 hover:bg-white focus:bg-white shadow-sm hover:shadow-md focus:shadow-md transition-all duration-200 font-medium'
                    placeholder='Enter your password'
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-emerald-50 rounded-r-2xl transition-all duration-200 group'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5 text-gray-500 hover:text-emerald-600 group-hover:text-emerald-600 transition-colors duration-200' />
                    ) : (
                      <Eye className='h-5 w-5 text-gray-500 hover:text-emerald-600 group-hover:text-emerald-600 transition-colors duration-200' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50/80 border border-red-200 rounded-2xl p-4 shadow-sm'>
                <p className='text-sm text-red-700 font-semibold text-center'>
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                <span className='absolute left-0 inset-y-0 flex items-center pl-6'>
                  <LogIn className='h-5 w-5' />
                </span>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
