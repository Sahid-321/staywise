'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
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
    <Link href={`/property/${property._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <div className="relative h-48">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No Image</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
              {getPropertyTypeIcon(property.propertyType)} {property.propertyType}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              ${property.price}/night
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
            {property.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {property.description}
          </p>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="mr-4">📍 {property.location}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>👥 {property.maxGuests} guests</span>
              <span>🛏️ {property.bedrooms} bed</span>
              <span>🚿 {property.bathrooms} bath</span>
            </div>
          </div>
          
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
