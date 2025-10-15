// Image service for fetching property images from Unsplash
// Note: For production, add your Unsplash API key to .env.local as NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
const UNSPLASH_ACCESS_KEY = '5cmTcvoralYOSACznT8rBmdZVfWbjxwi7gMlyPXfRLY';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

interface PropertyImageParams {
  title?: string;
  propertyType?: string;
  location?: string;
  category?: string;
  count?: number;
}

/**
 * Fetch relevant property images from Unsplash based on property details
 * @param params Property details for smart image search
 * @returns Array of image URLs
 */
export async function fetchPropertyImages(params: PropertyImageParams): Promise<string[]> {
  const { title, propertyType, location, category, count = 5 } = params;
  
  // Build intelligent search query
  let searchQuery = '';
  
  if (title) {
    // Extract meaningful keywords from title (remove common words)
    const keywords = title
      .toLowerCase()
      .replace(/\b(in|at|near|with|for|rent|sale|bhk|bedroom|bathroom)\b/gi, '')
      .trim();
    searchQuery = keywords;
  }
  
  if (!searchQuery && (category || propertyType)) {
    searchQuery = (category || propertyType || 'apartment');
  }
  
  // Default if still empty
  if (!searchQuery) {
    searchQuery = 'luxury apartment interior';
  }
  
  // Add location context if available
  if (location) {
    const city = location.split(',')[0].trim();
    searchQuery += ` ${city}`;
  }
  
  // Add property context
  searchQuery += ' luxury interior real estate property home';

  console.log('🔍 Searching Unsplash for:', searchQuery);
  console.log('🔑 Using API Key:', UNSPLASH_ACCESS_KEY ? 'Present' : 'Missing');

  try {
    const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape&content_filter=high`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    console.log('📊 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Unsplash API error:', response.status, response.statusText, errorText);
      return getFallbackImages(category || propertyType || 'apartment', count);
    }

    const data = await response.json();
    console.log('✅ Unsplash API success:', data.results?.length, 'images found');
    
    if (data.results && data.results.length > 0) {
      const imageUrls = data.results.map((photo: any) => photo.urls.regular);
      console.log('🖼️ Returning', imageUrls.length, 'real images from Unsplash');
      return imageUrls;
    }

    console.log('⚠️ No results from Unsplash, using fallback images');
    return getFallbackImages(category || propertyType || 'apartment', count);
  } catch (error) {
    console.error('💥 Error fetching images from Unsplash:', error);
    return getFallbackImages(category || propertyType || 'apartment', count);
  }
}

/**
 * Fallback images when API fails or no key is provided
 */
function getFallbackImages(propertyType: string, count: number): string[] {
  const fallbackImageSets: Record<string, string[]> = {
    apartment: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
      'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800',
    ],
    house: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    villa: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    ],
    hotel: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    ],
    commercial: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    ],
    plot: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    ],
  };

  const images = fallbackImageSets[propertyType.toLowerCase()] || fallbackImageSets['apartment'];
  return images.slice(0, count);
}

/**
 * Client-side version that doesn't require API key
 * Uses curated Unsplash images based on property type
 */
export function getPropertyImagesByType(propertyType: string, category?: string, count: number = 5): string[] {
  const type = (category || propertyType).toLowerCase();
  return getFallbackImages(type, count);
}

/**
 * Generate search query for property images
 */
export function generateImageSearchQuery(params: PropertyImageParams): string {
  const { propertyType, location, category } = params;
  const parts = [];
  
  if (category) parts.push(category);
  if (propertyType && propertyType !== category) parts.push(propertyType);
  if (location) {
    const city = location.split(',')[0].trim();
    if (city) parts.push(city);
  }
  
  parts.push('interior', 'real estate');
  
  return parts.join(' ');
}
