import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { verifyJWT, getTokenFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params;

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params;

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

    const booking = await Booking.findById(params.id)
      .populate('user', 'firstName lastName email')
      .populate('property', 'title images location price');

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Check if user can access this booking
    if (booking.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params;

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

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Check if user can modify this booking
    if (booking.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const updateData = await request.json();

    // Prevent users from changing certain fields directly
    if (user.role !== 'admin') {
      delete updateData.totalPrice;
      delete updateData.user;
      delete updateData.property;
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email')
     .populate('property', 'title images location price');

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });

  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params;

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

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Check if user can delete this booking
    if (booking.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Check if booking can be cancelled
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const hoursDifference = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24 && booking.status === 'confirmed') {
      return NextResponse.json({ 
        message: 'Cannot cancel booking less than 24 hours before check-in' 
      }, { status: 400 });
    }

    await Booking.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Booking cancelled successfully' });

  } catch (error) {
    console.error('Booking deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
