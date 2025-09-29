const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User.js');
const Property = require('./models/Property.js');
const Booking = require('./models/Booking.js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@gmail.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    await adminUser.save();

    // Create regular users
    const user1 = new User({
      email: 'john@gmail.com',
      password: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
    });
    await user1.save();

    const user2 = new User({
      email: 'jane@gmail.com',
      password: 'user123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user'
    });
    await user2.save();

    console.log('👥 Users created');

    // Sample properties
    const properties = [
      {
        title: 'Luxury Beach Villa in Malibu',
        description: 'Experience ultimate luxury in this stunning beachfront villa overlooking the Pacific Ocean. Features include a private beach access, infinity pool, gourmet kitchen, and panoramic ocean views from every room.',
        price: 450,
        location: 'Malibu, California',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop'
        ],
        amenities: ['Private Beach', 'Infinity Pool', 'Ocean View', 'Gourmet Kitchen', 'WiFi', 'Parking'],
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        propertyType: 'villa',
        owner: adminUser._id
      },
      {
        title: 'Modern Downtown Apartment',
        description: 'Stylish and contemporary apartment in the heart of downtown. Walking distance to restaurants, shopping, and entertainment.',
        price: 180,
        location: 'Downtown Los Angeles, California',
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        ],
        amenities: ['City View', 'Gym Access', 'WiFi', 'Kitchen', 'Parking'],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: 'apartment',
        owner: adminUser._id
      },
      {
        title: 'Cozy Mountain House in Aspen',
        description: 'Charming mountain retreat surrounded by stunning alpine scenery. Perfect for ski trips or summer hiking adventures.',
        price: 320,
        location: 'Aspen, Colorado',
        images: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
        ],
        amenities: ['Mountain View', 'Fireplace', 'Ski Access', 'WiFi', 'Kitchen'],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: 'house',
        owner: adminUser._id
      },
      {
        title: 'Boutique Hotel Suite in SoHo',
        description: 'Elegant hotel suite in trendy SoHo district. Combines luxury amenities with personalized service.',
        price: 280,
        location: 'SoHo, New York',
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop'
        ],
        amenities: ['Concierge', 'Spa Access', 'Room Service', 'WiFi', 'Mini Bar'],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        propertyType: 'hotel',
        owner: adminUser._id
      }
    ];

    // Create properties
    const createdProperties = [];
    for (const propertyData of properties) {
      const property = new Property(propertyData);
      await property.save();
      createdProperties.push(property);
    }

    console.log('🏠 Properties created');

    // Create sample bookings
    const bookings = [
      {
        property: createdProperties[0]._id,
        user: user1._id,
        checkIn: new Date('2025-10-15'),
        checkOut: new Date('2025-10-18'),
        guests: 4,
        totalPrice: 1350, // 3 nights * $450
        status: 'pending',
        specialRequests: 'Late check-in preferred'
      },
      {
        property: createdProperties[1]._id,
        user: user2._id,
        checkIn: new Date('2025-11-01'),
        checkOut: new Date('2025-11-05'),
        guests: 2,
        totalPrice: 720, // 4 nights * $180
        status: 'confirmed'
      },
      {
        property: createdProperties[2]._id,
        user: user1._id,
        checkIn: new Date('2025-12-20'),
        checkOut: new Date('2025-12-25'),
        guests: 6,
        totalPrice: 1600, // 5 nights * $320
        status: 'pending',
        specialRequests: 'Need early check-in for family with kids'
      },
      {
        property: createdProperties[3]._id,
        user: user2._id,
        checkIn: new Date('2025-09-01'),
        checkOut: new Date('2025-09-03'),
        guests: 2,
        totalPrice: 560, // 2 nights * $280
        status: 'completed'
      }
    ];

    // Create bookings
    for (const bookingData of bookings) {
      const booking = new Booking(bookingData);
      await booking.save();
    }

    console.log('📅 Sample bookings created');
    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@gmail.com / admin123');
    console.log('User 1: john@gmail.com / user123');
    console.log('User 2: jane@gmail.com / user123');
    console.log('\n📊 Admin Panel: Login as admin and visit /admin to manage all bookings!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 MongoDB connection closed');
  }
};

// Run the seed script
seedData();
