'use client';

import { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Car,
  Euro,
  Clock,
  Phone,
  User,
  CreditCard,
  FileDown,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Booking {
  id: string;
  bookingReference: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    company?: string;
    flightNumber?: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    category: string;
    dailyRate: number;
    currency: string;
  };
  vehicleDetails?: {
    make: string;
    model: string;
    category: string;
    images?: string[];
    mainImage?: string;
  };
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  rentalDays: number;
  cdwCoverage: string;
  addOns: Record<string, boolean>;
  pricing: {
    baseDailyRate: number;
    cdwCost: number;
    addOnsCost: number;
    totalDailyRate: number;
    totalCost: number;
  };
  status: string;
  createdAt: string;
}

export default function BookingLookup() {
  const [email, setEmail] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email.trim() || !bookingReference.trim()) {
      setError('Please enter both your booking reference and email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ email: email.trim() });
      if (bookingReference.trim()) {
        params.append('reference', bookingReference.trim());
      }

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.bookings);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBookings([]);
      setSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending',
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Confirmed',
      },
      in_progress: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'In Progress',
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Completed',
      },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSelectedAddOns = (addOns: Record<string, boolean>) => {
    const addOnNames = {
      additionalDriver: 'Additional Driver',
      wifiHotspot: 'WiFi Hotspot',
      roadsideAssistance: 'Roadside Assistance',
      tireProtection: 'Tire & Windshield Protection',
      personalAccident: 'Personal Accident Protection',
      theftProtection: 'Theft Protection',
      extendedTheft: 'Extended Theft Protection',
      interiorProtection: 'Interior Protection',
    };

    return Object.entries(addOns)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => addOnNames[key as keyof typeof addOnNames])
      .filter(Boolean);
  };

  // Helper function to handle Croatian characters for PDF
  const sanitizeForPDF = (text: string): string => {
    const croatianMap: Record<string, string> = {
      č: 'c',
      ć: 'c',
      š: 's',
      ž: 'z',
      đ: 'd',
      Č: 'C',
      Ć: 'C',
      Š: 'S',
      Ž: 'Z',
      Đ: 'D',
    };
    return text.replace(/[čćšžđČĆŠŽĐ]/g, (char) => croatianMap[char] || char);
  };

  const generatePDF = async (booking: Booking) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const darkColor: [number, number, number] = [44, 44, 44];
    const greenColor: [number, number, number] = [22, 101, 52];
    const lightGreen: [number, number, number] = [220, 252, 231];
    const grayColor: [number, number, number] = [107, 114, 128];
    const lightGray: [number, number, number] = [249, 250, 251];

    // Draw header background
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Load and add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = reject;
        logoImg.src = '/img/logo.svg';
      });

      // Create canvas to convert SVG to image data
      const canvas = document.createElement('canvas');
      canvas.width = 239;
      canvas.height = 167;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logoImg, 0, 0, 239, 167);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', 12, 5, 36, 25);
      }
    } catch {
      // Fallback to text if image fails
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('HIT', 20, 28);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('RENT A CAR', 20, 36);
    }

    // Booking Reference in header - SET WHITE COLOR
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BOOKING CONFIRMATION', pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.bookingReference, pageWidth - 20, 32, { align: 'right' });

    let yPos = 60;

    // Status badge
    const statusText =
      booking.status.charAt(0).toUpperCase() +
      booking.status.slice(1).replace('_', ' ');
    const statusColors: Record<string, [number, number, number]> = {
      confirmed: [22, 101, 52],
      pending: [202, 138, 4],
      in_progress: [37, 99, 235],
      completed: [107, 114, 128],
      cancelled: [220, 38, 38],
    };
    const statusBgColors: Record<string, [number, number, number]> = {
      confirmed: [220, 252, 231],
      pending: [254, 249, 195],
      in_progress: [219, 234, 254],
      completed: [243, 244, 246],
      cancelled: [254, 226, 226],
    };

    const statusColor = statusColors[booking.status] || grayColor;
    const statusBgColor = statusBgColors[booking.status] || lightGray;

    // Draw status badge
    doc.setFillColor(...statusBgColor);
    doc.roundedRect(20, yPos - 6, 50, 12, 3, 3, 'F');
    doc.setTextColor(...statusColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, 45, yPos + 2, { align: 'center' });

    // Created date
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Booked on ${formatDateTime(booking.createdAt)}`,
      pageWidth - 20,
      yPos + 2,
      { align: 'right' }
    );

    yPos += 20;

    // Vehicle Section with background
    doc.setFillColor(...lightGray);
    doc.roundedRect(20, yPos, pageWidth - 40, 35, 4, 4, 'F');

    doc.setTextColor(...darkColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(
      sanitizeForPDF(
        `${booking.vehicleInfo.make} ${booking.vehicleInfo.model}`
      ),
      30,
      yPos + 15
    );

    doc.setTextColor(...grayColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(
      sanitizeForPDF(`Category: ${booking.vehicleInfo.category}`),
      30,
      yPos + 27
    );

    yPos += 50;

    // Two column layout for details
    const col1X = 20;
    const col2X = pageWidth / 2 + 10;
    const colWidth = (pageWidth - 60) / 2;

    // Rental Period Section
    doc.setFillColor(...lightGreen);
    doc.roundedRect(col1X, yPos, colWidth, 50, 4, 4, 'F');

    doc.setTextColor(...greenColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RENTAL PERIOD', col1X + 10, yPos + 12);

    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Pickup: ${formatDate(booking.pickupDate)}`,
      col1X + 10,
      yPos + 25
    );
    doc.text(
      `Return: ${formatDate(booking.returnDate)}`,
      col1X + 10,
      yPos + 36
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`${booking.rentalDays} days`, col1X + 10, yPos + 47);

    // Location Section
    doc.setFillColor(...lightGray);
    doc.roundedRect(col2X, yPos, colWidth, 50, 4, 4, 'F');

    doc.setTextColor(...greenColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PICKUP LOCATION', col2X + 10, yPos + 12);

    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizeForPDF(booking.pickupLocation), col2X + 10, yPos + 28);

    yPos += 60;

    // Customer Information
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', col1X, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);

    doc.text(
      sanitizeForPDF(
        `Name: ${booking.clientInfo.firstName} ${booking.clientInfo.lastName}`
      ),
      col1X,
      yPos
    );
    yPos += 7;
    doc.text(`Email: ${booking.clientInfo.email}`, col1X, yPos);
    yPos += 7;
    doc.text(`Phone: ${booking.clientInfo.phoneNumber}`, col1X, yPos);

    if (booking.clientInfo.flightNumber) {
      yPos += 7;
      doc.text(`Flight: ${booking.clientInfo.flightNumber}`, col1X, yPos);
    }
    if (booking.clientInfo.company) {
      yPos += 7;
      doc.text(
        sanitizeForPDF(`Company: ${booking.clientInfo.company}`),
        col1X,
        yPos
      );
    }

    yPos += 15;

    // Services & Coverage
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Services & Coverage', col1X, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(
      `CDW Coverage: ${
        booking.cdwCoverage === 'full' ? 'Full Coverage' : 'Basic Coverage'
      }`,
      col1X,
      yPos
    );

    const selectedAddOns = getSelectedAddOns(booking.addOns);
    if (selectedAddOns.length > 0) {
      yPos += 10;
      doc.text('Add-ons:', col1X, yPos);
      selectedAddOns.forEach((addon) => {
        yPos += 6;
        doc.text(`  • ${addon}`, col1X, yPos);
      });
    }

    // Pricing Section - Bottom right area
    const pricingY = pageHeight - 85;
    const pricingWidth = 100;
    const pricingX = pageWidth - pricingWidth - 20;

    // Pricing box
    doc.setFillColor(...lightGray);
    doc.roundedRect(pricingX, pricingY, pricingWidth, 55, 4, 4, 'F');

    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PRICING', pricingX + 10, pricingY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);

    let priceY = pricingY + 22;
    doc.text('Daily Rate:', pricingX + 10, priceY);
    doc.text(
      `€${booking.pricing.baseDailyRate.toFixed(2)}`,
      pricingX + pricingWidth - 10,
      priceY,
      { align: 'right' }
    );

    priceY += 7;
    doc.text('CDW:', pricingX + 10, priceY);
    doc.text(
      `€${booking.pricing.cdwCost.toFixed(2)}`,
      pricingX + pricingWidth - 10,
      priceY,
      { align: 'right' }
    );

    priceY += 7;
    doc.text('Add-ons:', pricingX + 10, priceY);
    doc.text(
      `€${booking.pricing.addOnsCost.toFixed(2)}`,
      pricingX + pricingWidth - 10,
      priceY,
      { align: 'right' }
    );

    // Total
    priceY += 10;
    doc.setDrawColor(...grayColor);
    doc.setLineWidth(0.3);
    doc.line(
      pricingX + 10,
      priceY - 3,
      pricingX + pricingWidth - 10,
      priceY - 3
    );

    doc.setTextColor(...greenColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pricingX + 10, priceY + 5);
    doc.text(
      `€${booking.pricing.totalCost.toFixed(2)}`,
      pricingX + pricingWidth - 10,
      priceY + 5,
      { align: 'right' }
    );

    // Footer
    doc.setFillColor(...darkColor);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Thank you for choosing HT Rent A Car! | info@htrentacar.com | +385 1 234 5678',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`HT-Booking-${booking.bookingReference}.pdf`);
  };

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Search Form */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6 flex items-center'>
          <Search className='mr-3 h-5 w-5 text-gray-600' />
          Find Your Booking
        </h2>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Booking Reference */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Booking Reference *
            </label>
            <input
              type='text'
              value={bookingReference}
              onChange={(e) =>
                setBookingReference(e.target.value.toUpperCase())
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white text-gray-900 font-mono text-sm placeholder-gray-400'
              placeholder='CAR123456789'
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email Address *
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white text-gray-900 placeholder-gray-400'
              placeholder='your@email.com'
              required
            />
          </div>
        </div>

        <div className='text-sm text-gray-600 mb-6'>
          <p className='flex items-center'>
            <span className='inline-block w-2 h-2 bg-gray-400 rounded-full mr-2'></span>
            Both booking reference and email address are required for security
          </p>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className='w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center'
        >
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Searching...
            </>
          ) : (
            <>
              <Search className='h-4 w-4 mr-2' />
              Find My Bookings
            </>
          )}
        </button>

        {error && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-700 text-sm'>{error}</p>
          </div>
        )}
      </div>

      {/* Bookings Results */}
      {searched && (
        <div className='space-y-6'>
          {bookings.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center'>
              <Car className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No bookings found
              </h3>
              <p className='text-gray-600'>
                No bookings were found for the provided email
                {bookingReference && ' and booking reference'}. Please check
                your details and try again.
              </p>
            </div>
          ) : (
            <>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-white'>
                  Your Bookings ({bookings.length})
                </h2>
              </div>

              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'
                >
                  {/* Booking Header */}
                  <div className='p-6 border-b border-gray-200'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-1'>
                          {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                        </h3>
                        <div className='flex items-center text-sm text-gray-600'>
                          <span className='font-medium'>Reference:</span>
                          <span className='ml-2 font-mono font-semibold text-gray-900'>
                            {booking.bookingReference}
                          </span>
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2'>
                        {getStatusBadge(booking.status)}
                        <div className='text-right'>
                          <div className='text-sm text-gray-500'>
                            Total Cost
                          </div>
                          <div className='text-xl font-bold text-gray-900'>
                            €{booking.pricing.totalCost.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => generatePDF(booking)}
                          className='flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm'
                        >
                          <FileDown className='h-4 w-4' />
                          Download PDF
                        </button>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* Dates */}
                      <div className='flex items-center'>
                        <Calendar className='h-5 w-5 text-gray-400 mr-3' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Rental Period
                          </p>
                          <p className='text-sm text-gray-600'>
                            {formatDate(booking.pickupDate)} -{' '}
                            {formatDate(booking.returnDate)}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {booking.rentalDays} days
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className='flex items-center'>
                        <MapPin className='h-5 w-5 text-gray-400 mr-3' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Pickup Location
                          </p>
                          <p className='text-sm text-gray-600'>
                            {booking.pickupLocation}
                          </p>
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className='flex items-center'>
                        <Euro className='h-5 w-5 text-gray-400 mr-3' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Total Cost
                          </p>
                          <p className='text-lg font-bold text-green-800'>
                            €{booking.pricing.totalCost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      {/* Customer Info */}
                      <div>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                          Customer Information
                        </h4>
                        <div className='space-y-3'>
                          <div className='flex items-center'>
                            <User className='h-4 w-4 text-gray-400 mr-3' />
                            <span className='text-sm text-gray-600'>
                              {booking.clientInfo.firstName}{' '}
                              {booking.clientInfo.lastName}
                            </span>
                          </div>
                          <div className='flex items-center'>
                            <Phone className='h-4 w-4 text-gray-400 mr-3' />
                            <span className='text-sm text-gray-600'>
                              {booking.clientInfo.phoneNumber}
                            </span>
                          </div>
                          {booking.clientInfo.flightNumber && (
                            <div className='flex items-center'>
                              <Clock className='h-4 w-4 text-gray-400 mr-3' />
                              <span className='text-sm text-gray-600'>
                                Flight: {booking.clientInfo.flightNumber}
                              </span>
                            </div>
                          )}
                          {booking.clientInfo.company && (
                            <div className='flex items-center'>
                              <CreditCard className='h-4 w-4 text-gray-400 mr-3' />
                              <span className='text-sm text-gray-600'>
                                Company: {booking.clientInfo.company}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Services & Add-ons */}
                      <div>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                          Services & Coverage
                        </h4>
                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>CDW Coverage:</span>
                            <span className='font-medium text-gray-900'>
                              {booking.cdwCoverage === 'full'
                                ? 'Full Coverage'
                                : 'Basic Coverage'}
                            </span>
                          </div>

                          {getSelectedAddOns(booking.addOns).length > 0 && (
                            <div className='mt-3'>
                              <span className='text-sm text-gray-600 block mb-2'>
                                Selected Add-ons:
                              </span>
                              <div className='flex flex-wrap gap-2'>
                                {getSelectedAddOns(booking.addOns).map(
                                  (addon, index) => (
                                    <span
                                      key={index}
                                      className='px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full'
                                    >
                                      {addon}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booking Timeline */}
                    <div className='mt-6 pt-6 border-t border-gray-200'>
                      <p className='text-sm text-gray-500'>
                        Booking created on {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
