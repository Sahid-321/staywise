import mongoose from 'mongoose';

export interface IProperty extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: 'villa' | 'hotel' | 'apartment' | 'house';
  isAvailable: boolean;
  owner: mongoose.Types.ObjectId;
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

export default mongoose.models.Property || mongoose.model<IProperty>('Property', propertySchema);
