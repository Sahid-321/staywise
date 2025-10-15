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
  propertyType: {
    type: String,
    enum: ['villa', 'hotel', 'apartment', 'house'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'villa', 'plot', 'commercial']
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    }
  },
  area: {
    builtUp: {
      type: Number,
      required: true,
      min: 1
    }
  },
  floor: {
    current: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 1
    }
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
  furnishing: {
    type: String,
    required: true,
    enum: ['furnished', 'semi-furnished', 'unfurnished']
  },
  age: {
    type: String,
    required: true,
    enum: ['under-construction', '0-1-years', '1-5-years', '5-10-years', '10+-years']
  },
  facing: {
    type: String,
    required: true,
    enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']
  },
  contact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
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

// Clear the model from Mongoose cache if it exists (useful during development)
if (mongoose.models.Property) {
  delete mongoose.models.Property;
}

module.exports = mongoose.model('Property', propertySchema);
