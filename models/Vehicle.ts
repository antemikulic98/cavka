import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVehicle extends Document {
  // Basic Information
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;

  // ACRISS Classification (new schema)
  acrissCode: string;
  category: string; // Can be ACRISS code (M, E, C, I, S, F, P, L, X) or full name (backward compatibility)
  bodyType?: string; // ACRISS body type code (B, C, D, W, V, L, S, T, F, J, P, X)
  transmission: string; // ACRISS transmission code (M, A) or full name (Manual, Automatic)
  fuelAirCon?: string; // ACRISS fuel/air con code (R, N, H, L, X)

  // Backward compatibility - old schema fields
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  airConditioning?: boolean;

  // Capacity & Features (new schema)
  passengerCapacity: number;
  doorCount: number;
  bigSuitcases?: number;
  smallSuitcases?: number;

  // Backward compatibility - old schema field
  luggageCapacity?: number; // in liters

  features: string[];

  // Images
  images: string[]; // Array of image URLs
  mainImage: string; // Primary image URL

  // Pricing
  dailyRate: number;
  currency: string;

  // Availability & Status
  status: 'Available' | 'Booked' | 'Maintenance' | 'Inactive';
  location: string; // Base location

  // Description
  description?: string;

  // Custom Pricing
  customPricing?: {
    date: string; // YYYY-MM-DD format
    price: number;
    label?: string;
    type?: string;
  }[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  addedBy: mongoose.Types.ObjectId; // Reference to User who added the car
}

const VehicleSchema = new Schema<IVehicle>(
  {
    // Basic Information
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1980,
      max: new Date().getFullYear() + 1,
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // ACRISS Classification (backward compatible)
    acrissCode: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    bodyType: {
      type: String,
      trim: true,
    },
    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      trim: true,
    },
    fuelAirCon: {
      type: String,
      trim: true,
    },

    // Backward compatibility - old schema fields
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      trim: true,
    },
    airConditioning: {
      type: Boolean,
    },

    // Capacity & Features
    passengerCapacity: {
      type: Number,
      required: [true, 'Passenger capacity is required'],
      min: 1,
      max: 9,
    },
    doorCount: {
      type: Number,
      required: [true, 'Door count is required'],
      min: 2,
      max: 5,
    },
    bigSuitcases: {
      type: Number,
      min: 0,
      max: 10,
    },
    smallSuitcases: {
      type: Number,
      min: 0,
      max: 10,
    },

    // Backward compatibility - old schema field
    luggageCapacity: {
      type: Number,
      min: 0,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],

    // Images
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    mainImage: {
      type: String,
      trim: true,
    },

    // Pricing
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP', 'HRK'],
    },

    // Availability & Status
    status: {
      type: String,
      default: 'Available',
      enum: ['Available', 'Booked', 'Maintenance', 'Inactive'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // Description
    description: {
      type: String,
      trim: true,
    },

    // Custom Pricing
    customPricing: [
      {
        date: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        label: {
          type: String,
          default: 'Custom Price',
        },
        type: {
          type: String,
          default: 'custom',
        },
      },
    ],

    // Metadata
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
VehicleSchema.index({ status: 1, location: 1 });
VehicleSchema.index({ category: 1, dailyRate: 1 });
VehicleSchema.index({ make: 1, model: 1, year: 1 });

// Virtual for full vehicle name
VehicleSchema.virtual('fullName').get(function (this: IVehicle) {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for daily rate formatted
VehicleSchema.virtual('formattedDailyRate').get(function (this: IVehicle) {
  return `${this.dailyRate} ${this.currency}`;
});

// Ensure virtual fields are serialized
VehicleSchema.set('toJSON', {
  virtuals: true,
});

const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
