import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import User from '@/models/User';
import { getTokenFromRequest, verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    const user = await User.findById(payload.userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch all bookings with populated data
    const bookings = await Booking.find({})
      .populate('user', 'firstName lastName email')
      .populate('property', 'title location price')
      .sort({ createdAt: -1 });

    // Get stats
    const totalBookings = await Booking.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Calculate total revenue
    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    return NextResponse.json({
      bookings,
      stats: {
        totalBookings,
        totalProperties,
        totalUsers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update booking status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    const user = await User.findById(payload.userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('property', 'title location');

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: `Booking ${status} successfully`, 
      booking 
    });
  } catch (error) {
    console.error('Admin booking update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
