import mongoose from 'mongoose';

export interface IProperty extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  images: string[];
  amenities: string[];
  maxGuests?: number;
  propertyType: 'villa' | 'hotel' | 'apartment' | 'house' | 'rent';
  category: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
  area: {
    builtUp: number; // in sq ft
    carpet?: number; // in sq ft
    plot?: number; // in sq ft
  };
  bedrooms: number;
  bathrooms: number;
  floor: {
    current: number;
    total: number;
  };
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  parking: number;
  age: 'under-construction' | '0-1-years' | '1-5-years' | '5-10-years' | '10+-years'; // age category
  facing: 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west';
  isAvailable: boolean;
  featured: boolean;
  verified: boolean;
  owner: mongoose.Types.ObjectId;
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

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
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    address: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    pincode: { type: String, required: false, trim: true },
    latitude: { type: Number },
    longitude: { type: Number }
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
    required: false,
    min: 1,
    max: 20
  },
  propertyType: {
    type: String,
    enum: ['villa', 'hotel', 'apartment', 'house', 'rent'],
    required: true
  },
  category: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'plot', 'commercial'],
    required: true
  },
  area: {
    builtUp: { type: Number, required: false, min: 1 },
    carpet: { type: Number, min: 1 },
    plot: { type: Number, min: 1 }
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
  floor: {
    current: { type: Number, required: false, min: 0 },
    total: { type: Number, required: false, min: 1 }
  },
  furnishing: {
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished'],
    required: false
  },
  parking: {
    type: Number,
    default: 0,
    min: 0
  },
  age: {
    type: String,
    required: false,
    enum: ['under-construction', '0-1-years', '1-5-years', '5-10-years', '10+-years']
  },
  facing: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'],
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    name: { type: String, required: false, trim: true },
    phone: { type: String, required: false, trim: true },
    email: { type: String, trim: true }
  }
}, {
  timestamps: true
});

// Clear the model from Mongoose cache if it exists (useful during development)
if (mongoose.models.Property) {
  delete mongoose.models.Property;
}

export default mongoose.model<IProperty>('Property', propertySchema);
