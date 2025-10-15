import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { firstName, lastName, email, password } = await request.json();

    console.log('Signup attempt for:', email);

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ 
        message: 'All fields are required' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        message: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ 
        message: 'User already exists with this email' 
      }, { status: 400 });
    }

    console.log('Creating new user...');
    // Create new user (password will be automatically hashed by User model pre-save hook)
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    await user.save();
    console.log('User created successfully');

    // Generate JWT token
    const token = signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    console.log('Signup complete');

    // Return token in response body instead of cookie
    return NextResponse.json({ 
      message: 'User created successfully', 
      user: userResponse,
      token: token
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
