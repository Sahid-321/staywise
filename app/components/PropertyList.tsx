'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';

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

interface Filters {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  guests: string;
}

const PropertyList = () => {
  const [filters, setFilters] = useState<Filters>({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    guests: ''
  });

  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchProperties = async () => {
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`${API_URL}/api/properties?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', debouncedFilters],
    queryFn: fetchProperties,
  });

  const handleFiltersChange = React.useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  // Don't show loading for initial load with no filters
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  
  if (isLoading && !data && hasActiveFilters) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">
          Error loading properties. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PropertyFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
      
      {isLoading && hasActiveFilters && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Filtering properties...
          </div>
        </div>
      )}
      
      {data?.properties?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg">
            No properties found matching your criteria.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {data?.properties?.map((property: Property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
      
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="text-gray-600">
            Page {data.pagination.current} of {data.pagination.pages}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
