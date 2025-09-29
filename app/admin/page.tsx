'use client';

import React, { useEffect, useState } from 'react';
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
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
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

const AdminPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const apiUrl = API_URL ? `${API_URL}/api/bookings?admin=true` : `/api/bookings?admin=true`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      return response.json();
    },
    enabled: !!user && user.role === 'admin',
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const token = localStorage.getItem('token');
      const apiUrl = API_URL ? `${API_URL}/api/bookings/${bookingId}` : `/api/bookings/${bookingId}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update booking status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    if (window.confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      updateBookingStatusMutation.mutate({ bookingId, status: newStatus });
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

  if (!user || user.role !== 'admin') {
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

  const bookings = bookingsData?.bookings || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel - All Bookings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 font-semibold text-sm text-gray-600 border-b">
          <div className="min-w-0">Guest</div>
          <div className="min-w-0">Property</div>
          <div className="min-w-0">Check-in</div>
          <div className="min-w-0">Check-out</div>
          <div className="min-w-0">Guests</div>
          <div className="min-w-0">Total</div>
          <div className="min-w-0">Status</div>
          <div className="min-w-0">Actions</div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg">
              No bookings found.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking: Booking) => (
              <div key={booking._id} className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {booking.user.firstName} {booking.user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={booking.user.email}>
                    {booking.user.email}
                  </div>
                </div>
                
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" title={booking.property.title}>
                    {booking.property.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">📍 {booking.property.location}</div>
                </div>
                
                <div className="text-sm">{formatDate(booking.checkIn)}</div>
                <div className="text-sm">{formatDate(booking.checkOut)}</div>
                <div className="text-sm">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</div>
                <div className="text-sm font-semibold text-green-600">${booking.totalPrice}</div>
                
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        disabled={updateBookingStatusMutation.isPending}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        disabled={updateBookingStatusMutation.isPending}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        disabled={updateBookingStatusMutation.isPending}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        disabled={updateBookingStatusMutation.isPending}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingsData?.pagination && bookingsData.pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="text-gray-600">
            Page {bookingsData.pagination.current} of {bookingsData.pagination.pages}
            ({bookingsData.pagination.total} total bookings)
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
