import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingReference: {
    type: String,
    unique: true,
    index: true,
  },

  // Client Information
  clientInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    countryCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    company: { type: String },
    flightNumber: { type: String },
    promoCode: { type: String },
  },

  // Vehicle Information
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  vehicleInfo: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, required: true },
    dailyRate: { type: Number, required: true },
    currency: { type: String, required: true, default: 'EUR' },
  },

  // Rental Details
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  rentalDays: { type: Number, required: true },

  // Coverage & Add-ons
  cdwCoverage: {
    type: String,
    enum: ['basic', 'full'],
    default: 'basic',
  },
  addOns: {
    additionalDriver: { type: Boolean, default: false },
    wifiHotspot: { type: Boolean, default: false },
    roadsideAssistance: { type: Boolean, default: false },
    tireProtection: { type: Boolean, default: false },
    personalAccident: { type: Boolean, default: false },
    theftProtection: { type: Boolean, default: false },
    extendedTheft: { type: Boolean, default: false },
    interiorProtection: { type: Boolean, default: false },
  },

  // Pricing
  pricing: {
    baseDailyRate: { type: Number, required: true },
    cdwCost: { type: Number, default: 0 },
    addOnsCost: { type: Number, default: 0 },
    totalDailyRate: { type: Number, required: true },
    totalCost: { type: Number, required: true },
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'confirmed',
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Generate booking reference before saving
BookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = generateBookingReference();
  }
  this.updatedAt = new Date();
  next();
});

// Validate that booking reference exists after pre-save
BookingSchema.pre('validate', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = generateBookingReference();
  }
  next();
});

// Generate unique booking reference
function generateBookingReference(): string {
  const prefix = 'CAR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Indexes for performance
BookingSchema.index({ email: 1, bookingReference: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ pickupDate: 1 });
BookingSchema.index({ createdAt: -1 });

export default mongoose.models.Booking ||
  mongoose.model('Booking', BookingSchema);
