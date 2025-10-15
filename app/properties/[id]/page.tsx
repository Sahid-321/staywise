'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '../../providers/ClientProviders';
import { formatLocation } from '@/lib/utils';
import { toast } from 'react-toastify';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'rent';
  category: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  features: string[];
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  views: number;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get tomorrow's date as minimum checkout
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/properties/${propertyId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched property:', data);
        
        // Transform the data to match frontend interface
        const transformedProperty: Property = {
          id: data._id,
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location, // Simple string from database
          type: 'rent', // All properties are rentals
          category: data.propertyType, // Map propertyType to category
          area: 1000, // Default area
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          images: data.images || [],
          features: data.amenities || [],
          owner: {
            id: data.owner?._id || data.owner,
            name: data.owner?.firstName ? `${data.owner.firstName} ${data.owner.lastName}` : 'Property Owner',
            email: data.owner?.email || '',
            phone: data.owner?.phone || 'Contact for details',
          },
          status: data.isAvailable ? 'active' as 'active' | 'inactive' : 'inactive' as 'active' | 'inactive',
          createdAt: data.createdAt,
          views: Math.floor(Math.random() * 500) + 50,
        };
        
        setProperty(transformedProperty);
      } else if (response.status === 404) {
        console.log('Property not found');
        setProperty(null);
      } else {
        console.error('Failed to fetch property, status:', response.status);
        setProperty(null);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    // All properties are rentals, display per day
    return `₹${price.toLocaleString()}/day`;
  };

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !property) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff > 0 ? daysDiff * property.price : 0;
  };

  const handleBookProperty = async () => {
    if (!user) {
      alert('Please login to book a property');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      setBookingLoading(true);
      
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('Please login to make a booking');
        return;
      }
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          totalPrice: calculateTotalPrice(),
        }),
      });

      if (response.ok) {
        toast.success('Booking request submitted successfully!');
        setShowBookingForm(false);
        setCheckInDate('');
        setCheckOutDate('');
        setGuests(1);
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error('Property is not available for the selected dates. Please choose different dates.');
        } else {
          toast.error(errorData.message || 'Failed to submit booking request');
        }
      }
    } catch (error) {
      console.error('Error booking property:', error);
      toast.error('Failed to submit booking request. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (property) {
      const message = `Hi ${property.owner.name}, I'm interested in your property: ${property.title}. Please contact me.`;
      const whatsappUrl = `https://wa.me/${property.owner.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
            <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Images */}
            <div className="mb-8">
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Main Image */}
                  <div className="h-64 md:h-80 rounded-lg overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={`${property.title} - Main`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {property.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="h-32 md:h-39 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${property.title} - Image ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      </div>
                    ))}
                    {/* Show placeholder for missing images */}
                    {property.images.length < 5 && Array.from({ length: 5 - property.images.length }).map((_, index) => (
                      <div key={`placeholder-${index}`} className="h-32 md:h-39 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xl">No images available</span>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      For Rent
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                      {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    👁️ {property.views} views
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                    <div className="text-sm text-gray-600">sq ft</div>
                  </div>
                  {property.bedrooms && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">📍</div>
                    <div className="text-sm text-gray-600">Prime Location</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Location</h3>
                <p className="text-gray-600">{formatLocation(property.location)}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Description</h3>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded">
                      <span className="text-sm">✓</span>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Property Owner</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{property.owner.name}</p>
                  <p className="text-gray-600">{property.owner.phone}</p>
                  <p className="text-gray-600">{property.owner.email}</p>
                </div>
                <button
                  onClick={handleContactOwner}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📱 Contact via WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatPrice(property.price)}
                </div>
                <p className="text-sm text-gray-600">Daily rate</p>
              </div>

              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  📅 Book This Property
                </button>
              ) : (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Book Your Stay</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={today}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={checkInDate || tomorrowString}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                        <select
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>

                      {checkInDate && checkOutDate && calculateTotalPrice() > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Rate per day:</span>
                            <span>₹{property.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Number of days:</span>
                            <span>{Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24))}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-1">
                            <span>Total:</span>
                            <span>₹{calculateTotalPrice().toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowBookingForm(false)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBookProperty}
                          disabled={bookingLoading || !checkInDate || !checkOutDate}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                        </button>
                      </div>
                    </div>
                  )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  No booking fees. Cancel free of charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
