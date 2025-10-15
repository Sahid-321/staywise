'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Bed, Bath, Square, Star, Filter, SlidersHorizontal, ChevronDown, ArrowUpDown, Home, Building2, Hotel, Store } from 'lucide-react';
import { formatLocation } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  location: string | { address?: string; city?: string; state?: string; pincode?: string };
  price: number;
  propertyType: 'rent' | 'villa' | 'hotel' | 'apartment' | 'house';
  category: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  featured?: boolean;
  verified?: boolean;
  rating?: number;
  amenities?: string[];
  maxGuests?: number;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'rent'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [bhkType, setBhkType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch properties from API
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched properties for home page:', data.properties?.length || 0);
        
        // Transform properties to match frontend interface
        const transformedProperties = data.properties.map((property: any) => ({
          id: property._id,
          title: property.title,
          location: property.location,
          price: property.price,
          propertyType: property.propertyType,
          category: property.propertyType,
          area: 1000, // Default
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          images: property.images || [],
          featured: property.featured || false,
          verified: property.verified || false,
          rating: 4.5,
          amenities: property.amenities || [],
          maxGuests: property.maxGuests || 1,
        }));
        
        setProperties(transformedProperties);
        setFilteredProperties(transformedProperties);
      } else {
        console.error('Failed to fetch properties');
        setProperties([]);
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle search button click
  const handleSearch = () => {
    console.log('Search triggered with:', {
      searchQuery,
      selectedType,
      selectedCategory,
      bhkType,
      priceRange
    });
    // The useEffect will automatically filter when any state changes
    // This just provides visual feedback that search was triggered
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  // Filter and sort properties
  useEffect(() => {
    let filtered = properties;

    // Filter by property type (rent only)
    if (selectedType === 'rent') {
      // Consider properties under 100000 as rent
      filtered = filtered.filter(property => property.price < 100000);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(property => {
        const locationStr = formatLocation(property.location).toLowerCase();
        return property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               locationStr.includes(searchQuery.toLowerCase());
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(property => 
        property.category.toLowerCase() === selectedCategory.toLowerCase() ||
        property.propertyType.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by BHK type
    if (bhkType !== 'all') {
      const bhkNumber = parseInt(bhkType);
      if (bhkNumber === 5) {
        // 5+ BHK
        filtered = filtered.filter(property => property.bedrooms >= 5);
      } else {
        filtered = filtered.filter(property => property.bedrooms === bhkNumber);
      }
    }

    // Filter by price range (rental prices only)
    if (priceRange !== 'all') {
      filtered = filtered.filter(property => {
        const price = property.price;
        switch (priceRange) {
          case 'under-10k':
            return price < 10000;
          case '10k-20k':
            return price >= 10000 && price < 20000;
          case '20k-30k':
            return price >= 20000 && price < 30000;
          case '30k-50k':
            return price >= 30000 && price < 50000;
          case 'above-50k':
            return price >= 50000;
          default:
            return true;
        }
      });
    }

    // Sort properties
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = [...filtered].reverse();
        break;
      case 'relevance':
      default:
        // Keep original order
        break;
    }

    setFilteredProperties(filtered);
  }, [searchQuery, selectedType, selectedCategory, bhkType, priceRange, sortBy, properties]);

  const formatPrice = (price: number) => {
    // Auto-detect: if price < 100000, it's rent (per day), otherwise sale (total)
    const isRent = price < 100000;
    
    if (isRent) {
      return `₹${price.toLocaleString()}/day`;
    } else {
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
      if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
      return `₹${price.toLocaleString()}`;
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Tabs */}
      <div className="bg-white border-b shadow-sm">
       
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 text-center">
            Find Your Dream Property
          </h1>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Search from thousands of rental properties
          </p>

          {/* Search Bar */}
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Location Search */}
              <div className="md:col-span-4 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1 text-red-600" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, locality, or project name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 transition-all"
                />
              </div>

              {/* Property Type */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1 text-red-600" />
                  Property Type
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white transition-all"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="hotel">Hotel</option>
                </select>
              </div>

              {/* BHK Type */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Bed className="w-4 h-4 inline mr-1 text-red-600" />
                  Bedrooms (BHK)
                </label>
                <select
                  value={bhkType}
                  onChange={(e) => setBhkType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white transition-all"
                >
                  <option value="all">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2 flex items-end">
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 inline mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 text-red-600 hover:text-red-700 font-medium flex items-center transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Budget/Price Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Budget Range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white transition-all"
                    >
                      <option value="all">Any Budget</option>
                      <option value="under-10k">Under ₹10,000/day</option>
                      <option value="10k-20k">₹10,000 - ₹20,000/day</option>
                      <option value="20k-30k">₹20,000 - ₹30,000/day</option>
                      <option value="30k-50k">₹30,000 - ₹50,000/day</option>
                      <option value="above-50k">Above ₹50,000/day</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="md:col-span-2 flex items-end">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setPriceRange('all');
                        setBhkType('all');
                        setSearchQuery('');
                        setSortBy('relevance');
                        setSelectedType('all');
                      }}
                      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold shadow-sm hover:shadow"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Properties Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header with Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredProperties.length} Properties Found
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedType === 'all' ? 'All' : 'For Rent'} properties
              {searchQuery && ` in ${searchQuery}`}
            </p>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <div className="text-gray-900 text-2xl font-semibold mb-2">No properties found</div>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or clear filters</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange('all');
                setBhkType('all');
                setSearchQuery('');
                setSortBy('relevance');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-56 object-cover"
                  />
                  {property.featured && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      ⭐ Featured
                    </div>
                  )}
                  {property.verified && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      ✓ Verified
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-2 flex-1">
                      {property.title}
                    </h3>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">
                      {formatLocation(property.location)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-600 mb-4 text-sm border-t border-b border-gray-100 py-3">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      <span className="font-medium">{property.area} sqft</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPrice(property.price)}
                      </div>
                    </div>
                    {property.rating && (
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm font-semibold text-gray-700">
                          {property.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
