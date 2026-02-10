'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Cookie, Shield, Eye, Target } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Hero Section */}
      <section className='pt-32 pb-12 bg-gradient-to-b from-gray-900 to-gray-800'>
        <div className='container mx-auto px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-green-800 rounded-full mb-6'>
              <Cookie className='h-10 w-10 text-white' />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
              Cookie Policy
            </h1>
            <p className='text-xl text-gray-300'>
              Transparency about how we use cookies on our website
            </p>
            <p className='text-sm text-gray-400 mt-4'>
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-16'>
        <div className='container mx-auto px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto'>

            {/* Introduction */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>What Are Cookies?</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                At Family Rent a Car Croatia, we use cookies to enhance your browsing experience, remember your preferences, and understand how you use our website to continually improve our services.
              </p>
            </div>

            {/* Types of Cookies */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>Types of Cookies We Use</h2>

              <div className='space-y-6'>
                {/* Necessary Cookies */}
                <div className='border-l-4 border-green-800 pl-6 py-2'>
                  <div className='flex items-start gap-4 mb-3'>
                    <div className='bg-green-100 p-2 rounded-lg flex-shrink-0'>
                      <Shield className='h-6 w-6 text-green-800' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                        1. Necessary Cookies
                      </h3>
                      <span className='inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-3'>
                        Always Active
                      </span>
                      <p className='text-gray-700 leading-relaxed mb-3'>
                        These cookies are essential for the website to function properly. They enable basic functions like:
                      </p>
                      <ul className='list-disc list-inside space-y-2 text-gray-700 ml-4'>
                        <li>Page navigation and access to secure areas</li>
                        <li>Remembering your cookie consent preferences</li>
                        <li>Maintaining security and fraud prevention</li>
                        <li>Session management for logged-in users</li>
                      </ul>
                      <p className='text-gray-600 text-sm mt-3 italic'>
                        Note: These cookies cannot be disabled as they are necessary for the website to work.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className='border-l-4 border-blue-600 pl-6 py-2'>
                  <div className='flex items-start gap-4 mb-3'>
                    <div className='bg-blue-100 p-2 rounded-lg flex-shrink-0'>
                      <Eye className='h-6 w-6 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                        2. Analytics Cookies
                      </h3>
                      <span className='inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3'>
                        Optional
                      </span>
                      <p className='text-gray-700 leading-relaxed mb-3'>
                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously:
                      </p>
                      <ul className='list-disc list-inside space-y-2 text-gray-700 ml-4'>
                        <li>Number of visitors and page views</li>
                        <li>How long visitors stay on pages</li>
                        <li>Which pages are most popular</li>
                        <li>Where visitors come from (referral sources)</li>
                        <li>Technical information (browser type, device, screen size)</li>
                      </ul>
                      <div className='bg-blue-50 p-4 rounded-lg mt-4'>
                        <p className='text-sm text-gray-700'>
                          <strong>We use:</strong> Google Analytics 4 (GA4) with IP anonymization enabled to protect your privacy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className='border-l-4 border-purple-600 pl-6 py-2'>
                  <div className='flex items-start gap-4 mb-3'>
                    <div className='bg-purple-100 p-2 rounded-lg flex-shrink-0'>
                      <Target className='h-6 w-6 text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                        3. Marketing Cookies
                      </h3>
                      <span className='inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full mb-3'>
                        Optional
                      </span>
                      <p className='text-gray-700 leading-relaxed mb-3'>
                        These cookies track your online activity to help advertisers deliver more relevant advertising:
                      </p>
                      <ul className='list-disc list-inside space-y-2 text-gray-700 ml-4'>
                        <li>Display personalized advertisements</li>
                        <li>Limit how many times you see an ad</li>
                        <li>Measure the effectiveness of advertising campaigns</li>
                        <li>Track conversions from ads</li>
                      </ul>
                      <p className='text-gray-600 text-sm mt-3 italic'>
                        Note: These cookies may share information with third-party advertisers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookie Duration */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>How Long Do Cookies Last?</h2>

              <div className='space-y-4'>
                <div className='bg-gray-50 p-5 rounded-xl'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Session Cookies</h3>
                  <p className='text-gray-700 text-sm'>
                    These are temporary cookies that expire when you close your browser. They help maintain your session as you navigate between pages.
                  </p>
                </div>

                <div className='bg-gray-50 p-5 rounded-xl'>
                  <h3 className='font-semibold text-gray-900 mb-2'>Persistent Cookies</h3>
                  <p className='text-gray-700 text-sm'>
                    These remain on your device for a set period (up to 1 year for preference cookies, 2 years for analytics). They remember your choices when you return to our website.
                  </p>
                </div>
              </div>
            </div>

            {/* Managing Cookies */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>How to Manage Cookies</h2>

              <div className='space-y-6'>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                    On Our Website
                  </h3>
                  <p className='text-gray-700 leading-relaxed mb-3'>
                    You can control which cookies we use by adjusting your preferences in our cookie banner when you first visit the site, or by clicking the "Cookie Settings" button in our footer.
                  </p>
                  <button
                    onClick={() => {
                      // Clear cookie consent to show banner again
                      if (typeof window !== 'undefined') {
                        document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        window.location.reload();
                      }
                    }}
                    className='inline-flex items-center px-6 py-3 bg-green-800 hover:bg-green-900 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg'
                  >
                    <Cookie className='h-5 w-5 mr-2' />
                    Update Cookie Preferences
                  </button>
                </div>

                <div className='border-t pt-6'>
                  <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                    In Your Browser
                  </h3>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:
                  </p>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>Google Chrome</h4>
                      <p className='text-sm text-gray-600'>
                        Settings → Privacy and security → Cookies and other site data
                      </p>
                    </div>
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>Mozilla Firefox</h4>
                      <p className='text-sm text-gray-600'>
                        Settings → Privacy & Security → Cookies and Site Data
                      </p>
                    </div>
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>Safari</h4>
                      <p className='text-sm text-gray-600'>
                        Preferences → Privacy → Manage Website Data
                      </p>
                    </div>
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>Microsoft Edge</h4>
                      <p className='text-sm text-gray-600'>
                        Settings → Cookies and site permissions → Manage cookies
                      </p>
                    </div>
                  </div>

                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4'>
                    <p className='text-sm text-yellow-800'>
                      <strong>Warning:</strong> Blocking all cookies may prevent some parts of our website from working correctly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>Third-Party Cookies</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics and deliver advertisements:
              </p>

              <div className='space-y-3'>
                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <div className='flex-shrink-0 w-2 h-2 bg-green-800 rounded-full mt-2'></div>
                  <div>
                    <strong className='text-gray-900'>Google Analytics:</strong>
                    <span className='text-gray-700'> Helps us understand how visitors use our site</span>
                  </div>
                </div>
                <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'>
                  <div className='flex-shrink-0 w-2 h-2 bg-green-800 rounded-full mt-2'></div>
                  <div>
                    <strong className='text-gray-900'>Google Ads:</strong>
                    <span className='text-gray-700'> May be used for remarketing purposes (only if you accept marketing cookies)</span>
                  </div>
                </div>
              </div>

              <p className='text-gray-600 text-sm mt-6 italic'>
                These third-party services have their own privacy policies. We encourage you to read them to understand how they use your data.
              </p>
            </div>

            {/* Contact */}
            <div className='bg-gradient-to-r from-green-800 to-green-900 rounded-2xl shadow-lg p-8 text-white'>
              <h2 className='text-3xl font-bold mb-4'>Questions About Our Cookie Policy?</h2>
              <p className='text-green-100 leading-relaxed mb-6'>
                If you have any questions about how we use cookies or this cookie policy, please don't hesitate to contact us.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <a
                  href='mailto:info@hit-rent.com'
                  className='inline-flex items-center justify-center px-6 py-3 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition-all duration-200'
                >
                  Email Us
                </a>
                <a
                  href='tel:+385917224138'
                  className='inline-flex items-center justify-center px-6 py-3 bg-green-950 text-white font-semibold rounded-lg hover:bg-black transition-all duration-200'
                >
                  Call Us
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
