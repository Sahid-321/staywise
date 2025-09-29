'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface Filters {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  guests: string;
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: Filters) => void;
  initialFilters?: Filters;
  properties?: any[]; // Add properties prop to get price range
}

const PropertyFilters = ({ onFiltersChange, initialFilters, properties = [] }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState<Filters>(initialFilters || {
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    guests: ''
  });

  // Track if this is the initial render to avoid calling parent with empty filters
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Sync with parent's initial filters
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Notify parent when filters change (but not on initial render with empty filters)
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      // Only call parent if we have some filters set initially
      const hasFilters = Object.values(filters).some(value => value !== '');
      if (hasFilters) {
        onFiltersChange(filters);
      }
    } else {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange, isInitialRender]);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    // Only prevent negative values for price fields
    if ((key === 'minPrice' || key === 'maxPrice') && value !== '') {
      const numValue = parseFloat(value);
      if (numValue < 0) return; // Don't allow negative values
    }
    
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      guests: ''
    };
    setFilters(clearedFilters);
    // Immediately notify parent of cleared state
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="villa">Villa</option>
            <option value="hotel">Hotel</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
          </select>
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Min $"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Max $"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests
          </label>
          <select
            value={filters.guests}
            onChange={(e) => handleFilterChange('guests', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">Any</option>
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5">5+ Guests</option>
          </select>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
