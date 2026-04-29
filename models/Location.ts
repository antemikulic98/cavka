import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  name: string; // e.g., "Zagreb Downtown", "Split Airport"
  type: 'pickup' | 'both'; // pickup only or both pickup/return
  serviceType: 'rental' | 'transfer' | 'both'; // for car rental, transfer service, or both
  city?: string; // e.g., "Zagreb", "Split"
  lat?: number; // GPS latitude for distance calculation
  lng?: number; // GPS longitude for distance calculation
  active: boolean;
  order: number; // for sorting in dropdowns
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['pickup', 'both'],
      default: 'both',
    },
    serviceType: {
      type: String,
      enum: ['rental', 'transfer', 'both'],
      default: 'both',
    },
    city: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Location =
  mongoose.models.Location ||
  mongoose.model<ILocation>('Location', LocationSchema);

export default Location;
