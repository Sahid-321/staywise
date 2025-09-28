import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

// JWT verification function
function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ message: 'Access denied. No token provided.' }, { status: 401 });
    }

    const token = authorization.startsWith('Bearer ') 
      ? authorization.slice(7) 
      : authorization;

    const decoded = verifyToken(token) as any;
    
    const { default: User } = await import('@/models/User');
    const { default: Booking } = await import('@/models/Booking');
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let bookings;
    
    if (user.role === 'admin') {
      bookings = await Booking.find()
        .populate('property')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ user: user._id })
        .populate('property')
        .sort({ createdAt: -1 });
    }
    
    return NextResponse.json({ bookings });

  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ message: 'Access denied. No token provided.' }, { status: 401 });
    }

    const token = authorization.startsWith('Bearer ') 
      ? authorization.slice(7) 
      : authorization;

    const decoded = verifyToken(token) as any;
    
    const { default: User } = await import('@/models/User');
    const { default: Property } = await import('@/models/Property');
    const { default: Booking } = await import('@/models/Booking');
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { propertyId, checkIn, checkOut, guests, specialRequests } = await request.json();

    // Validation
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json({ 
        message: 'Property ID, check-in, check-out dates, and number of guests are required' 
      }, { status: 400 });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    if (!property.isAvailable) {
      return NextResponse.json({ message: 'Property is not available' }, { status: 400 });
    }

    if (guests > property.maxGuests) {
      return NextResponse.json({ 
        message: `Property can accommodate maximum ${property.maxGuests} guests` 
      }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ message: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    // Check for existing bookings (simplified - you might want more complex date overlap logic)
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }
      ]
    });

    if (existingBooking) {
      return NextResponse.json({ message: 'Property is not available for selected dates' }, { status: 400 });
    }

    // Calculate total price
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * property.price;

    const booking = new Booking({
      user: user._id,
      property: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      totalPrice,
      status: 'pending',
      specialRequests: specialRequests || undefined
    });

    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('property')
      .populate('user', 'firstName lastName email');
    
    return NextResponse.json({ 
      message: 'Booking created successfully', 
      booking: populatedBooking 
    }, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
