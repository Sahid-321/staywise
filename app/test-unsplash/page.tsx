'use client';

import { useState } from 'react';
import { fetchPropertyImages } from '@/lib/imageService';

export default function TestUnsplashPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('luxury apartment');

  const testFetch = async () => {
    setLoading(true);
    console.log('Testing Unsplash API...');
    
    const results = await fetchPropertyImages({
      title: searchQuery,
      category: 'apartment',
      count: 6
    });
    
    console.log('Results:', results);
    setImages(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Unsplash API Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 p-3 border border-gray-300 rounded-md"
            />
            <button
              onClick={testFetch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test API'}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>✅ API Key: {process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ? 'Loaded' : '❌ Missing'}</p>
            <p>🔍 Current search: "{searchQuery}"</p>
            <p>📊 Results: {images.length} images</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Results:</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Result ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Open browser console (F12) to see detailed logs</li>
            <li>2. Click "Test API" button to fetch images from Unsplash</li>
            <li>3. Check console for API response details</li>
            <li>4. If you see fallback images, check the error messages in console</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
