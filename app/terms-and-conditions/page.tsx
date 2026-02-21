import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Car, CreditCard, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Hit Rent Croatia',
  description: 'Terms and Conditions for car rental services by Hit Rent Croatia (Turist ekspert d.o.o.). Read our rental agreement terms before booking.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsAndConditions() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Hero Section */}
      <section className='pt-32 pb-12 bg-gradient-to-b from-gray-900 to-gray-800'>
        <div className='container mx-auto px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-green-800 rounded-full mb-6'>
              <FileText className='h-10 w-10 text-white' />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
              Terms and Conditions
            </h1>
            <p className='text-xl text-gray-300'>
              Car rental agreement terms for Hit Rent Croatia
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
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>1. General Information</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                These Terms and Conditions govern the car rental services provided by <strong>Turist ekspert d.o.o.</strong>, trading as <strong>Hit Rent Croatia</strong>.
              </p>
              <div className='bg-gray-50 rounded-xl p-6 space-y-2'>
                <p className='text-sm text-gray-700'><strong>Company:</strong> Turist ekspert d.o.o.</p>
                <p className='text-sm text-gray-700'><strong>Address:</strong> Mejaši 10, Kaštel Gomilica, Croatia</p>
                <p className='text-sm text-gray-700'><strong>OIB:</strong> 43047768927</p>
                <p className='text-sm text-gray-700'><strong>Email:</strong> <a href='mailto:info@hit-rent.com' className='text-green-800 hover:text-green-900 font-medium'>info@hit-rent.com</a></p>
                <p className='text-sm text-gray-700'><strong>Phone:</strong> <a href='tel:+385917224138' className='text-green-800 hover:text-green-900 font-medium'>+385 91 722 4138</a></p>
              </div>
            </div>

            {/* Rental Requirements */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-blue-100 p-3 rounded-lg flex-shrink-0'>
                  <CheckCircle className='h-6 w-6 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>2. Rental Requirements</h2>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    To rent a vehicle from Hit Rent, you must meet the following requirements:
                  </p>
                  <ul className='space-y-3'>
                    <li className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                      <div>
                        <strong className='text-gray-900'>Minimum age:</strong>
                        <span className='text-gray-700'> 21 years old (25+ for premium vehicles)</span>
                      </div>
                    </li>
                    <li className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                      <div>
                        <strong className='text-gray-900'>Driving license:</strong>
                        <span className='text-gray-700'> Valid driver's license held for at least 2 years</span>
                      </div>
                    </li>
                    <li className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                      <div>
                        <strong className='text-gray-900'>Identification:</strong>
                        <span className='text-gray-700'> Valid passport or national ID card</span>
                      </div>
                    </li>
                    <li className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                      <div>
                        <strong className='text-gray-900'>Payment:</strong>
                        <span className='text-gray-700'> Valid credit card in the renter's name</span>
                      </div>
                    </li>
                    <li className='flex items-start gap-3'>
                      <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                      <div>
                        <strong className='text-gray-900'>International drivers:</strong>
                        <span className='text-gray-700'> International Driving Permit (IDP) may be required</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reservation and Booking */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-purple-100 p-3 rounded-lg flex-shrink-0'>
                  <Car className='h-6 w-6 text-purple-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>3. Reservation and Booking</h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>3.1 Making a Reservation</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        Reservations can be made online through our website, by email, or by phone. All reservations are subject to vehicle availability.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>3.2 Confirmation</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        You will receive a booking confirmation via email with your reservation details and rental agreement number.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>3.3 Modifications</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        You may modify your reservation subject to availability. Changes may result in price adjustments.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>3.4 Cancellation</h3>
                      <p className='text-gray-700 leading-relaxed mb-2'>
                        Free cancellation up to 48 hours before pickup. Cancellations within 48 hours may incur charges.
                      </p>
                      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                        <p className='text-sm text-yellow-800'>
                          <strong>Note:</strong> Special rates or promotional bookings may have different cancellation policies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-green-100 p-3 rounded-lg flex-shrink-0'>
                  <CreditCard className='h-6 w-6 text-green-800' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>4. Payment Terms</h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>4.1 Deposit</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        A security deposit is required at pickup and will be blocked on your credit card. The amount varies by vehicle category.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>4.2 Payment Methods</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        We accept major credit cards (Visa, Mastercard, American Express). Payments are processed securely via Stripe.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>4.3 Pricing</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        Rental rates include basic insurance (CDW, TP), unlimited mileage, and VAT. Additional services are charged separately.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>4.4 Fuel Policy</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        Full-to-full policy: Vehicle is provided with a full tank and must be returned with a full tank.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Coverage */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-indigo-100 p-3 rounded-lg flex-shrink-0'>
                  <Shield className='h-6 w-6 text-indigo-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>5. Insurance Coverage</h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>5.1 Basic Insurance (Included)</h3>
                      <ul className='space-y-2'>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'><strong>CDW</strong> - Collision Damage Waiver</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'><strong>TP</strong> - Theft Protection</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'><strong>Third-party liability insurance</strong></span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>5.2 Additional Coverage (Optional)</h3>
                      <ul className='space-y-2'>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Super CDW - Reduced excess</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Personal Accident Insurance (PAI)</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Windscreen and tire protection</span>
                        </li>
                      </ul>
                    </div>
                    <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-red-900 mb-2'>Not Covered:</h4>
                      <ul className='space-y-1 text-sm text-red-800'>
                        <li>• Damage caused by negligence or misuse</li>
                        <li>• Driving under the influence of alcohol or drugs</li>
                        <li>• Off-road driving</li>
                        <li>• Unauthorized drivers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Use */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-orange-100 p-3 rounded-lg flex-shrink-0'>
                  <AlertTriangle className='h-6 w-6 text-orange-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>6. Vehicle Use and Restrictions</h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>6.1 Permitted Use</h3>
                      <p className='text-gray-700 leading-relaxed mb-2'>
                        The vehicle may only be used:
                      </p>
                      <ul className='space-y-2'>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>On paved roads</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>By authorized drivers listed on the rental agreement</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Within Croatia (cross-border travel requires prior approval)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>6.2 Prohibited Use</h3>
                      <ul className='space-y-2'>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Racing, testing, or any competitive events</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Off-road or unpaved roads</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Towing or pushing other vehicles</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Transport of illegal goods or substances</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Subletting or transferring the rental to another person</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup and Return */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>7. Pickup and Return</h2>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>7.1 Pickup</h3>
                  <p className='text-gray-700 leading-relaxed'>
                    Vehicle pickup is available at our offices or selected locations. Please arrive on time with all required documents.
                  </p>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>7.2 Vehicle Inspection</h3>
                  <p className='text-gray-700 leading-relaxed'>
                    Inspect the vehicle thoroughly before departure. Report any existing damage immediately.
                  </p>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>7.3 Return</h3>
                  <p className='text-gray-700 leading-relaxed mb-2'>
                    Return the vehicle at the agreed time and location in the same condition as received.
                  </p>
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                    <p className='text-sm text-yellow-800'>
                      <strong>Late returns:</strong> Additional charges apply for late returns without prior approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accidents and Damage */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='bg-red-100 p-3 rounded-lg flex-shrink-0'>
                  <AlertTriangle className='h-6 w-6 text-red-600' />
                </div>
                <div className='flex-1'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-6'>8. Accidents, Theft, and Damage</h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>8.1 In Case of Accident</h3>
                      <ul className='space-y-2'>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Contact the police immediately</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Notify Hit Rent as soon as possible</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Complete an accident report form</span>
                        </li>
                        <li className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                          <span className='text-gray-700'>Do not admit liability</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>8.2 Theft</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        Report theft immediately to the police and Hit Rent. Provide a copy of the police report.
                      </p>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>8.3 Damage Liability</h3>
                      <p className='text-gray-700 leading-relaxed'>
                        You are liable for damage up to the excess amount specified in your rental agreement, unless covered by additional insurance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Responsibilities */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>9. Customer Responsibilities</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>As a renter, you are responsible for:</p>
              <ul className='space-y-2'>
                {[
                  'Ensuring the vehicle is locked when unattended',
                  'Keeping keys and documents secure',
                  'Regular oil and fluid level checks',
                  'Reporting any mechanical issues immediately',
                  'Paying all fines, tolls, and parking fees',
                  'Returning the vehicle clean and in good condition',
                ].map((item, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='text-gray-700'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liability and Indemnification */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>10. Liability and Indemnification</h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Hit Rent is not liable for:
              </p>
              <ul className='space-y-2'>
                {[
                  'Personal belongings left in the vehicle',
                  'Indirect or consequential damages',
                  'Delays or breakdowns beyond our control',
                  'Violations of traffic laws by the renter',
                ].map((item, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='text-gray-700'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Governing Law */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>11. Governing Law and Jurisdiction</h2>
              <p className='text-gray-700 leading-relaxed'>
                These Terms and Conditions are governed by the laws of the Republic of Croatia. Any disputes shall be resolved by the competent courts in Croatia.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>12. Changes to Terms and Conditions</h2>
              <p className='text-gray-700 leading-relaxed'>
                We reserve the right to modify these Terms and Conditions at any time. Updated terms will be published on this page with a revised date.
              </p>
            </div>

            {/* Contact */}
            <div className='bg-gradient-to-r from-green-800 to-green-900 rounded-2xl shadow-lg p-8 text-white'>
              <h2 className='text-3xl font-bold mb-4'>Questions About Our Terms?</h2>
              <p className='text-green-100 leading-relaxed mb-6'>
                If you have any questions about these Terms and Conditions, please contact us before making a reservation.
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
