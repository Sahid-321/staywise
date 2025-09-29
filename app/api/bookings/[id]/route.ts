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

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    const { status } = await request.json();
    
    // Check if user can perform this action
    if (user.role === 'admin') {
      // Admin can change status to any valid status
      if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return NextResponse.json({ 
          message: 'Invalid status. Must be pending, confirmed, cancelled, or completed' 
        }, { status: 400 });
      }
    } else {
      // Regular users can only cancel their own bookings
      if (booking.user.toString() !== user._id.toString()) {
        return NextResponse.json({ message: 'Access denied. You can only cancel your own bookings.' }, { status: 403 });
      }
      
      if (status !== 'cancelled') {
        return NextResponse.json({ 
          message: 'You can only cancel bookings' 
        }, { status: 400 });
      }
      
      if (booking.status === 'completed' || booking.status === 'cancelled') {
        return NextResponse.json({ 
          message: 'Cannot cancel a booking that is already completed or cancelled' 
        }, { status: 400 });
      }
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
