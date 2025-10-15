import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import User from '@/models/User';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = { isAvailable: true };

    // Location filter (search in city, state, or address)
    if (location && location.trim()) {
      query.$or = [
        { 'location.city': { $regex: location.trim(), $options: 'i' } },
        { 'location.state': { $regex: location.trim(), $options: 'i' } },
        { 'location.address': { $regex: location.trim(), $options: 'i' } },
      ];
    }

    // Property type filter (rent only)
    if (propertyType && propertyType !== '') {
      query.propertyType = propertyType;
    }

    // Category filter (apartment/house/villa/etc)
    if (category && category !== '') {
      query.category = category;
    }

    // Price range filter
    if (minPrice && !isNaN(Number(minPrice))) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    // Bedrooms filter
    if (bedrooms && !isNaN(Number(bedrooms))) {
      query.bedrooms = Number(bedrooms);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch properties with pagination
    const properties = await Property.find(query)
      .populate('owner', 'firstName lastName email')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    return NextResponse.json({
      properties,
      pagination: {
        current: page,
        total,
        pages: Math.ceil(total / limit),
        limit,
      },
    });

  } catch (error) {
    console.error('Properties fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyJWT(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const propertyData = await request.json();

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.price) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, price' },
        { status: 400 }
      );
    }

    // Parse location string into components (e.g., "Sector 62, Noida, UP" -> address, city, state)
    let locationObj = {
      address: propertyData.location || 'Not specified',
      city: 'Not specified',
      state: 'Not specified',
      pincode: '000000'
    };

    if (propertyData.location && typeof propertyData.location === 'string') {
      const parts = propertyData.location.split(',').map((p: string) => p.trim());
      if (parts.length >= 3) {
        locationObj.address = parts[0];
        locationObj.city = parts[1];
        locationObj.state = parts[2];
      } else if (parts.length === 2) {
        locationObj.address = parts[0];
        locationObj.city = parts[1];
        locationObj.state = parts[1];
      } else {
        locationObj.address = propertyData.location;
        locationObj.city = propertyData.location;
        locationObj.state = 'India';
      }
    }

    // Map category to propertyType (normalize values)
    let propertyType = propertyData.propertyType || propertyData.category || 'apartment';
    const categoryMapping: { [key: string]: string } = {
      'apartment': 'apartment',
      'house': 'house',
      'villa': 'villa',
      'plot': 'apartment', // Map plot to apartment as it's not in propertyType enum
      'commercial': 'apartment' // Map commercial to apartment as it's not in propertyType enum
    };
    propertyType = categoryMapping[propertyType.toLowerCase()] || 'apartment';

    // Generate realistic Unsplash images based on property category
    const getPropertyImages = (category: string, title: string) => {
      const imagesByCategory: { [key: string]: string[] } = {
        'apartment': [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        ],
        'house': [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        ],
        'villa': [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        ],
        'commercial': [
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop',
        ],
        'plot': [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&h=600&fit=crop',
        ],
      };

      const images = imagesByCategory[category.toLowerCase()] || imagesByCategory['apartment'];
      return images;
    };

    const propertyImages = getPropertyImages(propertyData.category || 'apartment', propertyData.title);

    // Set defaults for required fields if not provided
    const floorCurrent = propertyData.floor && propertyData.floor > 0 ? propertyData.floor : 0;
    const floorTotal = propertyData.totalFloors && propertyData.totalFloors > 0 ? propertyData.totalFloors : 1;
    
    const property = new Property({
      title: propertyData.title,
      description: propertyData.description,
      price: propertyData.price,
      propertyType: propertyType,
      category: propertyData.category || 'apartment',
      location: locationObj,
      area: {
        builtUp: propertyData.area && propertyData.area > 0 ? propertyData.area : 1000
      },
      floor: {
        current: floorCurrent,
        total: floorTotal
      },
      bedrooms: propertyData.bedrooms && propertyData.bedrooms > 0 ? propertyData.bedrooms : 1,
      bathrooms: propertyData.bathrooms && propertyData.bathrooms > 0 ? propertyData.bathrooms : 1,
      furnishing: propertyData.furnishing || 'unfurnished',
      age: propertyData.age || '1-5-years',
      facing: propertyData.facing || 'north',
      contact: {
        name: propertyData.ownerName || user.email.split('@')[0],
        phone: propertyData.ownerPhone || '0000000000'
      },
      maxGuests: propertyData.maxGuests && propertyData.maxGuests > 0 ? propertyData.maxGuests : (propertyData.bedrooms * 2 || 2),
      images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : propertyImages,
      amenities: propertyData.amenities || [],
      owner: user._id,
      isAvailable: true,
    });

    await property.save();

    return NextResponse.json(
      { message: 'Property created successfully', property },
      { status: 201 }
    );

  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
