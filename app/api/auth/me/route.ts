import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    // Fallback to cookie if no Authorization header
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }
    
    console.log('Auth check - Token present:', !!token, 'Source:', authHeader ? 'header' : 'cookie');
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    // Verify token
    console.log('Verifying token...');
    const payload = verifyJWT(token);
    console.log('Token verified for user:', payload.userId);
    
    // Get user from database
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      console.log('User not found in database:', payload.userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('User authenticated:', user.email);

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
