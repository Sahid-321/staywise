'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../providers/ClientProviders';

interface Booking {
  _id: string;
  property: {
    _id: string;
    title: string;
    location: string;
    images: string[];
    price: number;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialRequests?: string;
  createdAt: string;
}

const MyBookingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const { data: bookingsData, isLoading, error, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const apiUrl = API_URL ? `${API_URL}/api/bookings` : '/api/bookings';
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      return data.bookings || []; // Extract bookings array from response
    },
    enabled: !!user,
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 0, // Consider data immediately stale
  });

  // Refresh bookings when component mounts or user changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const bookings = bookingsData || [];

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const token = localStorage.getItem('token');
      const apiUrl = API_URL ? `${API_URL}/api/bookings/${bookingId}` : `/api/bookings/${bookingId}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    }
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights;
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading bookings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg mb-4">
            You haven't made any bookings yet.
          </div>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking: Booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-full">
                    {booking.property.images && booking.property.images.length > 0 ? (
                      <Image
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {booking.property.title}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        📍 {booking.property.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Check-in</div>
                      <div className="font-semibold">{formatDate(booking.checkIn)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Check-out</div>
                      <div className="font-semibold">{formatDate(booking.checkOut)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Guests</div>
                      <div className="font-semibold">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Duration</div>
                      <div className="font-semibold">
                        {calculateNights(booking.checkIn, booking.checkOut)} night{calculateNights(booking.checkIn, booking.checkOut) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-green-600">
                      Total: ${booking.totalPrice}
                    </div>
                    
                    <div className="flex space-x-3">
                      <a
                        href={`/property/${booking.property._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Property
                      </a>
                      
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancelBookingMutation.isPending}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {booking.specialRequests && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                      <div className="text-sm">{booking.specialRequests}</div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
