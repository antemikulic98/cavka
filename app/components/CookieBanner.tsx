'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import Cookies from 'js-cookie';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = Cookies.get('cookie-consent');
    if (!cookieConsent) {
      // Show banner after short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(cookieConsent);
        if (saved && typeof saved === 'object' && 'necessary' in saved) {
          setPreferences(saved);
          if (saved.analytics) {
            initializeAnalytics();
          }
        } else {
          // Legacy cookie value (e.g. "accepted") - treat as accept all, re-save properly
          Cookies.remove('cookie-consent');
          setTimeout(() => setShowBanner(true), 1000);
        }
      } catch (e) {
        // Invalid cookie value (not JSON) - remove and show banner again
        Cookies.remove('cookie-consent');
        setTimeout(() => setShowBanner(true), 1000);
      }
    }
  }, []);

  const initializeAnalytics = () => {
    // Initialize Google Analytics 4
    // Replace G-XXXXXXXXXX with your actual GA4 measurement ID
    if (typeof window !== 'undefined' && !(window as any).gtag) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX', {
          'anonymize_ip': true,
          'cookie_flags': 'SameSite=None;Secure'
        });
      `;
      document.head.appendChild(script2);
    }
  };

  const savePreferences = (prefs: CookiePreferences) => {
    // Save preferences for 1 year
    Cookies.set('cookie-consent', JSON.stringify(prefs), { expires: 365 });
    setPreferences(prefs);

    // Initialize analytics if accepted
    if (prefs.analytics) {
      initializeAnalytics();
    }

    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className='fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up'>
        <div className='bg-gradient-to-r from-gray-900 to-gray-800 border-t-4 border-green-800 shadow-2xl'>
          <div className='container mx-auto px-4 py-6 lg:px-8'>
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
              {/* Icon & Text */}
              <div className='flex items-start gap-4 flex-1'>
                <div className='bg-green-800 p-3 rounded-lg flex-shrink-0'>
                  <Cookie className='h-6 w-6 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-white font-bold text-lg mb-2'>
                    We value your privacy
                  </h3>
                  <p className='text-gray-300 text-sm leading-relaxed'>
                    We use cookies to enhance your browsing experience, serve personalized
                    content, and analyze our traffic. By clicking "Accept All", you consent
                    to our use of cookies.{' '}
                    <a
                      href='/cookie-policy'
                      className='text-green-400 hover:text-green-300 underline'
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
                <button
                  onClick={() => setShowSettings(true)}
                  className='flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 border border-gray-600'
                >
                  <Settings className='h-4 w-4 mr-2' />
                  Customize
                </button>
                <button
                  onClick={acceptNecessary}
                  className='px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 border border-gray-600'
                >
                  Necessary Only
                </button>
                <button
                  onClick={acceptAll}
                  className='px-6 py-3 bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-950 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg'
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl'>
              <div className='flex items-center gap-3'>
                <div className='bg-green-100 p-2 rounded-lg'>
                  <Cookie className='h-6 w-6 text-green-800' />
                </div>
                <h2 className='text-2xl font-bold text-gray-900'>Cookie Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='h-6 w-6 text-gray-600' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6 space-y-6'>
              <p className='text-gray-700 leading-relaxed'>
                We use cookies to provide you with the best possible experience. You can
                choose which types of cookies you want to allow. Please note that blocking
                some types of cookies may impact your experience on our website.
              </p>

              {/* Necessary Cookies */}
              <div className='border border-gray-200 rounded-xl p-5 bg-gray-50'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Necessary Cookies
                    </h3>
                    <span className='px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>
                      Always Active
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      checked={true}
                      disabled
                      className='sr-only'
                    />
                    <div className='w-12 h-6 bg-green-800 rounded-full cursor-not-allowed'>
                      <div className='w-5 h-5 bg-white rounded-full shadow transform translate-x-6 translate-y-0.5'></div>
                    </div>
                  </div>
                </div>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  These cookies are essential for the website to function properly. They
                  enable basic functions like page navigation, secure areas access, and
                  remembering your cookie preferences. The website cannot function properly
                  without these cookies.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className='border border-gray-200 rounded-xl p-5 hover:border-green-300 transition-colors'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Analytics Cookies
                  </h3>
                  <button
                    onClick={() =>
                      setPreferences({ ...preferences, analytics: !preferences.analytics })
                    }
                    className='relative'
                  >
                    <div
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.analytics ? 'bg-green-800' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                          preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      ></div>
                    </div>
                  </button>
                </div>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  These cookies help us understand how visitors interact with our website by
                  collecting and reporting information anonymously. This helps us improve our
                  website and services. We use Google Analytics for this purpose.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className='border border-gray-200 rounded-xl p-5 hover:border-green-300 transition-colors'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Marketing Cookies
                  </h3>
                  <button
                    onClick={() =>
                      setPreferences({ ...preferences, marketing: !preferences.marketing })
                    }
                    className='relative'
                  >
                    <div
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.marketing ? 'bg-green-800' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                          preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      ></div>
                    </div>
                  </button>
                </div>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  These cookies track your online activity to help advertisers deliver more
                  relevant advertising or to limit how many times you see an ad. These
                  cookies can share that information with other organizations or advertisers.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end rounded-b-2xl'>
              <button
                onClick={() => setShowSettings(false)}
                className='px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200'
              >
                Cancel
              </button>
              <button
                onClick={saveCustomPreferences}
                className='px-6 py-3 bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-950 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg'
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
