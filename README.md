# StayWise - Property Booking Platform

A modern full-stack property booking system built with Next.js, featuring user authentication, property management, and admin controls.

## What This Project Does

StayWise allows users to:
- Browse and filter available properties with real-time search
- Create accounts and log in securely with JWT authentication
- Book properties for specific dates with validation
- Manage their bookings and view booking history
- Admin users can approve/reject bookings and manage all properties

## Technology Used

**Full-Stack:** Next.js 15 with App Router, TypeScript, Tailwind CSS  
**Backend:** Next.js API Routes, MongoDB Atlas, JWT Authentication  
**Key Libraries:** React Query (TanStack Query), bcrypt, Mongoose, Axios  
**Deployment:** Vercel-ready with serverless functions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment** - Create `.env.local` file with:
   ```
   MONGODB_URI=mongodb+srv://sahid:Hd5TKV4MzCy90RKm@ecommerce.qxk5j1r.mongodb.net/staywise?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-staywise-2025
   NEXT_PUBLIC_API_URL=
   ```

3. **Add sample data** (optional):
   ```bash
   npm run seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**: http://localhost:3000

## Available Scripts

```bash
npm run dev       # Start development server with Turbopack
npm run build     # Create production build  
npm start         # Start production server
npm run seed      # Populate database with sample data
```

## Production Deployment

**Deploy to Vercel:**
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy
vercel
```

**Environment Variables for Production:**
Set these in your Vercel dashboard:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure JWT secret key
- `NEXT_PUBLIC_API_URL`: Leave empty (uses relative paths)

## Test Accounts

Use these accounts to test different features:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| Admin | admin@staywise.com | admin123 | Can approve bookings, see all users |
| User | john@example.com | user123 | Can book properties |
| User | jane@example.com | user123 | Can book properties |

## How to Use

**As a regular user:**
1. Sign up or log in
2. Browse properties on the homepage
3. Use filters to find what you want
4. Click on a property to see details
5. Fill out the booking form
6. Check "My Bookings" to see your reservations

**As an admin:**
1. Log in with admin account
2. Click "Admin Panel" in the navbar
3. See all bookings from all users
4. Approve or reject pending bookings
5. Filter bookings by status

## Project Structure

Modern Next.js 15 App Router architecture:
- `app/` - Next.js App Router pages, components, and API routes
  - `app/api/` - Serverless API endpoints (auth, properties, bookings)
  - `app/components/` - Reusable React components
  - `app/(pages)/` - Application pages and layouts
- `models/` - Mongoose database schemas (User, Property, Booking)
- `lib/` - Utility functions and configurations  
- `seed.js` - Sample data generator for development

## API Endpoints

All API routes are built with Next.js API Routes:

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication  
- `GET /api/auth/me` - Get current user profile

**Properties:**
- `GET /api/properties` - List all properties (with filtering)
- `GET /api/properties/[id]` - Get property details

**Bookings:**
- `GET /api/bookings` - List user bookings (admin: all bookings)
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/[id]` - Update booking status (admin only)

## Features

- **🔐 Secure Authentication:** JWT-based auth with bcrypt password hashing
- **🏠 Property Management:** Browse, filter, and view detailed property information  
- **📅 Booking System:** Date validation, availability checking, and booking management
- **👨‍💼 Admin Panel:** Approve/reject bookings, manage all properties and users
- **📱 Responsive Design:** Mobile-friendly UI with Tailwind CSS
- **⚡ Performance:** Built with Next.js 15, optimized for production
- **🚀 Serverless Ready:** Deploy seamlessly on Vercel with zero configuration

## Notes

- Images use Picsum Photos for placeholder content
- Database is hosted on MongoDB Atlas (cloud)
- All passwords are securely hashed with bcrypt
- JWT tokens expire after 7 days for security
- Built with modern React patterns and TypeScript for type safety
