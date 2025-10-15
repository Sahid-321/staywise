'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/ClientProviders';
import { useRouter } from 'next/navigation';
import { formatLocation } from '@/lib/utils';
import { toast } from 'react-toastify';

interface Booking {
  _id: string;
  property: {
    _id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialRequests?: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchMyBookings();
    }
  }, [user, loading, router]);

  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        setBookings([]);
        setLoadingBookings(false);
        return;
      }

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('Please login to cancel booking');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' as const }
            : booking
        ));
        toast.success('Booking cancelled successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}/day`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '📝';
    }
  };

  if (loading || loadingBookings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <div className="text-yellow-400 mr-3">🔒</div>
            <div>
              <h3 className="text-yellow-800 font-semibold">Login Required</h3>
              <p className="text-yellow-600">Please login to view your bookings.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">📋</span>
            My Bookings
          </h1>
          <p className="text-gray-600 mt-2">Manage your property bookings and reservations</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">👤 Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span> {user.email.split('@')[0] || 'N/A'}
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium text-gray-700">Role:</span> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Bookings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              </div>
              <div className="text-blue-500 text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="text-green-500 text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="text-yellow-500 text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-purple-500 text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start browsing properties to make your first booking.</p>
            <a
              href="/properties"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      {/* Booking Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            Booking #{booking._id.slice(-6)}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">🏠 Property Details</h4>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium text-gray-900">{booking.property.title}</p>
                            <p className="text-gray-600">📍 {formatLocation(booking.property.location)}</p>
                            <p className="text-gray-600">
                              💰 {formatPrice(booking.property.price)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">📅 Booking Details</h4>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium text-gray-700">Check-in:</span> {' '}
                              {new Date(booking.checkIn).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700">Check-out:</span> {' '}
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700">Duration:</span> {' '}
                              {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                            <p>
                              <span className="font-medium text-gray-700">Guests:</span> {' '}
                              {booking.guests}
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              Total Amount: ₹{booking.totalPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Property Image */}
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      {booking.property.images && booking.property.images.length > 0 ? (
                        <div className="w-full lg:w-32 h-24 rounded-lg overflow-hidden">
                          <img
                            src={booking.property.images[0]}
                            alt={booking.property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full lg:w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">📷</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                    <a
                      href={`/properties/${booking.property._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Property
                    </a>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Cancel Booking
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                          Download Receipt
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                          Contact Owner
                        </button>
                      </div>
                    )}

                    {booking.status === 'cancelled' && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                        Booking Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
