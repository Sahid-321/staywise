# StayWise - Property Booking Platform

A complete property booking system with user authentication, property management, and admin controls.

## What This Project Does

StayWise allows users to:
- Browse and filter available properties
- Create accounts and log in securely 
- Book properties for specific dates
- Manage their bookings
- Admin users can approve/reject bookings and manage all properties

## Technology Used

**Frontend:** Next.js 15, TypeScript, Tailwind CSS  
**Backend:** Express.js, MongoDB, JWT Authentication  
**Key Libraries:** React Query, bcrypt, Mongoose

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment** - Create `.env.local` file with:
   ```
   MONGODB_URI=mongodb+srv://sahid:Hd5TKV4MzCy90RKm@ecommerce.qxk5j1r.mongodb.net/staywise
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-staywise-2025
   NEXT_PUBLIC_API_URL=http://localhost:3001
   PORT=3001
   ```

3. **Add sample data**
   ```bash
   node seed.js
   ```

4. **Start the servers** (need 2 terminals):
   ```bash
   # Terminal 1: Backend
   node server.js
   
   # Terminal 2: Frontend  
   npm run dev
   ```

5. **Open the app**: http://localhost:3000

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

This is a standard full-stack setup:
- `app/` - Next.js frontend pages and components
- `models/` - Database schemas 
- `routes/` - API endpoints
- `middleware/` - Authentication logic
- `server.js` - Express server
- `seed.js` - Sample data generator

## Notes

- Images are placeholder photos (not real property photos)
- This is a demo project showing booking system functionality
- Database is hosted on MongoDB Atlas
- All passwords are hashed with bcrypt
