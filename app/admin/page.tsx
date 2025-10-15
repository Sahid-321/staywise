'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers/ClientProviders';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Booking {
  _id: string;
  property: {
    _id: string;
    title: string;
    location: any;
    price: number;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Check authentication and fetch data
  useEffect(() => {
    console.log('Admin page - Loading:', loading, 'User:', user);
    
    if (loading) return;
    
    if (!user) {
      console.log('No user, redirecting to login');
      setTimeout(() => router.push('/login'), 100);
      return;
    }
    
    if (user.role !== 'admin') {
      console.log('User is not admin:', user.role, 'redirecting to home');
      toast.error('Access denied. Admin privileges required.');
      setTimeout(() => router.push('/'), 100);
      return;
    }
    
    console.log('Admin authenticated! User role:', user.role);
    fetchAdminData();
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('Please login again');
        router.push('/login');
        return;
      }

      console.log('Fetching admin data...');
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      console.log('Admin data received:', data);
      
      setBookings(data.bookings || []);
      setStats({
        totalProperties: data.stats?.totalProperties || 0,
        totalBookings: data.stats?.totalBookings || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
        totalUsers: data.stats?.totalUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Booking ${newStatus === 'confirmed' ? 'approved' : 'rejected'} successfully!`);
        fetchAdminData();
      } else {
        toast.error('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Error updating booking');
    }
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

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Redirecting...</p>
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
            <span className="mr-3">🏠</span>
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dataLoading ? '...' : stats.totalProperties}
                </p>
              </div>
              <div className="text-blue-500 text-4xl">🏠</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dataLoading ? '...' : stats.totalBookings}
                </p>
              </div>
              <div className="text-purple-500 text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-sm text-gray-500 mt-1">(Confirmed Bookings)</p>
                <p className="text-3xl font-bold text-green-600">
                  {dataLoading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}
                </p>
              </div>
              <div className="text-green-500 text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-orange-600">
                  {dataLoading ? '...' : stats.totalUsers}
                </p>
              </div>
              <div className="text-orange-500 text-4xl">👥</div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and track all property bookings</p>
          </div>

          <div className="p-6">
            {dataLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Bookings will appear here when users make reservations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => {
                      // Skip bookings with deleted properties or users
                      if (!booking.property || !booking.user) {
                        return null;
                      }
                      
                      return (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.property?.title || 'Property Deleted'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.user?.firstName || ''} {booking.user?.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-500">{booking.user?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.guests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{booking.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleBookingStatusChange(booking._id, 'confirmed')}
                                  className="text-green-600 hover:text-green-900 font-medium"
                                >
                                  ✓ Approve
                                </button>
                                <button 
                                  onClick={() => handleBookingStatusChange(booking._id, 'cancelled')}
                                  className="text-red-600 hover:text-red-900 font-medium"
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            {booking.status !== 'pending' && (
                              <span className="text-gray-400">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
