const express = require('express');
const Booking = require('../models/Booking.js');
const Property = require('../models/Property.js');
const { authenticate, authorize } = require('../middleware/auth.js');

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property', 'title location images price')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (admin only)
router.get('/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('property', 'title location price')
      .populate('user', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Property ID, check-in, check-out, and guests are required' });
    }

    // Check if property exists and is available
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ message: 'Property is not available' });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Validate guests
    if (guests > property.maxGuests) {
      return res.status(400).json({ 
        message: `Maximum guests allowed: ${property.maxGuests}` 
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Property is already booked for the selected dates' 
      });
    }

    // Calculate total price (nights * property price)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;

    // Create booking
    const booking = new Booking({
      property: propertyId,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      specialRequests: specialRequests || ''
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location images price')
      .populate('user', 'firstName lastName email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status (admin only)
router.put('/:id/status', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    booking.status = status;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location')
      .populate('user', 'firstName lastName email');

    res.json(populatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel booking (user can cancel their own bookings)
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    const bookingUserId = booking.user.toString();
    if (bookingUserId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    // Can only cancel pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location')
      .populate('user', 'firstName lastName email');

    res.json(populatedBooking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
