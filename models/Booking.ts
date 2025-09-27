import mongoose from 'mongoose';

export interface IBooking extends mongoose.Document {
  property: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IBooking, checkOut: Date) {
        return checkOut > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
