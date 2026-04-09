import mongoose, { Document, Schema } from 'mongoose';

export interface IInsurancePricing extends Document {
  acrissCode: string; // Full 4-letter ACRISS code (e.g., EDMR, CDMR)
  dailyPrice: number; // Price per day for basic CDW
  fullCoveragePrice?: number; // Optional full coverage price
  basicDeductible?: number; // Deductible amount for basic CDW (e.g., 2500)
  fullDeductible?: number; // Deductible amount for full coverage (e.g., 0)
  currency: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InsurancePricingSchema = new Schema<IInsurancePricing>(
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
    dailyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    fullCoveragePrice: {
      type: Number,
      min: 0,
    },
    basicDeductible: {
      type: Number,
      min: 0,
      default: 0,
    },
    fullDeductible: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const InsurancePricing =
  mongoose.models.InsurancePricing ||
  mongoose.model<IInsurancePricing>('InsurancePricing', InsurancePricingSchema);

export default InsurancePricing;
