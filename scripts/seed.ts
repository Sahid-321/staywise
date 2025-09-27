import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Property from '../models/Property';
import Booking from '../models/Booking';

// Load environment variables
dotenv.config({ path: '.env.local' });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/staywise');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@staywise.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create regular user
    const regularUser = new User({
      email: 'user@example.com',
      password: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
    });
    await regularUser.save();
    console.log('Regular user created');

    // Sample properties data
    const propertiesData = [
      {
        title: 'Luxury Beachfront Villa',
        description: 'Experience ultimate luxury in this stunning beachfront villa with panoramic ocean views. Features include a private pool, direct beach access, and modern amenities throughout.',
        price: 350,
        location: 'Malibu, California',
        images: [
          'https://picsum.photos/800/600?random=1',
          'https://picsum.photos/800/600?random=2'
        ],
        amenities: ['Private Pool', 'Beach Access', 'WiFi', 'Kitchen', 'Air Conditioning', 'Parking'],
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        propertyType: 'villa',
        owner: adminUser._id
      },
      {
        title: 'Cozy Downtown Apartment',
        description: 'Modern apartment in the heart of the city. Walking distance to restaurants, shops, and public transportation. Perfect for business travelers or city explorers.',
        price: 120,
        location: 'New York, NY',
        images: [
          'https://picsum.photos/800/600?random=3',
          'https://picsum.photos/800/600?random=4'
        ],
        amenities: ['WiFi', 'Kitchen', 'Heating', 'Elevator', 'Gym Access'],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: 'apartment',
        owner: adminUser._id
      },
      {
        title: 'Mountain Retreat House',
        description: 'Escape to this peaceful mountain house surrounded by nature. Features hiking trails nearby, a fireplace for cozy evenings, and breathtaking mountain views.',
        price: 180,
        location: 'Aspen, Colorado',
        images: [
          'https://picsum.photos/800/600?random=5',
          'https://picsum.photos/800/600?random=6'
        ],
        amenities: ['Fireplace', 'Mountain Views', 'Hiking Trails', 'WiFi', 'Kitchen', 'Parking'],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: 'house',
        owner: adminUser._id
      },
      {
        title: 'Boutique Hotel Suite',
        description: 'Elegant hotel suite with premium amenities and concierge service. Located in the business district with easy access to conference centers and fine dining.',
        price: 250,
        location: 'Chicago, IL',
        images: [
          'https://picsum.photos/800/600?random=7',
          'https://picsum.photos/800/600?random=8'
        ],
        amenities: ['Room Service', 'Concierge', 'Gym', 'WiFi', 'Mini Bar', 'Spa Access'],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        propertyType: 'hotel',
        owner: adminUser._id
      },
      {
        title: 'Rustic Farmhouse',
        description: 'Charming farmhouse perfect for a peaceful getaway. Surrounded by rolling hills and farmland, this property offers a true countryside experience.',
        price: 200,
        location: 'Tuscany, Italy',
        images: [
          'https://picsum.photos/800/600?random=9',
          'https://picsum.photos/800/600?random=10'
        ],
        amenities: ['Garden', 'Country Views', 'Kitchen', 'Fireplace', 'WiFi', 'Parking'],
        maxGuests: 10,
        bedrooms: 5,
        bathrooms: 3,
        propertyType: 'house',
        owner: adminUser._id
      },
      {
        title: 'Modern City Loft',
        description: 'Stylish loft apartment with exposed brick walls and modern furnishings. Located in a trendy neighborhood with great nightlife and restaurants.',
        price: 140,
        location: 'San Francisco, CA',
        images: [
          'https://picsum.photos/800/600?random=11',
          'https://picsum.photos/800/600?random=12'
        ],
        amenities: ['Modern Design', 'WiFi', 'Kitchen', 'Rooftop Access', 'Parking'],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: 'apartment',
        owner: adminUser._id
      }
    ];

    // Create properties
    const createdProperties = [];
    for (const propertyData of propertiesData) {
      const property = new Property(propertyData);
      await property.save();
      createdProperties.push(property);
    }
    console.log(`${createdProperties.length} properties created`);

    console.log('Sample data seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@staywise.com / admin123');
    console.log('User: user@example.com / user123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the seed script
seedData();
