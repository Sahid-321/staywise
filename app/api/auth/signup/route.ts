import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { firstName, lastName, email, password } = await request.json();

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
    const { default: User } = await import('@/models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists with this email' 
      }, { status: 400 });
    }

    // Create new user (password will be automatically hashed by User model pre-save hook)
    const user = new User({
      firstName,
      lastName,
      email,
      password, // Don't hash here - let the User model handle it
      role: 'user'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    return NextResponse.json({ 
      message: 'User created successfully', 
      token, 
      user: userResponse 
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
