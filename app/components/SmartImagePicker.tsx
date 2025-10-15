'use client';

import React, { useState, useEffect } from 'react';
import { fetchPropertyImages } from '@/lib/imageService';

interface SmartImagePickerProps {
  propertyTitle?: string;
  propertyType: string;
  category: string;
  location?: string;
  onImagesSelected: (images: string[]) => void;
  selectedImages: string[];
}

export default function SmartImagePicker({
  propertyTitle,
  propertyType,
  category,
  location,
  onImagesSelected,
  selectedImages,
}: SmartImagePickerProps) {
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Fetch suggested images when property details change
  useEffect(() => {
    const fetchImages = async () => {
      if (propertyTitle || category || propertyType) {
        setLoading(true);
        setSearchPerformed(true);
        try {
          const images = await fetchPropertyImages({
            title: propertyTitle,
            propertyType,
            category,
            location,
            count: 12,
          });
          setSuggestedImages(images);
        } catch (error) {
          console.error('Error fetching images:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Debounce the fetch to avoid too many API calls
    const timeoutId = setTimeout(fetchImages, 500);
    return () => clearTimeout(timeoutId);
  }, [propertyTitle, propertyType, category, location]);

  const toggleImage = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      onImagesSelected(selectedImages.filter(img => img !== imageUrl));
    } else {
      if (selectedImages.length < 10) {
        onImagesSelected([...selectedImages, imageUrl]);
      }
    }
  };

  const addCustomUrl = () => {
    if (customUrl && !selectedImages.includes(customUrl)) {
      if (selectedImages.length < 10) {
        onImagesSelected([...selectedImages, customUrl]);
        setCustomUrl('');
      }
    }
  };

  const removeImage = (imageUrl: string) => {
    onImagesSelected(selectedImages.filter(img => img !== imageUrl));
  };

  return (
    <div className="space-y-6">
      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Images ({selectedImages.length}/10)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {selectedImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom URL Input */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Image URL</h4>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addCustomUrl}
            disabled={!customUrl || selectedImages.length >= 10}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Suggested Images */}
      <div>
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            🔍 Smart Image Search Results
            <span className="text-xs text-gray-500 ml-2">(Click to select)</span>
          </h4>
          {propertyTitle && (
            <p className="text-xs text-gray-500 mt-1">
              Searching for: "{propertyTitle}"
            </p>
          )}
          {!propertyTitle && (
            <p className="text-xs text-gray-500 mt-1">
              💡 Add a property title above to get more relevant images
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Searching Unsplash for images...</p>
          </div>
        ) : suggestedImages.length === 0 && searchPerformed ? (
          <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              No images found. Try adding a property title or use custom URLs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {suggestedImages.map((url, index) => (
              <div
                key={index}
                onClick={() => toggleImage(url)}
                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                  selectedImages.includes(url)
                    ? 'ring-4 ring-blue-500 scale-95'
                    : 'hover:ring-2 hover:ring-gray-300 hover:scale-105'
                }`}
              >
                <img
                  src={url}
                  alt={`Suggestion ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                {selectedImages.includes(url) && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImages.length === 0 && (
        <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select at least one image for your property
          </p>
        </div>
      )}

      {selectedImages.length >= 10 && (
        <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            ✓ Maximum 10 images selected
          </p>
        </div>
      )}
    </div>
  );
}
