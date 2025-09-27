const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  propertyType: {
    type: String,
    enum: ['villa', 'hotel', 'apartment', 'house'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
