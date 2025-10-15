import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import User from '@/models/User';
import { verifyJWT, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyJWT(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = url.searchParams.get('status');
    const adminView = url.searchParams.get('admin');

    // Build filter based on user role
    let filter: any = {};
    
    if (adminView === 'true' && user.role === 'admin') {
      // Admin can see all bookings
      if (status) {
        filter.status = status;
      }
    } else {
      // Regular users can only see their own bookings
      filter.user = user._id;
      if (status) {
        filter.status = status;
      }
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('property', 'title images location price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyJWT(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { propertyId, checkIn, checkOut, guests, specialRequests } = await request.json();

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json({ message: 'Check-in date cannot be in the past' }, { status: 400 });
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ message: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lte: checkInDate },
          checkOut: { $gt: checkInDate }
        },
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gte: checkOutDate }
        },
        {
          checkIn: { $gte: checkInDate },
          checkOut: { $lte: checkOutDate }
        }
      ]
    });

    if (overlappingBooking) {
      return NextResponse.json({ message: 'Property is not available for selected dates' }, { status: 409 });
    }

    // Calculate total price
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = property.price * days;

    // Create booking
    const booking = new Booking({
      user: user._id,
      property: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      specialRequests,
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'firstName lastName email')
      .populate('property', 'title images location price');

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    }, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
