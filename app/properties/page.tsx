'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'sale' | 'rent';
  category: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  features: string[];
  owner: {
    name: string;
    phone: string;
  };
  views: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        const mockProperties: Property[] = [
          {
            id: '1',
            title: '3BHK Luxury Apartment in Noida',
            description: 'Spacious 3BHK apartment with modern amenities.',
            price: 8500000,
            location: 'Sector 62, Noida, UP',
            type: 'sale',
            category: 'apartment',
            area: 1200,
            bedrooms: 3,
            bathrooms: 2,
            features: ['Parking', '24/7 Security', 'Gym'],
            owner: {
              name: 'Rajesh Kumar',
              phone: '+91 98765 43210',
            },
            views: 245,
          },
          {
            id: '2',
            title: 'Modern Villa with Garden',
            description: 'Beautiful 4BHK villa with spacious garden.',
            price: 45000,
            location: 'Gurgaon, Haryana',
            type: 'rent',
            category: 'villa',
            area: 2500,
            bedrooms: 4,
            bathrooms: 3,
            features: ['Garden', 'Parking', 'Furnished'],
            owner: {
              name: 'Priya Sharma',
              phone: '+91 87654 32109',
            },
            views: 189,
          },
        ];

        setProperties(mockProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const formatPrice = (price: number, type: 'rent' | 'sale') => {
    if (type === 'rent') {
      return `₹${price.toLocaleString()}/month`;
    } else {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(1)} Cr`;
      } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(1)} L`;
      } else {
        return `₹${price.toLocaleString()}`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties for Sale & Rent</h1>
          <p className="text-gray-600">Find your perfect property from our extensive collection</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold">{properties.length}</span> properties found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center relative">
                <span className="text-white text-lg font-semibold">📷 Property Image</span>
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
                  property.type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
              </div>

              <div className="p-6">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">{property.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">📍</span>
                    {property.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">📐</span>
                    {property.area} sq ft
                    {property.bedrooms && (
                      <span className="ml-4">
                        🛏️ {property.bedrooms} BHK
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(property.price, property.type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    👁️ {property.views} views
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">👤 Owner Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span> {property.owner.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {property.owner.phone}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">✨ Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    {property.type === 'rent' ? 'Book Now' : 'Contact Owner'}
                  </button>
                  <Link
                    href={`/properties/${property.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
