import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExternalCarSource {
  // Reference to the booking
  bookingId: mongoose.Types.ObjectId;

  // Reference to the original car that was overbooked
  vehicleId: mongoose.Types.ObjectId;

  // Supplier Information
  supplierType: 'company' | 'person';
  supplierName: string;
  supplierContact: string; // phone or email

  // Pricing
  costFromSupplier: number; // What you pay the supplier
  sellingPrice: number; // What the customer pays (from original booking)
  profitMargin: number; // Auto-calculated: selling - cost
  currency: string;

  // Status
  status: 'pending' | 'arranged' | 'confirmed' | 'cancelled';

  // Additional notes
  notes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  arrangedBy?: mongoose.Types.ObjectId; // User who arranged the external source
}

const ExternalCarSourceSchema = new Schema<IExternalCarSource & Document>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle ID is required'],
      index: true,
    },

    // Supplier Information
    supplierType: {
      type: String,
      enum: ['company', 'person'],
      required: [true, 'Supplier type is required'],
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    supplierContact: {
      type: String,
      required: [true, 'Supplier contact is required'],
      trim: true,
    },

    // Pricing
    costFromSupplier: {
      type: Number,
      required: [true, 'Cost from supplier is required'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP', 'HRK'],
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'arranged', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Additional notes
    notes: {
      type: String,
      trim: true,
    },

    // Metadata
    arrangedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate profit margin before saving
ExternalCarSourceSchema.pre('save', function (next) {
  this.profitMargin = this.sellingPrice - this.costFromSupplier;
  next();
});

// Indexes for better performance
ExternalCarSourceSchema.index({ status: 1, createdAt: -1 });
ExternalCarSourceSchema.index({ bookingId: 1, vehicleId: 1 });

const ExternalCarSource: Model<IExternalCarSource & Document> =
  mongoose.models.ExternalCarSource ||
  mongoose.model<IExternalCarSource & Document>('ExternalCarSource', ExternalCarSourceSchema);

export default ExternalCarSource;
