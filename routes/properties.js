const express = require('express');
const Property = require('../models/Property.js');
const { authenticate, authorize } = require('../middleware/auth.js');

const router = express.Router();

// Get all properties (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      propertyType, 
      minPrice, 
      maxPrice, 
      guests 
    } = req.query;

    const filter = { isAvailable: true };

    // Add filters
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (propertyType) {
      filter.propertyType = propertyType;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (guests) {
      filter.maxGuests = { $gte: Number(guests) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single property (public)
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create property (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user._id
    };

    const property = new Property(propertyData);
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate('owner', 'firstName lastName');

    res.status(201).json(populatedProperty);
  } catch (error) {
    console.error('Create property error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
