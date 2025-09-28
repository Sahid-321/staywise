import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const guests = searchParams.get('guests');

    // Your existing filter logic
    let query: any = { isAvailable: true };

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (propertyType && propertyType !== '') {
      query.propertyType = propertyType;
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    if (guests && !isNaN(Number(guests))) {
      query.maxGuests = { $gte: Number(guests) };
    }

    // Import User first to ensure it's registered for populate
    const { default: User } = await import('@/models/User');
    const { default: Property } = await import('@/models/Property');
    const properties = await Property.find(query).populate('owner', 'firstName lastName');
    
    return NextResponse.json({ properties });

  } catch (error) {
    console.error('Properties fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
