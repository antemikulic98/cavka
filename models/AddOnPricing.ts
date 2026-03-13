import mongoose, { Document, Schema } from 'mongoose';

export interface IAddOnPricing extends Document {
  acrissCode: string; // Full 4-letter ACRISS code (e.g., EDMR, CDMR)

  // Add-on prices (all per day)
  additionalDriver?: number;
  wifiHotspot?: number;
  roadsideAssistance?: number;
  tireProtection?: number;
  personalAccident?: number;
  theftProtection?: number;
  extendedTheft?: number;
  interiorProtection?: number;

  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddOnPricingSchema = new Schema<IAddOnPricing>(
  {
    acrissCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 4,
      index: true,
    },
    additionalDriver: {
      type: Number,
      min: 0,
      default: 4.75,
    },
    wifiHotspot: {
      type: Number,
      min: 0,
      default: 4.6,
    },
    roadsideAssistance: {
      type: Number,
      min: 0,
      default: 1.2,
    },
    tireProtection: {
      type: Number,
      min: 0,
      default: 1.99,
    },
    personalAccident: {
      type: Number,
      min: 0,
      default: 2.39,
    },
    theftProtection: {
      type: Number,
      min: 0,
      default: 5.99,
    },
    extendedTheft: {
      type: Number,
      min: 0,
      default: 10.95,
    },
    interiorProtection: {
      type: Number,
      min: 0,
      default: 2.1,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
  },
  {
    timestamps: true,
  }
);

const AddOnPricing =
  mongoose.models.AddOnPricing ||
  mongoose.model<IAddOnPricing>('AddOnPricing', AddOnPricingSchema);

export default AddOnPricing;
