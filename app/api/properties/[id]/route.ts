import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const params = await context.params;
    
    // Import User first to ensure it's registered for populate
    const { default: User } = await import('@/models/User');
    const { default: Property } = await import('@/models/Property');
    const property = await Property.findById(params.id).populate('owner', 'firstName lastName');
    
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }
    
    return NextResponse.json({ property });

  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
