import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, FileText, Users, Database, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Family Rent a Car Croatia',
  description: 'Privacy Policy for Family Rent a Car Croatia (Turist ekspert d.o.o.). Learn how we collect, use, and protect your personal data in compliance with GDPR.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Hero Section */}
      <section className='pt-32 pb-12 bg-gradient-to-b from-gray-900 to-gray-800'>
        <div className='container mx-auto px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-green-800 rounded-full mb-6'>
              <Shield className='h-10 w-10 text-white' />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
              Privacy Policy
            </h1>
            <p className='text-xl text-gray-300'>
              Your privacy and data protection are our top priorities
            </p>
            <p className='text-sm text-gray-400 mt-4'>
              Last updated: January 12, 2026
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
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-green-100 p-3 rounded-lg flex-shrink-0'>
                  <FileText className='h-6 w-6 text-green-800' />
                </div>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>1. Introduction</h2>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    This Privacy Policy explains how <strong>Turist ekspert d.o.o.</strong>, a company registered in the Republic of Croatia, collects, uses, and protects personal data when you use our website <strong>hit-rent.com</strong> and our car rental services.
                  </p>
                  <p className='text-gray-700 leading-relaxed'>
                    We process personal data in accordance with the <strong>General Data Protection Regulation (EU) 2016/679 (GDPR)</strong> and applicable Croatian data protection laws.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Controller */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-blue-100 p-3 rounded-lg flex-shrink-0'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>2. Data Controller</h2>
                  <div className='bg-gray-50 rounded-xl p-6 space-y-3'>
                    <div className='flex items-start gap-3'>
                      <span className='font-semibold text-gray-900 min-w-[140px]'>Company name:</span>
                      <span className='text-gray-700'>Turist ekspert d.o.o.</span>
                    </div>
                    <div className='flex items-start gap-3'>
                      <span className='font-semibold text-gray-900 min-w-[140px]'>Registered address:</span>
                      <span className='text-gray-700'>Mejaši 10, Kaštel Gomilica, Croatia</span>
                    </div>
                    <div className='flex items-start gap-3'>
                      <span className='font-semibold text-gray-900 min-w-[140px]'>Company ID (OIB):</span>
                      <span className='text-gray-700'>43047768927</span>
                    </div>
                    <div className='flex items-start gap-3'>
                      <span className='font-semibold text-gray-900 min-w-[140px]'>Email:</span>
                      <a href='mailto:info@hit-rent.com' className='text-green-800 hover:text-green-900 font-medium'>
                        info@hit-rent.com
                      </a>
                    </div>
                    <div className='flex items-start gap-3'>
                      <span className='font-semibold text-gray-900 min-w-[140px]'>Phone:</span>
                      <a href='tel:+385917224138' className='text-green-800 hover:text-green-900 font-medium'>
                        +385 91 722 4138
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Data We Collect */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-purple-100 p-3 rounded-lg flex-shrink-0'>
                  <Database className='h-6 w-6 text-purple-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>3. Personal Data We Collect</h2>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    We may collect and process the following personal data:
                  </p>
                  <ul className='space-y-2'>
                    {[
                      'Full name',
                      'Email address',
                      'Phone number',
                      'Billing and invoicing details',
                      "Copy and details of the driver's license",
                      'Reservation and rental agreement data',
                      'Vehicle-related data during the rental period',
                      'IP address and browser information',
                      'Online payment data',
                    ].map((item, index) => (
                      <li key={index} className='flex items-start gap-3'>
                        <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-gray-700'>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6'>
                    <p className='text-sm text-yellow-800'>
                      <strong>Note:</strong> We do not store full credit card details. Payments are processed securely by <strong>Stripe Payments Europe, Ltd.</strong>, a certified payment service provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purpose of Data Processing */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>4. Purpose of Data Processing</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Personal data is processed for the following purposes:
              </p>
              <div className='grid md:grid-cols-2 gap-4'>
                {[
                  'Processing reservations and rental contracts',
                  'Verifying driver identity and legal eligibility',
                  'Processing online payments and deposits',
                  'Customer communication and support',
                  'Compliance with legal, accounting, and tax obligations',
                  'Fraud prevention and protection of company assets',
                  'Marketing communications (only with explicit consent)',
                ].map((purpose, index) => (
                  <div key={index} className='bg-gray-50 rounded-lg p-4 flex items-start gap-3'>
                    <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='text-gray-700 text-sm'>{purpose}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Basis */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>5. Legal Basis for Processing</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                We process personal data based on:
              </p>
              <div className='space-y-3'>
                <div className='border-l-4 border-green-800 pl-4 py-2'>
                  <h3 className='font-semibold text-gray-900 mb-1'>Performance of a contract</h3>
                  <p className='text-sm text-gray-600'>Article 6(1)(b) GDPR</p>
                </div>
                <div className='border-l-4 border-blue-600 pl-4 py-2'>
                  <h3 className='font-semibold text-gray-900 mb-1'>Legal obligation</h3>
                  <p className='text-sm text-gray-600'>Article 6(1)(c) GDPR</p>
                </div>
                <div className='border-l-4 border-purple-600 pl-4 py-2'>
                  <h3 className='font-semibold text-gray-900 mb-1'>Legitimate interest</h3>
                  <p className='text-sm text-gray-600'>Article 6(1)(f) GDPR</p>
                </div>
                <div className='border-l-4 border-orange-600 pl-4 py-2'>
                  <h3 className='font-semibold text-gray-900 mb-1'>Consent</h3>
                  <p className='text-sm text-gray-600'>Article 6(1)(a) GDPR</p>
                </div>
              </div>
            </div>

            {/* Driver's License Storage */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-red-100 p-3 rounded-lg flex-shrink-0'>
                  <Lock className='h-6 w-6 text-red-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>6. Storage of Driver's License Copies</h2>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Copies of driver's licenses are collected solely for identity verification and rental compliance purposes.
                  </p>
                  <p className='text-gray-700 leading-relaxed mb-4'>Such data is:</p>
                  <ul className='space-y-2'>
                    {[
                      'Accessed only by authorized personnel',
                      'Stored securely with restricted access',
                      'Retained only for the necessary period',
                      'Deleted or anonymized when no longer required, unless legal retention applies',
                    ].map((item, index) => (
                      <li key={index} className='flex items-start gap-3'>
                        <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-gray-700'>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>7. Data Retention</h2>
              <p className='text-gray-700 leading-relaxed'>
                Personal data is retained only for as long as necessary to fulfill the stated purposes or as required by applicable Croatian laws.
              </p>
            </div>

            {/* Data Sharing */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-orange-100 p-3 rounded-lg flex-shrink-0'>
                  <Users className='h-6 w-6 text-orange-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>8. Data Sharing</h2>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Personal data may be shared with:
                  </p>
                  <ul className='space-y-2 mb-4'>
                    {[
                      'Stripe Payments Europe, Ltd. (payment processing)',
                      'IT, hosting, and booking system providers',
                      'Accounting and legal service providers',
                      'Competent public authorities when required by law',
                    ].map((item, index) => (
                      <li key={index} className='flex items-start gap-3'>
                        <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-gray-700'>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className='text-gray-700 leading-relaxed'>
                    All recipients process personal data in compliance with GDPR.
                  </p>
                </div>
              </div>
            </div>

            {/* International Transfers */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-indigo-100 p-3 rounded-lg flex-shrink-0'>
                  <Globe className='h-6 w-6 text-indigo-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>9. International Data Transfers</h2>
                  <p className='text-gray-700 leading-relaxed'>
                    If personal data is transferred outside the European Economic Area (EEA), appropriate safeguards are applied in accordance with GDPR, including Standard Contractual Clauses.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Subject Rights */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-green-100 p-3 rounded-lg flex-shrink-0'>
                  <Shield className='h-6 w-6 text-green-800' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>10. Data Subject Rights</h2>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    You have the right to:
                  </p>
                  <ul className='space-y-2 mb-6'>
                    {[
                      'Access your personal data',
                      'Rectify inaccurate data',
                      'Request erasure where legally permitted',
                      'Restrict or object to processing',
                      'Withdraw consent at any time',
                      'Lodge a complaint with the Croatian Data Protection Authority (AZOP)',
                    ].map((right, index) => (
                      <li key={index} className='flex items-start gap-3'>
                        <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-gray-700'>{right}</span>
                      </li>
                    ))}
                  </ul>
                  <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                    <p className='text-sm text-gray-700 mb-2'>
                      <strong>Supervisory authority:</strong> Croatian Personal Data Protection Agency (AZOP)
                    </p>
                    <a
                      href='https://www.azop.hr'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-green-800 hover:text-green-900 font-medium text-sm'
                    >
                      www.azop.hr →
                    </a>
                    <p className='text-sm text-gray-700 mt-3'>
                      <strong>Requests may be sent to:</strong>{' '}
                      <a href='mailto:info@hit-rent.com' className='text-green-800 hover:text-green-900 font-medium'>
                        info@hit-rent.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-red-100 p-3 rounded-lg flex-shrink-0'>
                  <Lock className='h-6 w-6 text-red-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>11. Data Security</h2>
                  <p className='text-gray-700 leading-relaxed'>
                    We apply appropriate technical and organizational security measures, including SSL encryption, secure servers, access controls, and limited staff access.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-yellow-100 p-3 rounded-lg flex-shrink-0'>
                  <Eye className='h-6 w-6 text-yellow-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>12. Cookies</h2>
                  <p className='text-gray-700 leading-relaxed'>
                    Our website uses cookies for functionality, analytics, and marketing purposes. Cookie preferences can be managed through the cookie consent banner.{' '}
                    <a href='/cookie-policy' className='text-green-800 hover:text-green-900 font-medium underline'>
                      Learn more about our Cookie Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Privacy Policy */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>13. Changes to This Privacy Policy</h2>
              <p className='text-gray-700 leading-relaxed'>
                We reserve the right to update this Privacy Policy. Changes will be published on this page with an updated "Last updated" date.
              </p>
            </div>

            {/* Contact */}
            <div className='bg-gradient-to-r from-green-800 to-green-900 rounded-2xl shadow-lg p-8 text-white'>
              <h2 className='text-3xl font-bold mb-4'>Questions About Your Privacy?</h2>
              <p className='text-green-100 leading-relaxed mb-6'>
                If you have any questions about this Privacy Policy or how we handle your personal data, please contact us.
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
