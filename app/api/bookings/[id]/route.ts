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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;
    
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

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied. Admin rights required.' }, { status: 403 });
    }

    const { status } = await request.json();
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        message: 'Invalid status. Must be pending, confirmed, or cancelled' 
      }, { status: 400 });
    }

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('property')
      .populate('user', 'firstName lastName email');
    
    return NextResponse.json({ 
      message: 'Booking status updated successfully', 
      booking: updatedBooking 
    });

  } catch (error) {
    console.error('Booking status update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
