'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Car,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Phone,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import ExternalSourceForm from './ExternalSourceForm';

interface ExternalSource {
  _id: string;
  supplierType: 'company' | 'person';
  supplierName: string;
  supplierContact: string;
  costFromSupplier: number;
  sellingPrice: number;
  profitMargin: number;
  currency: string;
  status: string;
  notes?: string;
}

interface Overbooking {
  id: string;
  bookingReference: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    category: string;
    dailyRate: number;
    currency: string;
  };
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  rentalDays: number;
  pricing: {
    totalCost: number;
  };
  overbookingStatus: string;
  externalSource?: ExternalSource;
  createdAt: string;
}

interface Stats {
  pending: number;
  arranged: number;
  confirmed: number;
}

export default function OverbookingManagement() {
  const [overbookings, setOverbookings] = useState<Overbooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ pending: 0, arranged: 0, confirmed: 0 });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOverbooking, setSelectedOverbooking] = useState<Overbooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchOverbookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/overbookings?status=${selectedStatus}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOverbookings(data.overbookings);
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching overbookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverbookings();
  }, [selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'arranged':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-4 w-4' />;
      case 'arranged':
        return <AlertTriangle className='h-4 w-4' />;
      case 'confirmed':
        return <CheckCircle className='h-4 w-4' />;
      default:
        return <XCircle className='h-4 w-4' />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewDetails = (overbooking: Overbooking) => {
    setSelectedOverbooking(overbooking);
    setShowDetailsModal(true);
  };

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-yellow-600'>Pending</p>
              <p className='text-3xl font-bold text-yellow-900 mt-2'>{stats.pending}</p>
            </div>
            <div className='bg-yellow-200 rounded-full p-3'>
              <Clock className='h-8 w-8 text-yellow-700' />
            </div>
          </div>
          <p className='text-xs text-yellow-600 mt-4'>Awaiting external arrangement</p>
        </div>

        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-blue-600'>Arranged</p>
              <p className='text-3xl font-bold text-blue-900 mt-2'>{stats.arranged}</p>
            </div>
            <div className='bg-blue-200 rounded-full p-3'>
              <AlertTriangle className='h-8 w-8 text-blue-700' />
            </div>
          </div>
          <p className='text-xs text-blue-600 mt-4'>External source arranged</p>
        </div>

        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-green-600'>Confirmed</p>
              <p className='text-3xl font-bold text-green-900 mt-2'>{stats.confirmed}</p>
            </div>
            <div className='bg-green-200 rounded-full p-3'>
              <CheckCircle className='h-8 w-8 text-green-700' />
            </div>
          </div>
          <p className='text-xs text-green-600 mt-4'>Ready to go</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6' aria-label='Tabs'>
            {['all', 'pending', 'arranged', 'confirmed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`${
                  selectedStatus === status
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {status}
                {status !== 'all' && (
                  <span className='ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs'>
                    {stats[status as keyof Stats]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overbookings List */}
        <div className='p-6'>
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
            </div>
          ) : overbookings.length === 0 ? (
            <div className='text-center py-12'>
              <AlertTriangle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No Overbookings</h3>
              <p className='text-gray-500'>
                {selectedStatus === 'all'
                  ? 'No overbookings found'
                  : `No ${selectedStatus} overbookings`}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {overbookings.map((overbooking) => (
                <div
                  key={overbooking.id}
                  className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-3'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {overbooking.bookingReference}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            overbooking.overbookingStatus
                          )}`}
                        >
                          {getStatusIcon(overbooking.overbookingStatus)}
                          <span className='ml-1.5 capitalize'>{overbooking.overbookingStatus}</span>
                        </span>
                      </div>

                      <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='flex items-start space-x-3'>
                          <Car className='h-5 w-5 text-gray-400 mt-0.5' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {overbooking.vehicleInfo.make} {overbooking.vehicleInfo.model}
                            </p>
                            <p className='text-xs text-gray-500'>{overbooking.vehicleInfo.category}</p>
                          </div>
                        </div>

                        <div className='flex items-start space-x-3'>
                          <User className='h-5 w-5 text-gray-400 mt-0.5' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {overbooking.clientInfo.firstName} {overbooking.clientInfo.lastName}
                            </p>
                            <p className='text-xs text-gray-500'>{overbooking.clientInfo.email}</p>
                          </div>
                        </div>

                        <div className='flex items-start space-x-3'>
                          <Calendar className='h-5 w-5 text-gray-400 mt-0.5' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {formatDate(overbooking.pickupDate)} - {formatDate(overbooking.returnDate)}
                            </p>
                            <p className='text-xs text-gray-500'>{overbooking.rentalDays} days</p>
                          </div>
                        </div>
                      </div>

                      {overbooking.externalSource && (
                        <div className='mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-4'>
                              <div className='flex items-center space-x-2'>
                                {overbooking.externalSource.supplierType === 'company' ? (
                                  <Building2 className='h-4 w-4 text-gray-500' />
                                ) : (
                                  <User className='h-4 w-4 text-gray-500' />
                                )}
                                <span className='text-sm font-medium text-gray-700'>
                                  {overbooking.externalSource.supplierName}
                                </span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <Phone className='h-4 w-4 text-gray-500' />
                                <span className='text-sm text-gray-600'>
                                  {overbooking.externalSource.supplierContact}
                                </span>
                              </div>
                            </div>
                            <div className='flex items-center space-x-4'>
                              <div className='text-right'>
                                <p className='text-xs text-gray-500'>Cost</p>
                                <p className='text-sm font-semibold text-red-600'>
                                  {overbooking.externalSource.costFromSupplier}{' '}
                                  {overbooking.externalSource.currency}
                                </p>
                              </div>
                              <div className='text-right'>
                                <p className='text-xs text-gray-500'>Selling</p>
                                <p className='text-sm font-semibold text-green-600'>
                                  {overbooking.externalSource.sellingPrice}{' '}
                                  {overbooking.externalSource.currency}
                                </p>
                              </div>
                              <div className='text-right'>
                                <p className='text-xs text-gray-500'>Profit</p>
                                <p
                                  className={`text-sm font-semibold ${
                                    overbooking.externalSource.profitMargin >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {overbooking.externalSource.profitMargin >= 0 ? (
                                    <TrendingUp className='h-4 w-4 inline mr-1' />
                                  ) : (
                                    <TrendingDown className='h-4 w-4 inline mr-1' />
                                  )}
                                  {overbooking.externalSource.profitMargin}{' '}
                                  {overbooking.externalSource.currency}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewDetails(overbooking)}
                      className='ml-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium'
                    >
                      {overbooking.externalSource ? 'View Details' : 'Arrange'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* External Source Form Modal */}
      {showDetailsModal && selectedOverbooking && (
        <ExternalSourceForm
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          overbooking={selectedOverbooking}
          onSuccess={() => {
            fetchOverbookings();
            setShowDetailsModal(false);
          }}
        />
      )}
    </div>
  );
}
