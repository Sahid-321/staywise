'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import BookingForm from '../../components/BookingForm';
import { useAuth } from '../../providers/ClientProviders';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: 'villa' | 'hotel' | 'apartment' | 'house';
  isAvailable: boolean;
  owner?: {
    firstName?: string;
    lastName?: string;
  };
}

const PropertyDetailPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const propertyId = params.id as string;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const { data: propertyData, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const apiUrl = API_URL ? `${API_URL}/api/properties/${propertyId}` : `/api/properties/${propertyId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch property');
      }
      const data = await response.json();
      return data.property; // Extract the property from the response
    },
  });

  const property = propertyData;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Property not found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'villa': return '🏖️';
      case 'hotel': return '🏨';
      case 'apartment': return '🏢';
      case 'house': return '🏠';
      default: return '🏠';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.images && property.images.length > 0 ? (
                property.images.slice(0, 4).map((image: string, index: number) => (
                  <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${property.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=No+Image';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Images Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Info */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{getPropertyTypeIcon(property.propertyType)}</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {property.propertyType}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <span className="mr-6">📍 {property.location}</span>
              <span className="mr-6">👥 Up to {property.maxGuests} guests</span>
              <span className="mr-6">🛏️ {property.bedrooms} bedrooms</span>
              <span>🚿 {property.bathrooms} bathrooms</span>
            </div>
            
            <div className="text-2xl font-bold text-green-600 mb-6">
              ${property.price} / night
            </div>
            
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Hosted by</h3>
            <p className="text-gray-700">
              {property.owner?.firstName && property.owner?.lastName 
                ? `${property.owner.firstName} ${property.owner.lastName}`
                : 'Host information not available'
              }
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {user ? (
              <BookingForm property={property} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Book this property</h3>
                <p className="text-gray-600 mb-4">
                  Please log in to make a booking.
                </p>
                <a
                  href="/login"
                  className="block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In to Book
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
